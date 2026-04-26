# Modul 2 — Lösungen

---

## Lösung 2.1 — Derived State entfernen

### Identifikation

`filteredProducts` und `count` sind beide Derived State. Sie lassen sich aus `products`, `searchTerm` und `selectedCategory` direkt berechnen.

### Modernisierte Version

```tsx
function ProductFilter({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Direkt im Render berechnen — kein State, kein Effect
  let filteredProducts = products;
  if (selectedCategory !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Suchen..."
      />
      <select
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
      >
        <option value="all">Alle</option>
        <option value="shoes">Schuhe</option>
        <option value="shirts">Shirts</option>
      </select>
      <p>{filteredProducts.length} Produkte gefunden</p>
      <ul>{filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}
```

### Re-Render-Vergleich

Originalversion bei einer Sucheingabe:
1. setState searchTerm  -> Render 1
2. useEffect läuft, setFilteredProducts -> Render 2
3. setCount im selben Effect -> evtl. Render 3 (oder gebatched)

Neue Version: nur ein Render pro Eingabe. Filterung passiert während des Renders, nicht danach.

---

## Lösung 2.2 — Race Condition beheben

### Welcher Ablauf führt zu falschen Ergebnissen

```
t=0    Nutzer tippt "Berl"  -> Anfrage A startet (langsam)
t=100  Nutzer tippt "Berlin" -> Anfrage B startet (schnell)
t=300  Anfrage B antwortet  -> setResults zeigt Berlin-Treffer
t=500  Anfrage A antwortet  -> setResults ueberschreibt mit Berl-Treffern (falsch!)
```

### Variante 1 — AbortController

```tsx
function CityAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/cities?q=${query}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Stadt eingeben..."
      />
      {isLoading && <span>Lädt...</span>}
      <ul>{results.map(city => <li key={city.id}>{city.name}</li>)}</ul>
    </div>
  );
}
```

### Variante 2 — Ignore-Flag

```tsx
useEffect(() => {
  if (query.length < 2) {
    setResults([]);
    return;
  }

  let ignore = false;
  setIsLoading(true);

  fetch(`/api/cities?q=${query}`)
    .then(r => r.json())
    .then(data => {
      if (!ignore) {
        setResults(data);
        setIsLoading(false);
      }
    });

  return () => { ignore = true; };
}, [query]);
```

### Variante 3 — react-query

```tsx
import { useQuery } from '@tanstack/react-query';

function CityAutocomplete() {
  const [query, setQuery] = useState('');

  const { data: results = [], isPending } = useQuery({
    queryKey: ['cities', query],
    queryFn: ({ signal }) =>
      fetch(`/api/cities?q=${query}`, { signal }).then(r => r.json()),
    enabled: query.length >= 2,
  });

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Stadt eingeben..."
      />
      {isPending && query.length >= 2 && <span>Lädt...</span>}
      <ul>{results.map(city => <li key={city.id}>{city.name}</li>)}</ul>
    </div>
  );
}
```

### Empfehlung

Variante 3 mit react-query. Sie eliminiert die Race Condition strukturell, bringt automatisches Caching, dedupliziert identische Anfragen und kommt mit weniger Code aus.

---

## Lösung 2.3 — Stale Closure debuggen

### Warum der Timer stehenbleibt

Das `setInterval` wird einmal beim Mount aufgesetzt. Die Closure innerhalb von `setInterval` schließt über den `seconds`-Wert von 0 (dem ersten Render). Nach dem ersten Tick wird `setSeconds(0 + 1)` aufgerufen. Bei jedem weiteren Tick wird wieder `setSeconds(0 + 1)` aufgerufen, weil die Closure den initialen Wert "festhält".

### Behoben mit funktionalem Update

```tsx
function PageTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // React uebergibt den aktuellen Wert als Argument
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <p>Sie sind seit {seconds} Sekunden auf dieser Seite</p>;
}
```

### Warum das Problem strukturell gelöst ist

Das funktionale Update braucht nicht auf die geschlossene Variable zuzugreifen. React übergibt den aktuellen State-Wert als Argument an die Update-Funktion. Damit ist die leere Dependency-Liste semantisch korrekt.

### useRef als Alternative

`useRef` wäre legitim wenn man auf andere State-Werte oder Props zugreifen müsste die nicht über funktionales Update verfügbar sind. Beispiel: ein Timer der `props.onTick` aufrufen soll und dabei immer die neueste Funktion nutzen muss.

```tsx
// Legitime useRef Nutzung
function PageTimer({ onTick }: { onTick: (s: number) => void }) {
  const [seconds, setSeconds] = useState(0);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        onTickRef.current(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <p>{seconds}</p>;
}
```

useRef wäre ein Code Smell wenn man es einsetzt um nur die ESLint-Regel zur Dependency-Vollständigkeit zu umgehen. Das ist ein Symptom, kein Heilmittel.

---

## Lösung 2.4 — Komplexer Hook-Bug-Hunt

### Identifizierte Probleme

```
Stelle 1:
  - Race Condition (kein AbortController, kein Ignore-Flag)
  - Derived State (unreadCount aus messages)
  - Kein Error-Handling

Stelle 2:
  - Klassischer Derived-State-in-Effect
  - Verursacht zusaetzlichen Render

Stelle 3:
  - Stale Closure (pollCount + 1 statt prev => prev + 1)
  - Race Condition beim Polling
  - Setzt messages und ueberschreibt eventuell lokale Aenderungen

Stelle 4:
  - Doppelter setState ohne Konsistenz
  - unreadCount muss separat gepflegt werden statt abgeleitet
```

### Komplette Neufassung

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';

function MessageInbox({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/messages/${userId}`, { signal }).then(r => r.json()),
    refetchInterval: 5000, // ersetzt das manuelle Polling
  });

  // Derived State direkt im Render
  const unreadCount = messages.filter(m => !m.read).length;
  const filtered = messages.filter(m => m.text.includes(filter));

  function handleMarkAllRead() {
    // Optimistic Update via react-query
    queryClient.setQueryData(
      ['messages', userId],
      (old: Message[] = []) => old.map(m => ({ ...m, read: true }))
    );
    fetch(`/api/messages/${userId}/read-all`, { method: 'POST' });
  }

  return (
    <div>
      <header>
        <input value={filter} onChange={e => setFilter(e.target.value)} />
        <span>{unreadCount} ungelesen</span>
        <button onClick={handleMarkAllRead}>Alle als gelesen markieren</button>
      </header>
      <ul>{filtered.map(m => <li key={m.id}>{m.text}</li>)}</ul>
    </div>
  );
}
```

### Was der React Compiler löst — und was nicht

| Problem | Compiler |
|---|---|
| Derived State in Effects | Nein, das ist Code-Struktur |
| Race Conditions | Nein, das ist Logik |
| Stale Closures | Nein, der Compiler sieht den Bug nicht |
| Manuelle Memoization | Ja, kann er entfernen |
| Inkonsistente State-Updates | Nein, das ist Architektur |

Der Compiler ist ein Werkzeug für Performance, nicht für Korrektheit. Logik-Bugs muss man weiterhin selbst finden.
