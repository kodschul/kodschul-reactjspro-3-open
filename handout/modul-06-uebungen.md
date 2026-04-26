# Modul 6 — Übungen

> Aufgabe für alle Übungen: Langsame App analysieren und fixen

---

## Übung 6.1 — Profiler-Aufzeichnung interpretieren

### Ausgangslage

Ein Kollege hat eine Profiler-Aufzeichnung gemacht und beschreibt das Ergebnis so:

```
Beim Tippen in die Suche im Dashboard:
- 47 Komponenten haben gerendert
- Insgesamt 312ms Render-Zeit
- Der gelb-orange Balken "AnalyticsWidget" ist 180ms lang
- Daneben rendert "UserMenu" mit 4ms
- Die ProductTable mit 100 Zeilen rendert mit 45ms
- Render-Grund bei AnalyticsWidget: "Parent rendered"
- Render-Grund bei UserMenu: "Parent rendered"
- Render-Grund bei ProductTable: "Props changed"
```

### Aufgaben

1. Wo sollte zuerst optimiert werden? Begründe.
2. Was bedeutet "Parent rendered" als Render-Grund?
3. Welche Massnahme würdest du für `AnalyticsWidget` empfehlen?
4. Warum ist die ProductTable trotz vieler Zeilen weniger problematisch als das AnalyticsWidget?

---

## Übung 6.2 — Bug systematisch debuggen

### Ausgangslage

Das Team berichtet einen Bug:

> Beim Speichern eines Produkts erscheint manchmal der alte Wert in der Liste, manchmal der neue. Der Bug tritt nicht immer auf.

Du hast Zugriff auf den Code:

```tsx
function ProductEditor({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const { data: product } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetch(`/api/products/${productId}`).then(r => r.json()),
  });

  const { mutate } = useMutation({
    mutationFn: (updated: Product) =>
      fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updated),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  function handleSave(updated: Product) {
    mutate(updated);
  }

  return product ? <EditForm product={product} onSave={handleSave} /> : null;
}
```

### Aufgaben

1. Formuliere eine konkrete Hypothese was passiert
2. Welchen Test würdest du machen um die Hypothese zu prüfen?
3. Wie behebst du das Problem?
4. Welche zwei zusätzlichen Schritte würden ähnliche Bugs in der Zukunft verhindern?

---

## Übung 6.3 — useWhyDidYouRender einsetzen

### Ausgangslage

Eine Komponente rendert "viel zu oft" laut Feedback. Du sollst herausfinden warum.

```tsx
function ExpensiveCard({ data, onAction, theme }: Props) {
  const heavyResult = computeExpensiveValue(data);

  return (
    <div className={theme}>
      <h3>{data.title}</h3>
      <p>{heavyResult}</p>
      <button onClick={onAction}>Aktion</button>
    </div>
  );
}
```

Aufrufende Komponente:

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState<Item[]>([]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Klick {count}</button>
      <ExpensiveCard
        data={{ title: 'Hallo', items: list }}
        onAction={() => console.log('action')}
        theme="dark"
      />
    </div>
  );
}
```

### Aufgaben

1. Baue den `useWhyDidYouRender`-Hook in `ExpensiveCard` ein
2. Was würdest du im Console-Output sehen wenn der Button geklickt wird?
3. Welche zwei Probleme musst du im Parent beheben damit `ExpensiveCard` nicht unnötig rendert?
4. Schreibe die optimierte Version

---

## Übung 6.4 — Error Boundary platzieren

### Ausgangslage

Die App stürzt komplett ab wenn eine einzelne Komponente einen Fehler wirft. Das Team möchte, dass:

- Ein Fehler in einem Widget nur dieses Widget betrifft
- Ein Fehler in der Hauptnavigation die ganze App neu lädt
- Ein Fehler im Header das Layout beibehält

```tsx
function App() {
  return (
    <Layout>
      <Navigation />
      <Header />
      <Dashboard>
        <RevenueWidget />
        <UserActivityWidget />
        <AlertsWidget />
      </Dashboard>
      <Footer />
    </Layout>
  );
}
```

### Aufgaben

1. Wo platzierst du Error Boundaries? Zeichne den Komponentenbaum
2. Was ist der Fallback für jede Boundary?
3. Implementiere eine Error Boundary die mit react-query zusammenarbeitet (Reset löst Refetch aus)
4. Warum ist eine einzige Error Boundary um die ganze App eine schlechte Idee?

---

## Übung 6.5 — Langsame App reproduzierbar analysieren

### Ausgangslage

Ein Kunde berichtet: "Eure App ist auf meinem Handy total langsam." Du selbst stellst auf deinem Laptop nichts fest.

### Aufgaben

1. Beschreibe die ersten drei Schritte um das Problem reproduzierbar zu machen
2. Welche Browser-DevTools-Funktion hilft dir hier konkret?
3. Welche Web Vitals würdest du als erstes messen und warum?
4. Du findest heraus dass `LCP = 4.8s` und `INP = 380ms`. Was bedeutet das, und wo würdest du als erstes ansetzen?
