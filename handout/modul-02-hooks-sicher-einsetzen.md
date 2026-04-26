# Modul 2: Hooks sicher einsetzen und typische Fehler vermeiden

---

## Lab 2.1 — useEffect richtig verstehen

### Derived State — der häufigste Fehler

```tsx
// Das ist falsch — zwei separate States mit Effect-Synchronisation
function ProductList({ products, filter }: Props) {
  const [filtered, setFiltered] = useState<Product[]>([]);

  useEffect(() => {
    setFiltered(products.filter(p => p.name.includes(filter)));
  }, [products, filter]);

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

```tsx
// Derived State gehört direkt in den Render
function ProductList({ products, filter }: Props) {
  const filtered = products.filter(p => p.name.includes(filter));

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

```tsx
function ProductList({ products, filter }: Props) {
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filter)),
    [products, filter]
  );

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### Effects sind keine Event-Handler

```tsx
// Falsch — Effect als Reaktion auf ein User-Event
function CheckoutForm() {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      sendOrder();
    }
  }, [submitted]);

  return <button onClick={() => setSubmitted(true)}>Bestellen</button>;
}
```

```tsx
function CheckoutForm() {
  async function handleClick() {
    await sendOrder();
  }

  return <button onClick={handleClick}>Bestellen</button>;
}
```

### Cleanup

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    const connection = createChatConnection(roomId);
    connection.connect();

    return () => {
      connection.disconnect();
    };
  }, [roomId]);
}
```

---

## Lab 2.2 — Race Conditions

### Das kaputte Muster

```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(data => {
        // Wenn query sich geändert hat bevor diese Antwort ankam,
        // werden hier trotzdem veraltete Daten gesetzt
        setResults(data);
      });
  }, [query]);

  return <ResultList items={results} />;
}
```

### Lösung mit AbortController

```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setResults(data))
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => {
      controller.abort();
    };
  }, [query]);

  return <ResultList items={results} />;
}
```

### Lösung mit einem Ignore-Flag

```tsx
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(data => {
        if (!ignore) {
          setResults(data);
        }
      });

    return () => {
      ignore = true;
    };
  }, [query]);

  return <ResultList items={results} />;
}
```

### Lösung mit react-query

```tsx
import { useQuery } from '@tanstack/react-query';

function SearchResults({ query }: { query: string }) {
  const { data: results = [], isPending } = useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) =>
      fetch(`/api/search?q=${query}`, { signal }).then(r => r.json()),
  });

  if (isPending) return <Spinner />;
  return <ResultList items={results} />;
}
```

### Inkonsistenter State aus mehreren Updates

```tsx
// Zwei separate Updates können zu einem inkonsistenten Zwischenrender führen
useEffect(() => {
  fetchUser(id).then(user => {
    setUser(user);
    setPermissions(user.permissions);
  });
}, [id]);

// Besser: einen zusammengesetzten State oder useReducer verwenden
useEffect(() => {
  fetchUser(id).then(user => {
    setUserState({ user, permissions: user.permissions });
  });
}, [id]);
```

---

## Lab 2.3 — Stale Closures debuggen und useRef einsetzen

### Was eine Stale Closure ist

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // count ist hier eingefroren auf 0 — den Wert beim ersten Render
      console.log(count); // gibt immer 0 aus
      setCount(count + 1); // rechnet immer 0 + 1
    }, 1000);

    return () => clearInterval(interval);
  }, []); // leeres Array bedeutet: Effect läuft einmal, count bleibt 0

  return <div>{count}</div>; // springt nie über 1 hinaus
}
```

### Lösung: Funktionales Update

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>{count}</div>;
}
```

### Lösung: useRef für stabile Callbacks

```tsx
function useLatestCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args: Parameters<T>) => callbackRef.current(...args),
    []
  ) as T;
}

// Einsatz
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const stableOnSearch = useLatestCallback(onSearch);

  useEffect(() => {
    const handler = debounce(stableOnSearch, 300);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

### useRef: legitime Einsatzmuster

```tsx
// DOM-Zugriff
function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// Vorherigen Wert merken
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Mutable Wert ohne Re-Render (Timer-IDs, Zähler die das UI nicht beeinflussen)
function usePollInterval(fn: () => void, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(fn, delay);
    return () => clearTimeout(timerRef.current);
  }, [fn, delay]);
}
```

### useRef als Code Smell erkennen

```tsx
// Warnsignal: Ref wird nur genutzt um Lint-Warnung zu umgehen
function BadComponent({ onUpdate }: { onUpdate: () => void }) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    doSomething();
    onUpdateRef.current();
  }, []);
}

// Warnsignal: Ref als versteckter State mit UI-Wirkung
function AlsoBadComponent() {
  const countRef = useRef(0);

  function handleClick() {
    countRef.current += 1;
    // Das UI aktualisiert sich nicht.
  }
}
```

---

## Lab 2.4 — Fehlerhaften Hook-Code korrigieren

### Beispiel mit vier Problemen

```tsx
function UserDashboard({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewCount, setViewCount] = useState(0);

  // Problem 1: Race Condition, kein AbortController
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => setUser(data));
  }, [userId]);

  // Problem 2: Race Condition, keine Fehlerbehandlung
  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then(r => r.json())
      .then(data => setPosts(data));
  }, [userId]);

  // Problem 3: Derived State in einem Effect
  useEffect(() => {
    setFilteredPosts(
      posts.filter(p => p.title.toLowerCase().includes(searchTerm))
    );
  }, [posts, searchTerm]);

  // Problem 4: Stale Closure — viewCount bleibt bei 1
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount(viewCount + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>{user?.name}</h1>
      <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      <ul>{filteredPosts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}
```

### Die korrigierte Version

```tsx
import { useQuery } from '@tanstack/react-query';

function UserDashboard({ userId }: { userId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewCount, setViewCount] = useState(0);

  // Fix 1 und 2: react-query übernimmt Abort, Caching und Fehlerbehandlung
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => r.json()),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/posts`, { signal }).then(r => r.json()),
  });

  // Fix 3: Direkt im Render berechnen, kein State, kein Effect
  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fix 4: Funktionales Update, kein Closure-Problem
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Views seit Seitenöffnung: {viewCount}</p>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Posts filtern..."
      />
      <ul>{filteredPosts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}
```
