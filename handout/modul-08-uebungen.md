# Modul 8 — Übungen

> Aufgabe für alle Übungen: API-Handling von naiv zu robust umbauen

---

## Übung 8.1 — Naiven Code zu react-query migrieren

### Ausgangslage

```tsx
function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/users/${userId}/orders`)
      .then(r => {
        if (!r.ok) throw new Error('Fehler beim Laden');
        return r.json();
      })
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <Spinner />;
  if (error) return <p>Fehler: {error.message}</p>;
  return <OrderList orders={orders} />;
}
```

### Aufgaben

1. Schreibe einen Custom Hook `useOrders(userId)` mit react-query
2. Behebe gleichzeitig zwei strukturelle Probleme im ursprünglichen Code (Race Condition, kein Refetch)
3. Konfiguriere staleTime und Retry-Verhalten sinnvoll
4. Wie zeigst du visuell an dass im Hintergrund gerade aktualisiert wird?

---

## Übung 8.2 — Mutation mit Cache-Update

### Ausgangslage

Eine Komponente bearbeitet einen Kommentar. Nach dem Speichern lädt die Liste neu.

```tsx
function CommentEditor({ commentId, postId }: Props) {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    });
    setIsSaving(false);
    window.location.reload(); // hart
  }

  return (
    <div>
      <textarea value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleSave} disabled={isSaving}>Speichern</button>
    </div>
  );
}
```

### Aufgaben

1. Migriere den Save-Vorgang auf `useMutation`
2. Aktualisiere den Cache der Detailansicht direkt mit der Server-Antwort
3. Invalidiere zusätzlich die Liste der Kommentare des Posts
4. Was ist der Unterschied zwischen `setQueryData` und `invalidateQueries` und wann nutzt man was?

---

## Übung 8.3 — Abhängige Queries

### Aufgabe

Baue einen Hook der für einen gegebenen Nutzer dessen Bestellungen lädt:

- Erst muss der Nutzer geladen werden (`/api/users/me`)
- Aus dem Nutzer wird die `accountId` gelesen
- Mit der `accountId` werden dann die Bestellungen geladen (`/api/accounts/{id}/orders`)
- Die zweite Query darf erst starten wenn die erste fertig und erfolgreich ist

### Aufgaben

1. Implementiere zwei `useQuery` Aufrufe die korrekt aufeinander warten
2. Nutze `enabled` um die zweite Query zu steuern
3. Wie geht der Hook mit einem Fehler in der ersten Query um?
4. Wie würde sich der Code unterscheiden wenn beide Queries parallel laufen könnten?

---

## Übung 8.4 — Optimistic Update mit Rollback

### Ausgangslage

Eine Aufgabenliste mit Häkchen. Aktuell aktualisiert sich der Haken erst wenn der Server geantwortet hat — gefühlt langsam.

```tsx
function TaskItem({ task }: { task: Task }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (completed: boolean) =>
      fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <label>
      <input
        type="checkbox"
        checked={task.completed}
        disabled={isPending}
        onChange={e => mutate(e.target.checked)}
      />
      {task.title}
    </label>
  );
}
```

### Aufgaben

1. Baue Optimistic Updates ein — der Haken reagiert sofort
2. Implementiere ein korrektes Rollback bei Fehlern
3. Was passiert wenn mehrere Tasks gleichzeitig getoggled werden während noch eine Anfrage läuft?
4. Würdest du `onSettled` mit `invalidateQueries` setzen oder weglassen? Begründe.

---

## Übung 8.5 — Suchfunktion mit Debouncing

### Aufgabe

Baue eine Live-Suche mit folgenden Anforderungen:

- Suchfeld ruft beim Tippen die API auf (`/api/search?q={query}`)
- Aufrufe werden um 300ms debounced
- Caching pro Query-String — wenn der Nutzer "abc" schreibt, dann zurück auf "ab" geht, soll das Ergebnis aus dem Cache kommen
- Bei leerer Eingabe wird nicht gesucht
- Ergebnisliste zeigt Loading-State und Fehler

### Aufgaben

1. Implementiere einen `useDebounce`-Hook
2. Nutze ihn in Kombination mit `useQuery`
3. Warum ist Debouncing hier wichtig obwohl react-query bereits dedupliziert?
4. Wie konfigurierst du `staleTime` damit gecachte Ergebnisse priorisiert werden?

---

## Übung 8.6 — Refactor von komplexem Legacy-Code

### Ausgangslage

```tsx
function ProductDashboard({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/products/${productId}`).then(r => r.json()),
      fetch(`/api/products/${productId}/reviews`).then(r => r.json()),
      fetch(`/api/products/${productId}/stats`).then(r => r.json()),
    ])
      .then(([p, r, s]) => {
        if (!cancelled) {
          setProduct(p);
          setReviews(r);
          setStats(s);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [productId]);

  async function refreshStats() {
    const res = await fetch(`/api/products/${productId}/stats?refresh=true`);
    const newStats = await res.json();
    setStats(newStats);
  }

  if (isLoading) return <Spinner />;
  if (error) return <p>Fehler: {error}</p>;

  return (
    <div>
      <ProductHeader product={product!} />
      <StatsPanel stats={stats!} onRefresh={refreshStats} />
      <ReviewsList reviews={reviews} />
    </div>
  );
}
```

### Aufgaben

1. Identifiziere alle Probleme des aktuellen Codes
2. Schreibe die Komponente komplett mit react-query um
3. Trenne in mehrere Custom Hooks pro Datenquelle
4. Implementiere `refreshStats` als Mutation oder als manuellen Refetch — was ist passender?
