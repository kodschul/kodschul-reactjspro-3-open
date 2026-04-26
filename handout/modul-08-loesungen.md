# Modul 8 — Lösungen

---

## Lösung 8.1 — Naiven Code zu react-query migrieren

### Custom Hook

```tsx
import { useQuery } from '@tanstack/react-query';

function useOrders(userId: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/orders`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      // Bei 404 nicht wiederholen
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
  });
}
```

### Komponente

```tsx
function OrderHistory({ userId }: { userId: string }) {
  const { data: orders, isPending, error, isRefetching } = useOrders(userId);

  if (isPending) return <Spinner />;
  if (error)     return <ErrorView error={error} />;

  return (
    <div>
      {isRefetching && <RefreshIndicator />}
      <OrderList orders={orders} />
    </div>
  );
}
```

### Strukturelle Probleme behoben

1. **Race Condition**: Das `signal` wird automatisch durch react-query verwaltet. Bei wechselndem `userId` werden alte Anfragen abgebrochen.
2. **Kein Refetch**: react-query refetched automatisch bei Window-Focus, Reconnect und nach `staleTime` Ablauf.

### Hintergrund-Refresh sichtbar machen

`isRefetching` ist true wenn ein Hintergrund-Refetch läuft, während `data` weiterhin verfügbar ist. Im Gegensatz dazu ist `isPending` nur true wenn überhaupt noch keine Daten geladen wurden. Damit kann ein dezenter Indikator angezeigt werden ohne den Inhalt zu ersetzen.

---

## Lösung 8.2 — Mutation mit Cache-Update

### Migrierte Komponente

```tsx
function CommentEditor({ commentId, postId }: Props) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (newText: string) =>
      fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ text: newText }),
      }).then(r => {
        if (!r.ok) throw new Error('Speichern fehlgeschlagen');
        return r.json();
      }),

    onSuccess: (updatedComment) => {
      // Detail-Cache direkt mit der Server-Antwort befüllen
      queryClient.setQueryData(['comment', commentId], updatedComment);

      // Liste invalidieren — react-query laedt sie beim naechsten Bedarf neu
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => mutate(text)} disabled={isPending}>
        {isPending ? 'Wird gespeichert...' : 'Speichern'}
      </button>
    </div>
  );
}
```

### setQueryData vs. invalidateQueries

```
setQueryData:
  Schreibt direkt in den Cache. Kein neuer Fetch.
  Ideal wenn die Server-Antwort bereits den vollstaendigen neuen State enthaelt.

invalidateQueries:
  Markiert eine Query als veraltet. Beim naechsten Bedarf wird neu geladen.
  Ideal wenn man nicht den vollstaendigen neuen State hat oder
  wenn mehrere abgeleitete Queries betroffen sein koennten.
```

Wenn die Mutation den vollständigen aktualisierten Datensatz zurückgibt, ist `setQueryData` performanter (kein zusätzlicher Request). Bei der Liste war hingegen nur ein einzelner Eintrag aktualisiert — `invalidateQueries` ist hier einfacher als die Liste manuell zu patchen.

---

## Lösung 8.3 — Abhängige Queries

### Implementation

```tsx
function useUserOrders() {
  const userQuery = useQuery({
    queryKey: ['user', 'me'],
    queryFn: ({ signal }) =>
      fetch('/api/users/me', { signal }).then(r => r.json()),
  });

  const ordersQuery = useQuery({
    queryKey: ['orders', userQuery.data?.accountId],
    queryFn: ({ signal }) =>
      fetch(`/api/accounts/${userQuery.data!.accountId}/orders`, { signal })
        .then(r => r.json()),

    // Die zweite Query laeuft erst wenn die erste erfolgreich ist
    enabled: !!userQuery.data?.accountId,
  });

  return {
    user: userQuery.data,
    orders: ordersQuery.data,
    isPending: userQuery.isPending || ordersQuery.isPending,
    error: userQuery.error ?? ordersQuery.error,
  };
}
```

### Fehlerbehandlung in der ersten Query

Wenn die erste Query fehlschlägt, wird die zweite gar nicht erst gestartet (durch `enabled: false`). Der Fehler wird über `userQuery.error` weitergereicht und kann von der Komponente angezeigt werden.

### Parallele Queries

Wenn beide Queries unabhängig wären, würden sie parallel starten:

```tsx
function useDashboard() {
  const userQuery   = useQuery({ queryKey: ['user'],   queryFn: fetchUser });
  const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  return {
    user: userQuery.data,
    orders: ordersQuery.data,
    isPending: userQuery.isPending || ordersQuery.isPending,
  };
}
```

Beide Queries starten gleichzeitig beim Mount der Komponente. Das ist schneller als sequenziell, setzt aber voraus dass die zweite Query nicht vom Ergebnis der ersten abhängt.

---

## Lösung 8.4 — Optimistic Update mit Rollback

### Mit Optimistic Update

```tsx
function TaskItem({ task }: { task: Task }) {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (completed: boolean) =>
      fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      }).then(r => {
        if (!r.ok) throw new Error('Update fehlgeschlagen');
        return r.json();
      }),

    onMutate: async (completed) => {
      // Laufende Refetches abbrechen
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Vorherigen Stand sichern
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistisch aktualisieren
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map(t => t.id === task.id ? { ...t, completed } : t)
      );

      return { previousTasks };
    },

    onError: (err, completed, context) => {
      // Rollback
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },

    onSettled: () => {
      // Mit Server abgleichen
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <label>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={e => mutate(e.target.checked)}
      />
      {task.title}
    </label>
  );
}
```

### Mehrere parallele Mutations

Solange jede Mutation auf einen anderen Task wirkt, ist das unproblematisch. `onMutate` sichert für jede Mutation individuell den vorherigen State. Wichtig ist `cancelQueries` — damit werden gleichzeitig laufende Refetches gestoppt, sodass sie die optimistischen Updates nicht überschreiben.

Wenn mehrere Mutationen denselben Task betreffen, gewinnt die letzte. Das ist meist akzeptabel.

### onSettled mit invalidateQueries

Setzen ist sicherer. Es stellt sicher dass nach Abschluss aller Mutations der Cache mit dem Server abgeglichen wird. Falls der Server abweicht (z.B. wegen einer Race Condition zwischen mehreren Tabs), wird der Cache korrigiert.

Weglassen wäre nur dann sinnvoll wenn man absolut sicher ist dass die Server-Antwort und der lokale Cache deckungsgleich bleiben — was selten zutrifft.

---

## Lösung 8.5 — Suchfunktion mit Debouncing

### Debounce-Hook

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

### Such-Komponente

```tsx
function LiveSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isPending, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ signal }) =>
      fetch(`/api/search?q=${debouncedQuery}`, { signal })
        .then(r => r.json()),
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000, // Ergebnisse 5 Minuten als frisch behalten
  });

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Suchen..."
      />
      {isPending && debouncedQuery.length > 0 && <Spinner />}
      {error && <p>Fehler beim Suchen</p>}
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}
```

### Warum Debouncing trotz Deduplication

react-query dedupliziert nur identische Requests die parallel laufen. Beim Tippen entstehen aber unterschiedliche Query-Keys: `['search', 'a']`, `['search', 'ab']`, `['search', 'abc']`. Das sind verschiedene Queries — alle würden ohne Debouncing tatsächlich Requests auslösen.

Debouncing reduziert die Anzahl der Query-Keys von "einer pro Tastendruck" auf "einer nach Schreibpause".

### staleTime für Cache-Priorisierung

Mit `staleTime: 5 * 60 * 1000` werden zurückkehrende Queries (z.B. wenn der Nutzer "abc" wieder zu "ab" verkürzt) sofort aus dem Cache bedient ohne Refetch. Erst nach 5 Minuten würde react-query die Daten als veraltet betrachten und neu laden.

---

## Lösung 8.6 — Refactor von komplexem Legacy-Code

### Probleme im Originalcode

```
1. Manuelle Race-Condition-Behandlung mit cancelled-Flag
2. Drei Datenquellen vermischt — schwer zu testen
3. refreshStats nutzt fetch direkt, kein Caching
4. window.location.reload-aehnliches Verhalten in vielen Faellen unterschwellig
5. Kein Refetch bei Fokus, kein staleTime
6. Loading-State fuer alle drei Quellen kombiniert (kein granularer Loading)
7. Error-Handling nur fuer den initialen Fetch, refreshStats hat keines
8. Type-Safety durch Non-Null-Assertions geschwaecht
```

### Aufgeteilte Hooks

```tsx
function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}`, { signal }).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

function useReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}/reviews`, { signal }).then(r => r.json()),
    staleTime: 60 * 1000,
  });
}

function useStats(productId: string) {
  return useQuery({
    queryKey: ['stats', productId],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${productId}/stats`, { signal }).then(r => r.json()),
    staleTime: 30 * 1000,
  });
}
```

### Komponente

```tsx
function ProductDashboard({ productId }: { productId: string }) {
  const queryClient = useQueryClient();

  const productQuery = useProduct(productId);
  const reviewsQuery = useReviews(productId);
  const statsQuery   = useStats(productId);

  function refreshStats() {
    queryClient.invalidateQueries({ queryKey: ['stats', productId] });
  }

  if (productQuery.isPending) return <Spinner />;
  if (productQuery.error) return <ErrorView error={productQuery.error} />;
  if (!productQuery.data) return null;

  return (
    <div>
      <ProductHeader product={productQuery.data} />
      <StatsPanel
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        isRefreshing={statsQuery.isFetching}
        onRefresh={refreshStats}
      />
      <ReviewsList
        reviews={reviewsQuery.data ?? []}
        isLoading={reviewsQuery.isPending}
      />
    </div>
  );
}
```

### refreshStats als Mutation oder Refetch

Hier ist `invalidateQueries` (manueller Refetch) die bessere Wahl. Begründung:

- Es ist keine Schreiboperation — der Server-Zustand ändert sich nicht durch das Refresh
- react-query hat das Konzept von Cache-Invalidierung genau dafür
- `useMutation` wäre für eine echte Server-Operation gedacht (z.B. "Statistiken neu berechnen lassen")

Wäre der `?refresh=true`-Parameter ein echter Server-Trigger der die Statistiken neu berechnet, könnte man das als Mutation modellieren und im `onSuccess` den Cache aktualisieren.
