# Modul 1: React 19 verstehen und sinnvoll einordnen

---

## Lab 1.1 — React 18 als Fundament

### useTransition in der Praxis

```tsx
import { useState, useTransition } from 'react'

function ProductFilter() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    // Dringend: Input reagiert sofort
    setQuery(e.target.value);

    // Nicht dringend: teures Filtern
    startTransition(() => {
      setResults(filterBigList(e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <List items={results} />
    </>
  );
}
```

---

## Lab 1.2 — Neuerungen in React 19

### use() — Promises direkt im Render

```tsx
import { use, Suspense } from 'react'

function UserProfile({ userPromise }) {
  // Liest das Promise — suspendet bis resolved
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// Nutzung mit Suspense-Boundary:
<Suspense fallback={<Spinner />}>
  <UserProfile userPromise={fetchUser(id)} />
</Suspense>
```

### Actions — async in startTransition

```tsx
import { useActionState } from 'react'

async function updateNameAction(prev, formData) {
  const name = formData.get('name');
  const err = await saveName(name);
  if (err) return err;
  return null;
}

function NameForm() {
  const [error, submit, pending] =
    useActionState(updateNameAction, null);

  return (
    <form action={submit}>
      <input name="name" />
      <button disabled={pending}>Save</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

---

## Lab 1.3 — React Compiler und moderne Formularkonzepte

### Vorher — manuelle Memoization

```tsx
function ProductList({ products, q }) {
  const filtered = useMemo(
    () => products.filter(p =>
      p.name.includes(q)),
    [products, q]
  );

  const onClick = useCallback(
    (id) => trackClick(id), []
  );

  return <Grid items={filtered}
               onClick={onClick} />;
}
```

### Nachher — mit React Compiler

```tsx
function ProductList({ products, q }) {
  // Compiler erkennt automatisch,
  // was stabil bleiben soll.
  const filtered = products.filter(
    p => p.name.includes(q)
  );

  const onClick = (id) => trackClick(id);

  return <Grid items={filtered}
               onClick={onClick} />;
}
```

---

## Lab 1.4 — Bestehenden Code analysieren

### Typischer Legacy-Code

```tsx
function UserList({ filter }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  // Derived State — gehört nicht in Effect
  useEffect(() => {
    setFiltered(users.filter(
      u => u.name.includes(filter)));
  }, [users, filter]);

  // Race Condition, kein Cleanup
  // Kein Error-Handling
}
```

### Refactor-Ergebnis

```tsx
// 1. Data Fetching via react-query (oder use() + Suspense)
// 2. Derived State direkt im Render
// 3. Keine manuelle Memoization — React Compiler übernimmt

import { useQuery } from '@tanstack/react-query'

function UserList({ filter }) {
  const { data: users = [], isPending, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  // Derived State im Render — keine Sync-Effekte mehr
  const filtered = users.filter(u => u.name.includes(filter));

  if (isPending) return <Spinner />;
  if (error) return <ErrorView err={error} />;

  return <ul>{filtered.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```
