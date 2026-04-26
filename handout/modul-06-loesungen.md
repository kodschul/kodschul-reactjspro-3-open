# Modul 6 — Lösungen

---

## Lösung 6.1 — Profiler-Aufzeichnung

### Wo zuerst optimieren

`AnalyticsWidget` mit 180ms ist der grösste Engpass und nimmt mehr als die Hälfte der gesamten Render-Zeit ein. Die Optimierung dort hat den grössten Effekt.

### Bedeutung von "Parent rendered"

Die Komponente hat keine eigene State- oder Prop-Änderung, sondern rendert nur weil ihre Eltern-Komponente neu gerendert hat. Das ist der häufigste Grund für unnötige Re-Renders und meist mit `memo` oder strukturellen Änderungen behebbar.

### Massnahme für AnalyticsWidget

Drei Schritte in dieser Reihenfolge:

1. **Strukturell**: kann das Widget so platziert werden dass es nicht mehr im Re-Render-Pfad liegt? Etwa über Composition mit children.
2. **memo**: wenn das Widget echte Props bekommt die sich nicht oft ändern.
3. **State analysieren**: warum rendert das Widget überhaupt? Ist die Render-Logik unnötig teuer?

180ms für ein einzelnes Widget ist sehr lang. Die Render-Funktion selbst ist wahrscheinlich das eigentliche Problem, nicht nur die Häufigkeit.

### Warum ProductTable weniger problematisch

45ms ist unter der Frame-Grenze (16ms pro Frame, aber für gelegentliche Renders bis ~50ms tolerabel). Der Render-Grund "Props changed" ist legitim — die Tabelle muss ja neu rendern wenn sich die Daten ändern. Hier ist Virtualisierung sinnvoll wenn die Liste lang wird, aber kein akuter Engpass.

---

## Lösung 6.2 — Bug systematisch debuggen

### Hypothese

Der Cache-Key der Detail-Query (`['product', productId]`) wird beim Speichern nicht invalidiert. Nur die Liste (`['products']`) wird neu geladen. Wenn der Editor neu geöffnet oder neu gemountet wird, lädt er die alten Daten aus dem Cache.

### Test

In den react-query DevTools nach dem Speichern prüfen:

- Status der Query `['product', productId]`: ist sie nach dem Save noch "fresh"?
- Wert im Cache: enthält der gespeicherte Wert die alten Daten?

Alternativ: nach dem Save manuell die Detail-Query refetchen und schauen ob die Daten dann korrekt sind.

### Behebung

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

    onSuccess: (updatedProduct) => {
      // Detail-Query mit neuem Wert direkt befuellen
      queryClient.setQueryData(['product', productId], updatedProduct);

      // Liste invalidieren
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  function handleSave(updated: Product) {
    mutate(updated);
  }

  return product ? <EditForm product={product} onSave={handleSave} /> : null;
}
```

### Vorbeugende Massnahmen

1. **Konvention im Team**: nach jeder Mutation systematisch prüfen welche Queries betroffen sind und entweder invalidieren oder direkt aktualisieren.
2. **react-query DevTools** im Development immer offen haben — Cache-Inkonsistenzen werden sofort sichtbar.

---

## Lösung 6.3 — useWhyDidYouRender einsetzen

### Mit Hook eingebaut

```tsx
function ExpensiveCard({ data, onAction, theme }: Props) {
  useWhyDidYouRender('ExpensiveCard', { data, onAction, theme });

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

### Console-Output beim Klick

```
ExpensiveCard neu gerendert wegen: { data: { title: 'Hallo', items: [] }, onAction: [Function] }
```

`data` und `onAction` haben neue Referenzen, obwohl ihr Inhalt gleich ist. `theme` ist ein primitiver String und ändert sich nicht.

### Probleme im Parent

1. `data` ist ein Inline-Objekt — bei jedem Render neue Referenz
2. `onAction` ist eine Inline-Funktion — bei jedem Render neue Referenz

### Optimierte Version

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  const [list, setList] = useState<Item[]>([]);

  // Stabilisierte Werte
  const data = useMemo(
    () => ({ title: 'Hallo', items: list }),
    [list]
  );

  const handleAction = useCallback(
    () => console.log('action'),
    []
  );

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Klick {count}</button>
      <ExpensiveCard
        data={data}
        onAction={handleAction}
        theme="dark"
      />
    </div>
  );
}

const ExpensiveCard = memo(function ExpensiveCard({ data, onAction, theme }: Props) {
  const heavyResult = computeExpensiveValue(data);

  return (
    <div className={theme}>
      <h3>{data.title}</h3>
      <p>{heavyResult}</p>
      <button onClick={onAction}>Aktion</button>
    </div>
  );
});
```

Mit React Compiler werden `useMemo` und `useCallback` überflüssig. Nur `memo` muss manuell gesetzt werden.

---

## Lösung 6.4 — Error Boundary platzieren

### Komponentenbaum mit Boundaries

```
<RootErrorBoundary>          <- Faengt Navigations-Fehler, laedt App neu
  <Layout>
    <Navigation />            <- innerhalb der RootErrorBoundary
    <HeaderErrorBoundary>     <- Faengt Header-Fehler, Layout bleibt
      <Header />
    </HeaderErrorBoundary>
    <Dashboard>
      <WidgetErrorBoundary>   <- Pro Widget eine eigene Boundary
        <RevenueWidget />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary>
        <UserActivityWidget />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary>
        <AlertsWidget />
      </WidgetErrorBoundary>
    </Dashboard>
    <Footer />
  </Layout>
</RootErrorBoundary>
```

### Fallbacks pro Boundary

```
RootErrorBoundary    -> Vollbild-Fehlerseite mit Reload-Button
HeaderErrorBoundary  -> Schmale Fehlerleiste statt Header
WidgetErrorBoundary  -> Kompakte Box "Widget konnte nicht geladen werden"
```

### Error Boundary mit react-query Reset

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';

function WidgetErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, resetErrorBoundary }) => (
            <div className="widget-error">
              <p>Widget konnte nicht geladen werden</p>
              <button onClick={resetErrorBoundary}>Erneut versuchen</button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

`react-error-boundary` (Library) bietet die `ErrorBoundary` mit Render-Prop-Fallback. `QueryErrorResetBoundary` integriert diesen Reset mit dem react-query Cache.

### Warum nicht eine grosse Boundary

Eine einzelne Boundary um die ganze App fängt zwar alles auf, aber:

- Ein Fehler in einem unwichtigen Widget zerstört die ganze UI
- Nutzer verliert ungesicherte Eingaben in anderen Bereichen
- Schwer zu sehen welche Komponente der Verursacher ist
- Recovery (Reset) bezieht sich auf alles statt nur auf den fehlerhaften Bereich

---

## Lösung 6.5 — Langsame App auf Mobil reproduzieren

### Erste drei Schritte

1. **CPU-Drosselung aktivieren**: Chrome DevTools Performance-Tab → CPU: 4x oder 6x slowdown
2. **Netzwerk-Drosselung aktivieren**: Network-Tab → Throttling: Slow 3G oder Fast 3G
3. **Mobiles Viewport simulieren**: DevTools Device-Toolbar (Strg+Shift+M) → ein konkretes Mobile-Profil wählen

### Hilfreiche Browser-Funktion

`navigator.userAgent` und `userAgentData.mobile` zeigen ob Mobile-Modus aktiv ist. Hilfreicher: das Performance-Tab mit aktivierter CPU-Drosselung. Damit lässt sich das langsame Verhalten oft am Entwicklungsrechner reproduzieren.

### Web Vitals zuerst messen

**LCP (Largest Contentful Paint)** — zeigt wann der Hauptinhalt sichtbar ist. Direkt erlebbar für Nutzer und ein guter Indikator für Wahrnehmungsgeschwindigkeit.

**INP (Interaction to Next Paint)** — misst wie schnell die App auf Eingaben reagiert. Bei mobilen Geräten oft das eigentliche Problem.

### LCP 4.8s und INP 380ms — was tun

LCP über 4s ist sehr schlecht (Ziel: unter 2.5s). INP von 380ms zeigt deutlich verzögerte Reaktionen (Ziel: unter 200ms).

Erste Ansatzpunkte für LCP:

- Bilder optimieren (WebP, Responsive Images, Lazy Loading)
- Critical CSS inline einbinden
- JavaScript-Bundle reduzieren (Code Splitting)
- Server Components nutzen statt Client-Rendering

Erste Ansatzpunkte für INP:

- Lange synchrone Tasks aufspüren (Performance-Tab → Long Tasks)
- `useTransition` für nicht-dringende Updates
- Virtualisierung bei langen Listen
- Memoisierung wo Profiler tatsächlich Engpässe zeigt
