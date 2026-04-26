# Modul 5 — Übungen

> Aufgabe für alle Übungen: "Optimierten" Code analysieren und die Fehler finden

---

## Übung 5.1 — Sinnlose Memoisierung erkennen

### Ausgangslage

```tsx
function ProductCard({ product, onAdd }: Props) {
  const formattedPrice = useMemo(
    () => `${product.price.toFixed(2)} EUR`,
    [product.price]
  );

  const isOnSale = useMemo(
    () => product.discount > 0,
    [product.discount]
  );

  const handleAdd = useCallback(
    () => onAdd(product.id),
    [onAdd, product.id]
  );

  const className = useMemo(
    () => `product-card ${isOnSale ? 'sale' : ''}`,
    [isOnSale]
  );

  return (
    <div className={className}>
      <h3>{product.name}</h3>
      <p>{formattedPrice}</p>
      {isOnSale && <Badge>Sale</Badge>}
      <button onClick={handleAdd}>In den Warenkorb</button>
    </div>
  );
}
```

### Aufgaben

1. Markiere für jede Memoisierung: ist sie sinnvoll, sinnlos, oder schadet sogar?
2. Schreibe die Komponente ohne unnötige Memoisierung
3. Welche dieser Optimierungen würde der React Compiler übernehmen?
4. Wann wäre `useMemo` für `formattedPrice` tatsächlich gerechtfertigt?

---

## Übung 5.2 — Re-Renders analysieren

### Ausgangslage

```tsx
function Dashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <Header user={user} />
      <SearchBar value={search} onChange={setSearch} />
      <FilterDropdown value={filter} onChange={setFilter} />
      <ProductList search={search} filter={filter} />
      <Sidebar />
      <Footer />
    </div>
  );
}
```

### Aufgaben

1. Welche Komponenten rendern wenn der Nutzer einen Buchstaben in `SearchBar` tippt?
2. Welche Komponenten rendern wenn der Nutzer den Filter ändert?
3. Welche Komponenten rendern beim Laden des `user`?
4. Welche dieser Re-Renders sind unnötig und wie würdest du sie beheben?

---

## Übung 5.3 — memo strategisch einsetzen

### Ausgangslage

Die `ProductList` rendert 1000 Items. Jedes Item ist eine teure Komponente. Beim Tippen in einem Suchfeld der Parent-Komponente werden alle 1000 Items neu gerendert obwohl sich die meisten nicht verändert haben.

```tsx
function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState({ showPrices: true });

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ProductList
        products={products}
        config={config}
        onSelect={(id) => console.log(id)}
      />
    </div>
  );
}

function ProductList({ products, config, onSelect }: Props) {
  return (
    <ul>
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          showPrice={config.showPrices}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function ProductCard({ product, showPrice, onSelect }: Props) {
  return (
    <li onClick={() => onSelect(product.id)}>
      <h3>{product.name}</h3>
      {showPrice && <p>{product.price} EUR</p>}
    </li>
  );
}
```

### Aufgaben

1. Erkläre genau warum `memo(ProductCard)` allein hier nichts bringt
2. Identifiziere alle Props die bei jedem Render neue Referenzen bekommen
3. Welche zwei oder drei Änderungen sind nötig, damit `memo` tatsächlich greift?
4. Schreibe die optimierte Version

---

## Übung 5.4 — State nach unten verschieben

### Ausgangslage

```tsx
function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const products = useProducts();
  const filtered = products.filter(p =>
    p.name.includes(searchQuery) &&
    (categoryFilter === 'all' || p.category === categoryFilter)
  );

  return (
    <div>
      <ExpensiveHeader />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
      <ProductGrid products={filtered} />
      <ExpensiveSidebar />
      <ExpensiveFooter />
    </div>
  );
}
```

`ExpensiveHeader`, `ExpensiveSidebar` und `ExpensiveFooter` sind teure Komponenten die nicht von `searchQuery` oder `categoryFilter` abhängen. Trotzdem rendern sie bei jeder Sucheingabe neu.

### Aufgaben

1. Welche Möglichkeiten gibt es um die unnötigen Re-Renders zu vermeiden?
2. Wähle die strukturelle Lösung statt `memo` und schreibe den Code um
3. Wo lebt der State danach?
4. Welche Anpassung muss zusätzlich an `SearchBar` und `CategoryFilter` gemacht werden?

---

## Übung 5.5 — Vermeintlich optimierter Code

### Ausgangslage

Ein Entwickler hat "alle Optimierungen die er kennt" eingebaut. Findet die Probleme.

```tsx
function Dashboard({ userId }: { userId: string }) {
  const [filter, setFilter] = useState('');

  const fetchUser = useCallback(async () => {
    const data = await fetch(`/api/users/${userId}`);
    return data.json();
  }, [userId]);

  const config = useMemo(
    () => ({
      userId,
      timestamp: Date.now(),
    }),
    [userId]
  );

  const handleFilterChange = useCallback(
    (value: string) => setFilter(value),
    []
  );

  const filteredData = useMemo(
    () => someData.filter(d => d.name.includes(filter)),
    [someData, filter]
  );

  const headerProps = useMemo(
    () => ({ title: 'Dashboard', userId }),
    [userId]
  );

  const Footer = useMemo(
    () => <FooterComponent />,
    []
  );

  return (
    <div>
      <Header {...headerProps} />
      <FilterInput onChange={handleFilterChange} />
      <DataTable data={filteredData} config={config} />
      {Footer}
    </div>
  );
}
```

### Aufgaben

1. Identifiziere mindestens fünf Probleme in diesem Code
2. Schreibe die bereinigte Version
3. Welche dieser Probleme hätte ein gut konfiguriertes ESLint-Setup gefangen?
