# Modul 2 — Übungen

> Aufgabe für alle Übungen: Buggy Code fixen — Race Condition + falsches Effect

---

## Übung 2.1 — Derived State entfernen

### Ausgangslage

```tsx
function ProductFilter({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [count, setCount] = useState(0);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
    setCount(filtered.length);
  }, [products, searchTerm, selectedCategory]);

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
      <p>{count} Produkte gefunden</p>
      <ul>{filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}
```

### Aufgaben

1. Identifiziere den State der Derived State ist
2. Schreibe die Komponente ohne diese unnötigen States um
3. Wie viele Re-Renders verursacht eine einzelne Sucheingabe in der ursprünglichen Version?
4. Wie viele in deiner Version?

---

## Übung 2.2 — Race Condition beheben

### Ausgangslage

Eine Autocomplete-Komponente schickt bei jedem Tastendruck eine Suchanfrage. Bei schnellem Tippen werden alte Antworten manchmal über neue geschrieben.

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

    setIsLoading(true);
    fetch(`/api/cities?q=${query}`)
      .then(r => r.json())
      .then(data => {
        setResults(data);
        setIsLoading(false);
      });
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Stadt eingeben..."
      />
      {isLoading && <span>Lädt...</span>}
      <ul>
        {results.map(city => <li key={city.id}>{city.name}</li>)}
      </ul>
    </div>
  );
}
```

### Aufgaben

1. Beschreibe konkret welcher Ablauf zu falschen Ergebnissen führt
2. Behebe die Race Condition mit `AbortController`
3. Behebe die Race Condition alternativ mit einem Ignore-Flag
4. Schreibe eine dritte Variante mit react-query
5. Welche Variante würdest du im Alltag wählen und warum?

---

## Übung 2.3 — Stale Closure debuggen

### Ausgangslage

Ein Timer der die seit Seitenaufruf vergangene Zeit anzeigt. Er bleibt bei 1 stehen.

```tsx
function PageTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Aktueller Stand:', seconds);
      setSeconds(seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <p>Sie sind seit {seconds} Sekunden auf dieser Seite</p>;
}
```

### Aufgaben

1. Erkläre warum der Timer stehenbleibt
2. Behebe den Bug mit funktionalem State-Update
3. Erkläre warum das funktionale Update das Problem strukturell löst
4. Wann wäre ein `useRef` hier eine Alternative? Wann wäre es ein Code Smell?

---

## Übung 2.4 — Komplexer Hook-Bug-Hunt

### Ausgangslage

Diese Komponente zeigt vier verschiedene Probleme. Findet alle.

```tsx
function MessageInbox({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('');
  const [filtered, setFiltered] = useState<Message[]>([]);
  const [pollCount, setPollCount] = useState(0);

  // Stelle 1
  useEffect(() => {
    fetch(`/api/messages/${userId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data);
        setUnreadCount(data.filter((m: Message) => !m.read).length);
      });
  }, [userId]);

  // Stelle 2
  useEffect(() => {
    setFiltered(
      messages.filter(m => m.text.includes(filter))
    );
  }, [messages, filter]);

  // Stelle 3
  useEffect(() => {
    const interval = setInterval(() => {
      setPollCount(pollCount + 1);
      fetch(`/api/messages/${userId}/poll`).then(r => r.json()).then(setMessages);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Stelle 4
  function handleMarkAllRead() {
    setMessages(messages.map(m => ({ ...m, read: true })));
    setUnreadCount(0);
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

### Aufgaben

1. Identifiziere zu jeder markierten Stelle das Problem
2. Schreibe die Komponente komplett neu mit allen Fixes
3. Welche Probleme würde der React Compiler lösen? Welche nicht?
