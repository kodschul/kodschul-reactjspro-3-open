# Modul 9 — Lösungen

---

## Lösung 9.1 — Rendering-Strategien wählen

### Bewertung

| Szenario | Strategie | Begründung |
|---|---|---|
| A — Marketing-Landingpage | SSG | Inhalt ändert sich quartalsweise. Statisches Rendering bietet beste Performance und SEO. Bei Updates Webhook-Trigger oder Re-Build. |
| B — Produktdetailseite | ISR | Daten ändern sich täglich aber nicht pro Request. ISR mit revalidate von z.B. 5 Minuten gibt schnelle Antwortzeiten und akzeptable Aktualität. |
| C — Eingeloggtes Dashboard | SSR | Personalisierte Daten, jeder Nutzer sieht andere Inhalte. Cookie-basierte Auth erfordert Server-Rendering pro Request. |
| D — Blog mit 5000+ Artikeln | SSG mit generateStaticParams | Statische Inhalte, ideal für SSG. Bei neuen Artikeln Webhook-basierte Re-Generation einzelner Pfade. |
| E — Mapping-App | CSR | Hochinteraktiv, viele Browser-APIs, kein SEO-Bedarf. SSR bringt hier nichts und würde nur die initiale Ladezeit verlängern. |
| F — Suchergebnis | SSR oder ISR mit dynamischen Parametern | Dynamisch nach Eingabe, SEO wichtig. Bei beliebten Queries Caching möglich, bei seltenen SSR. |

### Schwierigste Entscheidungen

Szenario B (Produktdetailseite) und F (Suchergebnis) sind am schwierigsten. Beide haben SEO-Anforderungen plus dynamische Inhalte. Die Wahl zwischen SSR und ISR hängt davon ab wie kritisch absolute Aktualität ist (Lagerbestand z.B.) versus Performance.

### ISR vs. SSG mit Webhook

```
ISR: Wenn man Aktualisierung "automatisch nach Zeit" akzeptieren kann.
     Einfachere Konfiguration, kein externes System.

SSG mit Webhook (on-demand revalidation):
     Wenn man genau weiss wann sich Inhalte aendern.
     Z.B. Blog: Webhook vom CMS triggert revalidate.
     Praezise Aktualisierung, mehr Setup-Aufwand.
```

---

## Lösung 9.2 — App Router Struktur

### Datei-Struktur

```
app/
  layout.tsx                       <- Root Layout (HTML, body)
  page.tsx                         <- Startseite "/"

  (marketing)/                     <- Route Group, kein URL-Segment
    layout.tsx                     <- Marketing-Layout (Header + Footer)
    about/
      page.tsx                     <- "/about"
    contact/
      page.tsx                     <- "/contact"

  (shop)/                          <- Route Group fuer Shop
    layout.tsx                     <- Shop-Layout (gleicher Header + Footer)
    products/
      page.tsx                     <- "/products"
      loading.tsx                  <- Skeleton fuer Produktliste
      [id]/
        page.tsx                   <- "/products/123"
        loading.tsx
    search/
      page.tsx                     <- "/search"

  account/
    layout.tsx                     <- Account-Layout (Sidebar)
    login/
      page.tsx
    register/
      page.tsx
    profile/
      page.tsx
    orders/
      page.tsx
      [orderId]/
        page.tsx
    error.tsx                      <- Account-spezifische Fehlerseite

  admin/
    layout.tsx                     <- Admin-Layout (eigene Sidebar)
    products/
      page.tsx
    orders/
      page.tsx
```

### Layouts pro Ebene

```
Root (app/layout.tsx)             — HTML-Struktur, globale Styles
Marketing/Shop ((marketing)/, (shop)/) — Public Header + Footer
Account                           — Account-Sidebar
Admin                             — Admin-Sidebar mit Berechtigungs-Check
```

### Route Groups

`(marketing)` und `(shop)` gruppieren Seiten die sich ein Layout teilen, ohne ein URL-Segment hinzuzufügen. `/about` bleibt `/about`, nicht `/marketing/about`. Das erlaubt unterschiedliche Layouts auf derselben URL-Ebene.

### loading.tsx und error.tsx

```
loading.tsx:
  Fuer Routen mit Datenfetch — Skeleton waehrend Server-Rendering laeuft.
  Beispiele: products/, products/[id]/, search/

error.tsx:
  An Bereichen wo Fehler isoliert auftreten koennen.
  account/error.tsx — Fehler im Account-Bereich, Marketing bleibt.
  admin/error.tsx — Fehler im Admin-Bereich isoliert.
```

---

## Lösung 9.3 — Server vs. Client Component

### Klassifikation

| # | Komponente | Typ | Begründung |
|---|---|---|---|
| 1 | Header mit statischer Navigation | Server | Kein State, keine Interaktion |
| 2 | Header mit Dropdown | Client | useState für offen/zu |
| 3 | Produktkarte ohne Interaktion | Server | Reine Darstellung |
| 4 | Produktkarte mit Add-to-Cart | Mixed | Server-Hülle, Client-Button |
| 5 | Footer mit Links | Server | Keine Interaktion |
| 6 | Search-Input mit API | Client | useState, fetch |
| 7 | Tab-Komponente | Client | useState für aktiven Tab |
| 8 | Bewertungssterne read-only | Server | Reine Darstellung |
| 9 | Bewertungssterne interaktiv | Client | onClick, useState |
| 10 | Bildkarussell | Client | useState, Event-Handler |
| 11 | Newsletter mit Validierung | Client | react-hook-form, useState |
| 12 | Liste vergangener Bestellungen | Server | Datenfetch, kein State, könnte read-only sein |

### Nicht eindeutige Antworten

Komponente 12 (Bestellungen) hängt davon ab ob die Liste interaktiv ist (Filtern, Sortieren). Wenn die Filter URL-basiert sind, bleibt es eine Server Component. Bei lokalen Filtern wäre eine Client Component nötig oder eine Mischform.

Komponente 4 (Produktkarte mit Add-to-Cart) wird oft als Ganzes zur Client Component gemacht, sollte aber idealerweise gemischt sein:

```tsx
// Server Component
function ProductCard({ product }: { product: Product }) {
  return (
    <div>
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price} EUR</p>
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// Client Component
'use client';
function AddToCartButton({ productId }: { productId: string }) {
  return <button onClick={() => addToCart(productId)}>In den Warenkorb</button>;
}
```

So wandert nur der Button-Code in das Client-Bundle, nicht die ganze Karte.

---

## Lösung 9.4 — Server Component importiert Client Component

### Funktioniert der Code?

Ja. Server Components können Client Components importieren und einbinden. Das ist der gewünschte Weg um Interaktivität in eine Server-gerenderte Seite einzubringen.

### Server-Only Import in Client Component

```tsx
// In ProductActions.tsx:
'use client';
import { something } from '@/lib/server-only'; // FEHLER
```

Das löst einen Build-Fehler aus wenn `@/lib/server-only` Server-only-Code enthält (Datenbankzugriff, Server-Secrets, fs-Zugriff). Der Bundler weigert sich diesen Code in das Client-Bundle zu packen.

Markierung von Server-only-Modulen:

```tsx
import 'server-only';
// Diese Datei wirft einen klaren Fehler beim Versuch, sie clientseitig zu importieren
```

### Daten-Transfer

```
Vom Server zum Client:
  product-Objekt wird serialisiert und an ProductActions uebergeben.
  Nur die Felder die ProductActions als Prop erwartet werden uebertragen.

Bleibt auf dem Server:
  Die ProductsPage selbst (HTML wird gerendert und gesendet)
  Der fetchProducts-Aufruf
  Alle Imports von Server-only-Modulen
```

### Bundle reduzieren

Wenn `product` viele Felder hat aber nur die ID gebraucht wird, nur die ID übergeben:

```tsx
// Server Component
{products.map(p => (
  <li key={p.id}>
    <h2>{p.name}</h2>
    {/* Nur die ID wird serialisiert */}
    <ProductActions productId={p.id} />
  </li>
))}

// Client Component nimmt nur die ID
function ProductActions({ productId }: { productId: string }) {
  // ...
}
```

Damit wandert nur der primitiver String über die Boundary, nicht das ganze Produkt-Objekt.

---

## Lösung 9.5 — Client Component will Server Component verwenden

### Warum funktioniert das nicht

Client Components können Server Components nicht direkt importieren. Beim Bundling wird die importierte Server Component automatisch in eine Client Component umgewandelt — was beim Datenbankzugriff scheitert. Die Boundary ist gerichtet: Server kann Client einbinden, aber nicht umgekehrt.

### Lösung mit children-Prop

```tsx
// Modal.tsx — Client Component
'use client';

import { useState } from 'react';

export function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Öffnen</button>
      {isOpen && <div className="modal">{children}</div>}
    </div>
  );
}
```

```tsx
// app/page.tsx — Server Component
import { Modal } from '@/components/Modal';
import { ServerOnlyContent } from '@/components/ServerOnlyContent';

export default async function Page() {
  return (
    <Modal>
      <ServerOnlyContent />
    </Modal>
  );
}
```

### Wer macht was

```
Server-Rendering:
  ServerOnlyContent wird auf dem Server gerendert.
  Das Ergebnis ist HTML das als children an Modal uebergeben wird.

Client-Rendering:
  Modal verwaltet den isOpen-State.
  Das vom Server vorgerenderte HTML wird beim Oeffnen angezeigt.
```

### Einschränkung

`children` wird beim ersten Server-Render erzeugt und ist statisch. Wenn `ServerOnlyContent` neue Daten laden müsste sobald das Modal geöffnet wird, müsste das anders gelöst werden — z.B. mit einer Server Action die Daten zurückgibt, oder einer Client Component die per react-query lädt.

---

## Lösung 9.6 — Feature-Architektur planen

### Rendering-Strategie

SSR mit react-query für Status-Updates. Begründung:

- Kein SEO-Bedarf, aber Authentifizierung pro Request
- Filterzustand in URL bedeutet dass die Server-Komponente bei jedem Filterwechsel neu rendert (acceptable für eingeloggten Bereich)
- react-query auf dem Client für Status-Updates (z.B. Bestellung wird versandt während Nutzer auf der Seite ist)

### Komponenten-Aufteilung

```
Server Components:
  app/account/orders/page.tsx           — Lädt Bestellungen mit Filtern aus URL
  OrderList                             — Rendert die Liste
  OrderRow                              — Einzelne Zeile read-only

Client Components:
  OrderFilters                          — Filter-UI, ändert URL via useRouter
  OrderRefreshButton                    — Triggert react-query refetch
```

### Filter-State und URL-Sync

```tsx
// app/account/orders/page.tsx — Server Component
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; period?: string; sort?: string };
}) {
  const orders = await fetchOrders({
    status: searchParams.status,
    period: searchParams.period ?? '30days',
    sort: searchParams.sort ?? 'date-desc',
  });

  return (
    <div>
      <OrderFilters
        initialStatus={searchParams.status}
        initialPeriod={searchParams.period}
        initialSort={searchParams.sort}
      />
      <OrderList orders={orders} />
    </div>
  );
}
```

```tsx
// components/OrderFilters.tsx — Client Component
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function OrderFilters({ initialStatus, initialPeriod, initialSort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/account/orders?${params.toString()}`);
  }

  return (
    <div>
      <select
        defaultValue={initialStatus ?? ''}
        onChange={e => updateFilter('status', e.target.value)}
      >
        <option value="">Alle Status</option>
        <option value="open">Offen</option>
        <option value="shipped">Versandt</option>
        <option value="delivered">Geliefert</option>
        <option value="cancelled">Storniert</option>
      </select>
      {/* analoge Selects für period und sort */}
    </div>
  );
}
```

### Server-Rendering plus react-query

Für Status-Updates während der Nutzer auf der Seite ist, kann eine Client Component die initialen Server-Daten als `initialData` an react-query übergeben:

```tsx
// Client Component die initiale Server-Daten weiternutzt
'use client';

function OrdersWithUpdates({ initialOrders, filters }: Props) {
  const { data: orders = initialOrders } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => fetchOrders(filters),
    initialData: initialOrders,
    refetchInterval: 30 * 1000, // Status alle 30 Sekunden aktualisieren
  });

  return <OrderList orders={orders} />;
}
```

### Datei-Struktur

```
app/account/orders/
  page.tsx                       <- Server Component, lädt Bestellungen
  loading.tsx                    <- Skeleton beim Filterwechsel
  error.tsx                      <- Fehler beim Laden
  [orderId]/
    page.tsx                     <- Bestelldetails

components/orders/
  OrderFilters.tsx               <- Client Component
  OrderList.tsx                  <- Server Component
  OrderRow.tsx                   <- Server Component
  OrdersWithUpdates.tsx          <- Optional: Client-Wrapper für Live-Updates
```
