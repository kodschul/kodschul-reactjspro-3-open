# Modul 1 — Übungen

> Aufgabe für alle Übungen: Bestehenden Code analysieren — was würde React 19 hier verbessern, was nicht?

---

## Übung 1.1 — Code Review: useTransition einbauen

### Ausgangslage

Eine Suchkomponente filtert eine grosse Liste mit 5000 Einträgen. Bei jedem Tastendruck friert die Eingabe für einige Hundert Millisekunden ein.

```tsx
function ProductSearch({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Suchen..."
      />
      <ul>
        {filtered.map(p => <ProductRow key={p.id} product={p} />)}
      </ul>
    </div>
  );
}
```

### Aufgaben

1. Identifiziere warum die Eingabe blockiert wird
2. Baue `useTransition` ein, sodass das Tippen flüssig bleibt
3. Zeige während der Filterung einen subtilen Lade-Indikator an
4. Erkläre in einem Satz: warum hilft `useTransition` hier konkret?

---

## Übung 1.2 — Legacy-Code analysieren

### Ausgangslage

Diese Komponente wurde 2022 geschrieben. Das Team möchte wissen welche Stellen mit React 19 anders gelöst werden könnten.

```tsx
import { useState, useEffect, useMemo, useCallback } from 'react';

function UserDashboard({ userId, filter }: { userId: string; filter: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    ]).then(([userData, postsData]) => {
      setUser(userData);
      setPosts(postsData);
      setIsLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    setFilteredPosts(
      posts.filter(p => p.title.toLowerCase().includes(filter.toLowerCase()))
    );
  }, [posts, filter]);

  const totalLikes = useMemo(
    () => filteredPosts.reduce((sum, p) => sum + p.likes, 0),
    [filteredPosts]
  );

  const handleRefresh = useCallback(() => {
    fetch(`/api/users/${userId}/refresh`, { method: 'POST' });
  }, [userId]);

  if (isLoading) return <Spinner />;

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

### Aufgaben

1. Liste alle Stellen auf, an denen React 19 oder moderne Patterns Verbesserungen bringen würden
2. Notiere zu jeder Stelle: was ist das Problem und was ist die Lösung?
3. Markiere welche Optimierungen der React Compiler übernehmen würde
4. Welche Probleme löst React 19 NICHT in diesem Code?

---

## Übung 1.3 — React Compiler vs. manuelle Optimierung

### Ausgangslage

```tsx
function ExpensiveList({ items, onSelect }: Props) {
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.priority - b.priority),
    [items]
  );

  const handleClick = useCallback(
    (id: string) => {
      onSelect(id);
      analytics.track('item_selected', { id });
    },
    [onSelect]
  );

  const renderedCount = useMemo(
    () => sortedItems.length,
    [sortedItems]
  );

  return (
    <div>
      <p>Insgesamt: {renderedCount} Items</p>
      {sortedItems.map(item => (
        <ItemRow key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

### Aufgaben

1. Markiere für jede Memoisierung (`useMemo`, `useCallback`) ob sie:
   - Vom React Compiler übernommen würde
   - Auch ohne Compiler überflüssig wäre
   - Auch mit Compiler sinnvoll bleibt
2. Wie würde der Code aussehen wenn man ihn ohne manuelle Memoisierung schreiben würde?
3. Welche Voraussetzung muss erfüllt sein damit der Compiler optimieren kann?

---

## Übung 1.4 — use() richtig einsetzen

### Ausgangslage

Die Komponente lädt die Profildaten eines Nutzers:

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser);
  }, [userId]);

  if (!user) return <Spinner />;
  return <h1>{user.name}</h1>;
}
```

### Aufgaben

1. Schreibe die Komponente so um, dass sie `use()` und `Suspense` verwendet
2. Wo muss das Promise erzeugt werden, damit der Fetch nicht bei jedem Render neu startet?
3. Warum ist die `use()`-Variante eleganter aber nicht trivial einzusetzen?
4. Welche Bibliothek würdest du im Alltag stattdessen empfehlen?

---

## Übung 1.5 — Document Metadata einbauen

### Ausgangslage

Eine Produktseite soll für SEO einen passenden `<title>` und eine `<meta description>` setzen. Bisher wurde das mit `react-helmet` gemacht.

```tsx
import { Helmet } from 'react-helmet';

function ProductPage({ product }: { product: Product }) {
  return (
    <>
      <Helmet>
        <title>{product.name} — Mein Shop</title>
        <meta name="description" content={product.shortDescription} />
      </Helmet>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </>
  );
}
```

### Aufgaben

1. Schreibe die Komponente so um, dass sie die React 19 Document Metadata Funktion nutzt
2. Welcher Vorteil ergibt sich gegenüber `react-helmet`?
3. Funktioniert das auch in Server Components?
