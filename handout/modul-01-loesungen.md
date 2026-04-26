# Modul 1 — Lösungen

---

## Lösung 1.1 — useTransition einbauen

```tsx
import { useState, useTransition } from 'react';

function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(products);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // Dringend: Input-Feld reagiert sofort
    setQuery(value);

    // Nicht dringend: teures Filtern darf unterbrochen werden
    startTransition(() => {
      setFilteredItems(
        products.filter(p =>
          p.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    });
  }

  return (
    <div>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Suchen..."
      />
      {isPending && <span style={{ opacity: 0.5 }}>Filtern...</span>}
      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {filteredItems.map(p => <ProductRow key={p.id} product={p} />)}
      </ul>
    </div>
  );
}
```

### Erklärung in einem Satz

useTransition trennt das dringende Update (Input-Wert) vom nicht-dringenden Update (gefilterte Liste). React kann den teuren Render unterbrechen wenn der Nutzer weitertippt, statt ihn synchron blockierend zu Ende zu führen.

---

## Lösung 1.2 — Legacy-Code analysieren

### Identifizierte Probleme

```tsx
// Problem 1: Manueller Loading State + Doppel-Fetch in useEffect
// -> Loesung: react-query oder use() mit Suspense
useEffect(() => {
  setIsLoading(true);
  Promise.all([...]).then(...);
}, [userId]);

// Problem 2: Derived State in einem Effect
// -> Loesung: direkt im Render berechnen
useEffect(() => {
  setFilteredPosts(posts.filter(...));
}, [posts, filter]);

// Problem 3: useMemo fuer einfache Berechnung
// -> Loesung: React Compiler uebernimmt das
const totalLikes = useMemo(...);

// Problem 4: useCallback fuer Funktion ohne stabile Konsumenten
// -> Loesung: React Compiler uebernimmt das
const handleRefresh = useCallback(...);
```

### Modernisierte Version

```tsx
import { useQuery } from '@tanstack/react-query';

function UserDashboard({ userId, filter }: { userId: string; filter: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => r.json()),
  });

  const { data: posts = [], isPending } = useQuery({
    queryKey: ['posts', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/posts`, { signal }).then(r => r.json()),
  });

  // Derived State direkt im Render
  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(filter.toLowerCase())
  );

  // Compiler optimiert das automatisch
  const totalLikes = filteredPosts.reduce((sum, p) => sum + p.likes, 0);

  function handleRefresh() {
    fetch(`/api/users/${userId}/refresh`, { method: 'POST' });
  }

  if (isPending) return <Spinner />;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Total Likes: {totalLikes}</p>
      <button onClick={handleRefresh}>Aktualisieren</button>
      <ul>{filteredPosts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}
```

### Was React 19 NICHT löst

- Falscher Komponentenschnitt: die Komponente macht zu viele Dinge, der Compiler ändert daran nichts
- Fehlendes Error-Handling für die Fetches
- Race Conditions wenn die Fetches manuell gemacht werden — react-query löst das, der Compiler nicht
- Fehlendes Cleanup beim Unmount (vor allem ohne react-query)

---

## Lösung 1.3 — React Compiler vs. manuelle Optimierung

### Bewertung der Memoisierungen

```tsx
// useMemo fuer sortedItems
// -> Compiler uebernimmt das automatisch
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.priority - b.priority),
  [items]
);

// useCallback fuer handleClick
// -> Compiler uebernimmt das automatisch
const handleClick = useCallback(...);

// useMemo fuer renderedCount
// -> Sinnlos: ist nur sortedItems.length, das ist trivial
// -> Auch ohne Compiler ueberfluessig
const renderedCount = useMemo(
  () => sortedItems.length,
  [sortedItems]
);
```

### Version ohne manuelle Memoisierung

```tsx
function ExpensiveList({ items, onSelect }: Props) {
  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  function handleClick(id: string) {
    onSelect(id);
    analytics.track('item_selected', { id });
  }

  return (
    <div>
      <p>Insgesamt: {sortedItems.length} Items</p>
      {sortedItems.map(item => (
        <ItemRow key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

### Voraussetzung für den Compiler

Der Code muss den Rules of React folgen: reine Funktionen, keine Mutation von Props, keine Seiteneffekte im Render. Der Compiler optimiert nur Code der diese Regeln einhält.

---

## Lösung 1.4 — use() richtig einsetzen

### Mit use() und Suspense

```tsx
import { use, Suspense } from 'react';

// Promise wird AUSSERHALB der Komponente erzeugt
// damit es nicht bei jedem Render neu startet
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// Parent erzeugt das Promise und uebergibt es
function UserPage({ userId }: { userId: string }) {
  // useMemo damit das Promise stabil bleibt
  const userPromise = useMemo(
    () => fetch(`/api/users/${userId}`).then(r => r.json()),
    [userId]
  );

  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### Warum nicht trivial einsetzbar

Promises müssen ausserhalb der Komponente die `use()` aufruft erzeugt werden, sonst startet bei jedem Render ein neuer Fetch. Cache-Verwaltung, Error-Handling und Refetch sind nicht eingebaut. Die Praxis: meist nutzt man `use()` zusammen mit einem Framework wie Next.js oder einer Library wie react-query.

### Empfehlung im Alltag

react-query. Es löst dieselben Probleme strukturell und bringt Caching, Race-Condition-Schutz, Retry und Refetch out of the box mit.

---

## Lösung 1.5 — Document Metadata

### Mit React 19 Document Metadata

```tsx
function ProductPage({ product }: { product: Product }) {
  return (
    <>
      <title>{product.name} — Mein Shop</title>
      <meta name="description" content={product.shortDescription} />
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </>
  );
}
```

### Vorteile gegenüber react-helmet

- Keine externe Abhängigkeit nötig
- Funktioniert nativ mit Server Components
- React hebt die Tags automatisch in den `<head>`
- Doppelte Tags werden dedupliziert

### Server Components

Ja, funktioniert in Server Components ohne weitere Konfiguration. Bei Next.js gibt es zusätzlich die Metadata API (`export const metadata = ...`), die für SEO oft die bessere Wahl ist da sie zur Build-Zeit ausgewertet wird.
