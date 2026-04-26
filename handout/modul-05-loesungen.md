# Modul 5 — Lösungen

---

## Lösung 5.1 — Sinnlose Memoisierung

### Bewertung

| Memoisierung | Sinnvoll? | Begründung |
|---|---|---|
| `formattedPrice` | Nein | Triviale Operation, useMemo kostet mehr |
| `isOnSale` | Nein | Direktvergleich, keine Berechnung |
| `handleAdd` | Bedingt | Nur sinnvoll wenn ProductCard memoisiert ist |
| `className` | Nein | String-Konkatenation ist trivial |

### Bereinigte Version

```tsx
function ProductCard({ product, onAdd }: Props) {
  const formattedPrice = `${product.price.toFixed(2)} EUR`;
  const isOnSale = product.discount > 0;
  const className = `product-card ${isOnSale ? 'sale' : ''}`;

  return (
    <div className={className}>
      <h3>{product.name}</h3>
      <p>{formattedPrice}</p>
      {isOnSale && <Badge>Sale</Badge>}
      <button onClick={() => onAdd(product.id)}>In den Warenkorb</button>
    </div>
  );
}
```

### React Compiler

Der Compiler übernimmt potenziell alle vier ehemaligen Memoisierungen automatisch — sofern sie überhaupt nötig wären. Bei trivialen Operationen wie `toFixed()` oder Vergleichen ist der Overhead von Memoisierung jedoch grösser als der Gewinn. Der Compiler erkennt das und memoisiert nicht.

### Wann wäre useMemo gerechtfertigt

Wenn `formattedPrice` ein Format wäre, das eine teure Operation involviert:

```tsx
// Sinnvoll: teure Operation
const formattedPrice = useMemo(
  () => formatPriceWithCurrency(product.price, locale, exchangeRates),
  [product.price, locale, exchangeRates]
);
```

---

## Lösung 5.2 — Re-Renders analysieren

### Bei jedem Buchstaben in SearchBar

Es rendern: `Dashboard`, `Header`, `SearchBar`, `FilterDropdown`, `ProductList`, `Sidebar`, `Footer`.

Davon unnötig: `Header`, `FilterDropdown`, `Sidebar`, `Footer`.

### Bei Filter-Änderung

Dieselben Komponenten wie oben — aus demselben Grund: jeder Parent-Render rendert alle Children, sofern sie nicht memoisiert sind.

### Beim Laden des user

Dieselben Komponenten — `setUser` löst einen Render in `Dashboard` aus.

### Wie beheben

1. **State nach unten schieben**: `search` und `filter` in die jeweiligen Sub-Komponenten
2. **Composition nutzen**: stabile Komponenten via children übergeben
3. **memo als letztes Mittel** wenn die ersten beiden Optionen nicht greifen

```tsx
function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div>
      <Header user={user} />
      <ProductFilter />
      <Sidebar />
      <Footer />
    </div>
  );
}

function ProductFilter() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      <FilterDropdown value={filter} onChange={setFilter} />
      <ProductList search={search} filter={filter} />
    </div>
  );
}
```

`Header`, `Sidebar`, `Footer` rendern nicht mehr bei Sucheingaben.

---

## Lösung 5.3 — memo strategisch einsetzen

### Warum memo allein nichts bringt

Auch mit `memo(ProductCard)` rendert die Komponente bei jedem Parent-Render neu, weil die Props bei jedem Render neue Referenzen bekommen:

- `config` ist ein neues Objekt: `{ showPrices: true }`
- `onSelect` ist eine neue Funktion: `(id) => console.log(id)`

`memo` macht einen flachen Vergleich der Props. Neue Referenzen = "Props haben sich geändert" = Re-Render trotz `memo`.

### Props mit neuen Referenzen pro Render

```
config       — neues Objekt bei jedem App-Render
onSelect     — neue Funktion bei jedem App-Render
products     — abhaengig davon wie products aktualisiert wird
showPrice    — primitiv, keine Referenz-Probleme
```

### Notwendige Änderungen

```tsx
function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  // 1. config stabilisieren
  const [config, setConfig] = useState({ showPrices: true });

  // 2. Callback stabilisieren
  const handleSelect = useCallback((id: string) => console.log(id), []);

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ProductList
        products={products}
        config={config}
        onSelect={handleSelect}
      />
    </div>
  );
}

// 3. ProductCard memoisieren
const ProductCard = memo(function ProductCard({ product, showPrice, onSelect }: Props) {
  return (
    <li onClick={() => onSelect(product.id)}>
      <h3>{product.name}</h3>
      {showPrice && <p>{product.price} EUR</p>}
    </li>
  );
});
```

### Bemerkung

Der React Compiler würde die Stabilisierung von `handleSelect` und `config` automatisch übernehmen. Nur `memo` auf `ProductCard` wäre weiterhin manuell zu setzen.

---

## Lösung 5.4 — State nach unten verschieben

### Mögliche Ansätze

1. `memo` auf den teuren Komponenten
2. State nach unten verschieben (strukturelle Lösung)
3. Composition mit children um stabile Children durchzureichen

Strukturelle Lösungen (Variante 2 und 3) sind meist robuster und schneller als `memo`.

### Strukturelle Lösung

```tsx
function ShopPage() {
  return (
    <div>
      <ExpensiveHeader />
      <ProductSection />
      <ExpensiveSidebar />
      <ExpensiveFooter />
    </div>
  );
}

function ProductSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const products = useProducts();
  const filtered = products.filter(p =>
    p.name.includes(searchQuery) &&
    (categoryFilter === 'all' || p.category === categoryFilter)
  );

  return (
    <>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
      <ProductGrid products={filtered} />
    </>
  );
}
```

### Wo lebt der State

`searchQuery` und `categoryFilter` leben jetzt in `ProductSection`. `ShopPage` rendert nicht mehr bei Sucheingaben, also auch `ExpensiveHeader`, `ExpensiveSidebar` und `ExpensiveFooter` nicht.

### Anpassungen an SearchBar und CategoryFilter

Keine. Die Komponenten ändern sich nicht. Nur ihr Parent ist nun `ProductSection` statt `ShopPage`.

---

## Lösung 5.5 — Vermeintlich optimierter Code

### Identifizierte Probleme

```tsx
// Problem 1: useCallback fuer eine Funktion die nirgends verwendet wird
const fetchUser = useCallback(async () => { ... }, [userId]);

// Problem 2: useMemo mit Date.now() - bei jedem Render ein neuer Wert,
// useMemo ist damit komplett wirkungslos, kostet aber Overhead
const config = useMemo(() => ({
  userId,
  timestamp: Date.now(),
}), [userId]);

// Problem 3: useCallback ohne memoisiertes Ziel
const handleFilterChange = useCallback((value: string) => setFilter(value), []);

// Problem 4: someData ist nirgends definiert oder kommt aus dem Outer Scope
// useMemo Dependency [someData, filter] ist verdaechtig
const filteredData = useMemo(...);

// Problem 5: useMemo fuer ein triviales Objekt
const headerProps = useMemo(() => ({ title: 'Dashboard', userId }), [userId]);

// Problem 6: useMemo fuer JSX-Element
// JSX ist ein Objekt, dieses Memoisierung schadet mehr als sie nutzt
const Footer = useMemo(() => <FooterComponent />, []);
```

### Bereinigte Version

```tsx
function Dashboard({ userId }: { userId: string }) {
  const [filter, setFilter] = useState('');

  // someData kommt entweder aus Props, einer Query, oder dem Outer Scope
  // Nehmen wir an es kommt aus useQuery
  const { data: someData = [] } = useQuery({
    queryKey: ['data', userId],
    queryFn: () => fetch(`/api/data/${userId}`).then(r => r.json()),
  });

  // Direkt im Render — bei kleinen Datenmengen kein useMemo noetig
  const filteredData = someData.filter(d => d.name.includes(filter));

  return (
    <div>
      <Header title="Dashboard" userId={userId} />
      <FilterInput onChange={setFilter} />
      <DataTable data={filteredData} userId={userId} />
      <FooterComponent />
    </div>
  );
}
```

### Was ESLint fängt

- `eslint-plugin-react-hooks/exhaustive-deps` warnt bei fehlenden Abhängigkeiten oder `Date.now()` in Memo-Dependencies (nicht direkt, aber der Sinn der Memoisierung wäre offensichtlich falsch)
- Eine ungenutzte Variable wie `fetchUser` wird von `@typescript-eslint/no-unused-vars` gefangen
- Den Effekt-Sinn wie `Date.now()` in `useMemo` fangen die Linter nicht — solche logischen Bugs muss man im Review erkennen
