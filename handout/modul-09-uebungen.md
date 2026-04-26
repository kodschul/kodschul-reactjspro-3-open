# Modul 9 — Übungen

> Aufgabe für alle Übungen: Architektur eines Features gemeinsam planen

---

## Übung 9.1 — Rendering-Strategien wählen

### Szenarien

Wähle für jedes Szenario die passende Rendering-Strategie (SSG, ISR, SSR, oder CSR) und begründe deine Wahl.

```
Szenario A:
Eine Marketing-Landingpage mit fixem Inhalt der einmal pro Quartal redaktionell aktualisiert wird.

Szenario B:
Eine Produktdetailseite. Die Produktdaten aendern sich mehrfach am Tag (Preise, Lagerbestand).
SEO ist wichtig.

Szenario C:
Ein eingeloggtes Dashboard mit personalisierten Daten. Jeder Nutzer sieht andere Inhalte.

Szenario D:
Ein Blog mit ueber 5000 Artikeln. Die Inhalte aendern sich selten, neue Artikel kommen 1-2 mal pro Woche dazu.

Szenario E:
Eine interaktive Mapping-Anwendung mit komplexen Browser-APIs (WebGL, Geolocation).
SEO unwichtig.

Szenario F:
Ein E-Commerce-Suchergebnis. Dynamisch nach Eingabe, kann gecacht werden, SEO sehr wichtig.
```

### Aufgaben

1. Notiere für jedes Szenario die Strategie und begründe in 2-3 Sätzen
2. Welche zwei Szenarien sind die schwierigsten Entscheidungen?
3. Wann ist ISR die richtige Wahl, wann lieber SSG mit Webhook-Revalidation?

---

## Übung 9.2 — App Router Struktur planen

### Aufgabe

Du sollst die Routing-Struktur für eine E-Commerce-Plattform planen. Anforderungen:

- Marketing-Seiten: Startseite, Über uns, Kontakt
- Shop: Produktliste, Produktdetailseite, Suche
- Account: Login, Registrierung, Profil, Bestellungen, Bestelldetails
- Admin (eingeloggt + Berechtigung): Produkte verwalten, Bestellungen einsehen
- Marketing- und Shop-Bereich teilen sich ein Layout (Header mit Navigation, Footer)
- Account und Admin haben jeweils eigene Layouts (Sidebar, kein Marketing-Header)

### Aufgaben

1. Skizziere die Datei- und Ordnerstruktur unter `app/`
2. Welche `layout.tsx`-Dateien werden benötigt und auf welcher Ebene?
3. Wo nutzt du Route Groups in Klammern und warum?
4. Wo platzierst du `loading.tsx` und `error.tsx`-Dateien sinnvoll?

---

## Übung 9.3 — Server vs. Client Component Entscheidung

### Komponenten

Markiere für jede Komponente ob sie Server oder Client Component sein sollte.

```
1. Header mit Logo und statischer Navigation
2. Header mit Dropdown-Menue das aufklappt
3. Produktkarte ohne Interaktion
4. Produktkarte mit "Add to Cart"-Button
5. Footer mit Links
6. Search-Input das eine API aufruft
7. Tab-Komponente die zwischen verschiedenen Inhalten umschaltet
8. Bewertungssterne (read-only)
9. Bewertungssterne (interaktiv, klickbar)
10. Bildkarussell mit Pfeiltasten
11. Newsletter-Anmeldung mit Validierung
12. Liste vergangener Bestellungen
```

### Aufgaben

1. Klassifiziere jede Komponente
2. Bei welcher Komponente ist die Antwort nicht eindeutig und wovon hängt es ab?
3. Wie würdest du Komponente 4 strukturieren — als Client Component, oder mit kleinerem Client-Subteil?

---

## Übung 9.4 — Server Component importiert Client Component

### Ausgangslage

```tsx
// app/products/page.tsx — Server Component
import { ProductActions } from '@/components/ProductActions';

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div>
      <h1>Produkte</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <h2>{p.name}</h2>
            <ProductActions product={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
// components/ProductActions.tsx — Client Component
'use client';

import { useState } from 'react';

export function ProductActions({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div>
      <button onClick={() => setIsFavorite(p => !p)}>
        {isFavorite ? '★' : '☆'}
      </button>
      <button onClick={() => addToCart(product.id)}>In den Warenkorb</button>
    </div>
  );
}
```

### Aufgaben

1. Funktioniert dieser Code? Begründe.
2. Was passiert wenn jemand in `ProductActions` einen `import { something } from '@/lib/server-only'` einbaut?
3. Welche Daten kommen vom Server zum Client und welche bleiben auf dem Server?
4. Wo würdest du das Bundle reduzieren wenn `product` sehr viele Felder hat aber `ProductActions` nur die ID braucht?

---

## Übung 9.5 — Client Component will Server Component verwenden

### Problem

```tsx
// components/Modal.tsx — Client Component
'use client';

import { ServerOnlyContent } from './ServerOnlyContent';

export function Modal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Öffnen</button>
      {isOpen && <ServerOnlyContent />}
    </div>
  );
}
```

`ServerOnlyContent` greift direkt auf die Datenbank zu und kann nicht auf dem Client laufen.

### Aufgaben

1. Erkläre warum dieser Code so nicht funktioniert
2. Schreibe die Komponente um sodass `ServerOnlyContent` weiterhin auf dem Server bleibt
3. Wo wird der Modal-State verwaltet und wo passiert das Server-Rendering?
4. Welche Einschränkung hat dieser Ansatz?

---

## Übung 9.6 — Feature-Architektur planen

### Anforderungen

Plane die Architektur für ein Feature "Bestellverlauf mit Filterung":

- Liste aller Bestellungen des eingeloggten Nutzers
- Filter nach Status (offen, versandt, geliefert, storniert)
- Filter nach Zeitraum (letzte 30 Tage, letztes Jahr, alle)
- Sortierung nach Datum oder Betrag
- Klick auf eine Bestellung öffnet die Detailansicht
- Filter-State soll in der URL stehen damit Links teilbar sind
- Bestelldaten ändern sich selten, müssen aber bei Statusupdates aktuell sein
- SEO ist nicht relevant (eingeloggter Bereich)

### Aufgaben

1. Welche Rendering-Strategie wählst du? Begründe.
2. Welche Komponenten sind Server, welche Client Components?
3. Wo lebt der Filter-State und wie wird er mit der URL synchronisiert?
4. Wie kombinierst du Server-Rendering mit react-query für Status-Updates?
5. Skizziere die Datei-Struktur unter `app/account/orders/`
