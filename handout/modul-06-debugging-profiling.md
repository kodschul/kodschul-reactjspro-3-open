# Modul 6: Debugging und Profiling systematisch anwenden

---

## Lab 6.1 — React DevTools und Profiler

### Installation

```
Chrome:  Chrome Web Store  -> "React Developer Tools"
Firefox: Firefox Add-ons   -> "React Developer Tools"
Edge:    Edge Add-ons      -> "React Developer Tools"
```

### Profiler nutzen

```
Vorgehen:
1. Profiler-Tab oeffnen
2. Roten Aufnahme-Button klicken
3. Die konkrete Aktion ausfuehren die langsam wirkt
4. Aufnahme-Button erneut klicken um zu stoppen
5. Ergebnis analysieren
```

### Den Flamegraph lesen

```
Grau        — Komponente hat in diesem Commit nicht gerendert
Gelb/Orange — Komponente hat gerendert, mittlere Dauer
Rot         — Komponente hat gerendert, hohe Dauer
```

### Render-Gründe

| Grund | Bedeutung |
|---|---|
| Props changed | Eine oder mehrere Props haben neue Werte |
| State changed | useState oder useReducer hat neuen Wert |
| Context changed | Ein konsumierter Context hat sich geaendert |
| Hooks changed | Ein Hook hat neuen Wert zurueckgegeben |
| Parent rendered | Elternkomponente hat gerendert |

### Highlight Updates aktivieren

```
Components-Tab -> Zahnrad-Icon -> "Highlight updates when components render"
```

---

## Lab 6.2 — Fehler systematisch debuggen

### Warum blindes Loggen nicht funktioniert

```tsx
function Component({ data }: Props) {
  console.log(data);
  console.log('hier');
  console.log('warum funktioniert das nicht');

  return <div>{data.value}</div>;
}
```

### Erst Hypothese, dann Test

```
Beobachtetes Verhalten:
Der Tabelleninhalt wird nach dem Speichern nicht aktualisiert.

Erwartetes Verhalten:
Die Tabelle zeigt nach dem Speichern den neuen Wert.

Mögliche Ursachen:
a) Der Server gibt den alten Wert zurueck
b) react-query invalidiert den Cache nicht
c) Die Komponente liest den falschen Cache-Key

Test fuer a):
Network-Tab pruefen ob die Server-Antwort den neuen Wert enthaelt.
```

### State und Props zur Laufzeit prüfen

```tsx
// Das ist in vielen Faellen nicht noetig:
const [debugValue, setDebugValue] = useState('test-wert-zum-debuggen');

// Stattdessen: im Components-Tab den State direkt auf den Testwert setzen
```

### Render-Ketten nachvollziehen

```tsx
function useWhyDidYouRender(name: string, props: Record<string, unknown>) {
  const previousProps = useRef(props);

  useEffect(() => {
    const changedProps = Object.entries(props).filter(
      ([key, value]) => previousProps.current[key] !== value
    );

    if (changedProps.length > 0) {
      console.log(`${name} neu gerendert wegen:`, Object.fromEntries(changedProps));
    }

    previousProps.current = props;
  });
}

function ProductCard({ product, onSelect }: Props) {
  useWhyDidYouRender('ProductCard', { product, onSelect });
  return <div>{product.name}</div>;
}
```

### Error Boundaries

```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
```

```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <Dashboard />
</ErrorBoundary>
```

---

## Lab 6.3 — Langsame Komponenten analysieren

### Reproduzierbarkeit

```
Was genau ist langsam?
Beim Tippen, beim Seitenwechsel, beim ersten Laden?

Mit welchen Daten tritt es auf?
100 Items oder 10.000? Leeres Formular oder befuelltes?

Auf welchem Geraet?
High-End Desktop oder Low-End Mobile?
```

### CPU Throttling im Browser

```
Chrome DevTools -> Performance-Tab -> CPU: 4x slowdown oder 6x slowdown
```

### Performance messen

```tsx
function MeasuredComponent({ data }: Props) {
  const renderStart = performance.now();

  useEffect(() => {
    const renderTime = performance.now() - renderStart;
    if (renderTime > 16) {
      console.warn(`Render: ${renderTime.toFixed(1)}ms — ueber einem Frame`);
    }
  });

  return <ExpensiveContent data={data} />;
}
```

### Web Vitals

| Metrik | Bedeutet | Ziel |
|---|---|---|
| LCP | Wie lange bis der Hauptinhalt sichtbar ist | unter 2.5s |
| INP | Wie schnell reagiert die Seite auf Eingaben | unter 200ms |
| CLS | Wie viel springt das Layout | unter 0.1 |

---

## Lab 6.4 — Eine langsame Anwendung optimieren

### Vorgehen

```
1. Messen      — Profiler aufzeichnen, Engpass identifizieren
2. Verstehen   — Warum ist diese Stelle langsam?
3. Hypothese   — Welche Massnahme sollte helfen?
4. Umsetzen    — Eine Massnahme auf einmal
5. Validieren  — Erneut messen, Verbesserung bestaetigen
```

### Lange Listen

```tsx
// 10.000 DOM-Knoten auf einmal
function ProductList({ products }: Props) {
  return (
    <ul>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}

// Nur sichtbare Items rendern mit react-window
import { FixedSizeList } from 'react-window';

function ProductList({ products }: Props) {
  return (
    <FixedSizeList
      height={600}
      itemCount={products.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <ProductCard style={style} product={products[index]} />
      )}
    </FixedSizeList>
  );
}
```

### Teure Berechnungen

```tsx
// Synchrone Berechnung blockiert den Main Thread
function ReportPage({ data }: Props) {
  const report = generateHeavyReport(data);
  return <ReportView report={report} />;
}

// Mit useTransition: UI bleibt responsiv waehrend berechnet wird
function ReportPage({ data }: Props) {
  const [report, setReport] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(() => {
      setReport(generateHeavyReport(data));
    });
  }

  return (
    <div>
      <button onClick={handleGenerate}>Bericht erstellen</button>
      {isPending && <Spinner />}
      {report && <ReportView report={report} />}
    </div>
  );
}
```

### Ergebnisse festhalten

```
Engpass:   ProductList mit 5000 Items, Render ca. 800ms
Massnahme: react-window Virtualisierung
Ergebnis:  Render ca. 12ms, nur sichtbare Items im DOM
Gemessen:  Profiler vor und nach, LCP von 4.2s auf 1.8s
```
