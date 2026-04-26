# Modul 5: Performance realistisch bewerten und verbessern

---

## Lab 5.1 — Re-Renders wirklich verstehen

### Wann rendert React neu

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Klick</button>
      <Child />
    </div>
  );
}

function Child() {
  console.log('Child rendert');
  return <p>Ich bin ein Kind</p>;
}
```

### Referenzielle Gleichheit

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // Bei jedem Render eine neue Referenz
  const config = { theme: 'dark' };
  const handleClick = () => console.log('klick');

  return <Child config={config} onClick={handleClick} />;
}
```

### Re-Renders sichtbar machen

```tsx
// Temporaer im Development: Render-Grund sichtbar machen
function Child({ name }: { name: string }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return <p>{name} — Render #{renderCount.current}</p>;
}
```

---

## Lab 5.2 — Memoisierung gezielt einsetzen

### memo

```tsx
// Ohne memo: rendert bei jedem Parent-Render neu
function ProductCard({ product }: { product: Product }) {
  return <div>{product.name}</div>;
}

// Mit memo: rendert nur wenn sich product aendert
const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  return <div>{product.name}</div>;
});
```

### useMemo

```tsx
// Macht Sinn: teure Berechnung die bei jedem Render laufen würde
function ProductList({ products, filter }: Props) {
  const filtered = useMemo(
    () => products.filter(p => expensiveFilter(p, filter)),
    [products, filter]
  );

  return <ul>{filtered.map(p => <ProductCard key={p.id} product={p} />)}</ul>;
}

// Macht keinen Sinn: einfache Berechnung kostet weniger als useMemo selbst
function ProductList({ products, filter }: Props) {
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filter)),
    [products, filter]
  );
  // Ein einfaches .filter() ohne useMemo waere hier schneller
}
```

### useCallback

```tsx
// Sinnvoll: handleSelect wird an memoisierte Komponente übergeben
function ProductList({ products }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  return (
    <ul>
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
}
```

```tsx
// Nicht sinnvoll: keine memoisierte Komponente, kein Effect
function SimpleList({ items }: Props) {
  const handleClick = useCallback((id: string) => {
    console.log(id);
  }, []);
  // useCallback bringt hier nichts ausser Komplexität
}
```

---

## Lab 5.3 — Performance-Mythen erkennen

### Mythos: memo überall schadet nicht

```tsx
// Problematisch: memo auf einer kleinen Komponente mit vielen Props
const Badge = memo(function Badge({
  label, color, size, variant, icon, tooltip, onClick, onHover, ...
}: BadgeProps) {
  return <span>{label}</span>;
});
// Der Prop-Vergleich kostet mehr als das Rendering selbst
```

### Mythos: useCallback verhindert Re-Renders

```tsx
function Parent() {
  const handleClick = useCallback(() => {}, []);

  // Child ist nicht memoisiert
  // handleClick ist stabil, hilft aber nichts
  return <Child onClick={handleClick} />;
}

function Child({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Klick</button>;
}
// Child rendert bei jedem Parent-Render neu, unabhaengig von useCallback
```

### Mythos: useMemo verbessert immer die Performance

```tsx
// Diese "Optimierung" ist langsamer als ohne useMemo
const value = useMemo(() => a + b, [a, b]);

// Direktes Berechnen ist schneller
const value = a + b;
```

---

## Lab 5.4 — Vermeintlich optimierten Code analysieren

### Ein typisches Beispiel aus der Praxis

```tsx
function Dashboard({ userId }: { userId: string }) {
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async () => {
    const data = await fetch(`/api/data/${userId}`);
    return data.json();
  }, [userId]);

  const config = useMemo(() => ({
    userId,
    timestamp: Date.now(),
  }), [userId]);

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const filteredData = useMemo(() => {
    return someData.filter(d => d.name.includes(filter));
  }, [someData, filter]);

  return (
    <div>
      <FilterInput onChange={handleFilterChange} />
      <DataTable data={filteredData} config={config} />
    </div>
  );
}
```

### Die bereinigte Version

```tsx
function Dashboard({ userId }: { userId: string }) {
  const [filter, setFilter] = useState('');

  // config ohne timestamp — stabil solange userId stabil ist
  const config = useMemo(() => ({ userId }), [userId]);

  // Direkt berechnen wenn someData klein ist
  // useMemo nur wenn someData wirklich gross ist
  const filteredData = someData.filter(d => d.name.includes(filter));

  return (
    <div>
      <FilterInput onChange={setFilter} />
      <DataTable data={filteredData} config={config} />
    </div>
  );
}
```
