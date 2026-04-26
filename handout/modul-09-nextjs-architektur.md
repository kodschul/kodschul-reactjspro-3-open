# Modul 9: Next.js Architektur

---

## Installation und Einrichtung

```bash
npx create-next-app@latest mein-projekt
```

```
Would you like to use TypeScript?         Yes
Would you like to use ESLint?             Yes
Would you like to use Tailwind CSS?       No / Yes je nach Bedarf
Would you like to use the App Router?     Yes
Would you like to use Turbopack?          Yes
```

### Projektstruktur

```
mein-projekt/
  app/                    <- App Router, alle Seiten und Layouts
    layout.tsx            <- Root Layout, umschliesst alle Seiten
    page.tsx              <- Startseite "/"
    products/
      page.tsx            <- "/products"
      [id]/
        page.tsx          <- "/products/123"
    api/
      products/
        route.ts          <- API Route "/api/products"
  components/             <- Gemeinsame Komponenten
  lib/                    <- Hilfsfunktionen, API-Clients
  public/                 <- Statische Dateien
  next.config.ts          <- Next.js Konfiguration
```

---

## Lab 9.1 — Rendering-Strategien verstehen und auswählen

### Static Generation — der Standard im App Router

```tsx
// app/about/page.tsx
// Keine Datenabhaengigkeit — wird statisch zur Build-Zeit gerendert
export default function AboutPage() {
  return (
    <main>
      <h1>Ueber uns</h1>
      <p>Wir sind ein Team von Entwicklern.</p>
    </main>
  );
}
```

```tsx
// app/products/page.tsx
// fetch ohne cache-Konfiguration — wird zur Build-Zeit ausgefuehrt
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products').then(r => r.json());

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

### Dynamische Parameter und Static Generation

```tsx
// app/products/[id]/page.tsx

// Next.js fragt: welche IDs soll ich zur Build-Zeit rendern?
export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products').then(r => r.json());

  return products.map(p => ({ id: p.id.toString() }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(`https://api.example.com/products/${params.id}`).then(r => r.json());

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### Server-Side Rendering

```tsx
// app/dashboard/page.tsx
import { cookies } from 'next/headers';

// next/headers zu nutzen macht die Seite automatisch dynamisch
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const data = await fetch('https://api.example.com/dashboard', {
    headers: { Authorization: `Bearer ${token?.value}` },
    cache: 'no-store',  // Nie cachen — bei jedem Request neu laden
  }).then(r => r.json());

  return <Dashboard data={data} />;
}
```

```tsx
// Seite explizit als dynamisch markieren
export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await fetchCurrentData();
  return <View data={data} />;
}
```

### Incremental Static Regeneration

```tsx
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 60 }, // Alle 60 Sekunden neu generieren
  }).then(r => r.json());

  return <ProductList products={products} />;
}
```

### Entscheidungshilfe

| Frage | Strategie |
|---|---|
| Aendert sich der Inhalt nie oder selten? | SSG |
| Aendert sich der Inhalt regelmaessig aber nicht bei jedem Request? | ISR |
| Braucht die Seite Nutzerdaten aus Cookies oder Session? | SSR |
| Ist der Inhalt hochinteraktiv und braucht keinen SEO? | CSR |
| Sind die Daten personalisiert und sicherheitsrelevant? | SSR |

---

## Lab 9.2 — Den App Router verstehen

### Layouts und Verschachtelung

```tsx
// app/layout.tsx — Root Layout, umschliesst die gesamte Anwendung
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <GlobalNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

```tsx
// app/dashboard/layout.tsx — Dashboard Layout
// Gilt nur fuer Seiten unter /dashboard
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

```tsx
// app/dashboard/page.tsx — wird in DashboardLayout gerendert
// DashboardLayout wiederum in RootLayout
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}
```

### Spezielle Dateien im App Router

```
page.tsx        — Die Seite selbst, macht die Route oeffentlich zugaenglich
layout.tsx      — Umschliesst Seiten, bleibt beim Navigieren erhalten
loading.tsx     — Automatischer Suspense-Fallback waehrend Seite laedt
error.tsx       — Fehlerseite fuer diesen Routenbereich
not-found.tsx   — 404-Seite fuer diesen Routenbereich
template.tsx    — Wie Layout, aber wird bei Navigation neu gemountet
```

```tsx
// app/products/loading.tsx
// Wird automatisch als Suspense-Fallback genutzt
export default function ProductsLoading() {
  return <ProductListSkeleton />;
}

// app/products/error.tsx
// Muss ein Client Component sein
'use client';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>Fehler beim Laden der Produkte.</p>
      <button onClick={reset}>Erneut versuchen</button>
    </div>
  );
}
```

### Routing-Muster

```
app/
  page.tsx                    -> /
  products/
    page.tsx                  -> /products
    [id]/
      page.tsx                -> /products/123
  shop/
    [...slug]/
      page.tsx                -> /shop/a/b/c (beliebig tief)
  (marketing)/
    about/page.tsx            -> /about (Klammern gruppieren ohne URL-Segment)
    contact/page.tsx          -> /contact
  @modal/
    (.)products/[id]/
      page.tsx                -> Parallel Route fuer Modal
```

---

## Lab 9.3 — Server und Client Components

### Server Components — was sie können

```tsx
// app/products/page.tsx
// Server Component — kein 'use client', kein JavaScript im Bundle

import { db } from '@/lib/database';  // Direkter Datenbankzugriff moeglich

export default async function ProductsPage() {
  // Direkt auf die Datenbank zugreifen, ohne API-Route
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.description}</p>
        </li>
      ))}
    </ul>
  );
}
```

### Client Components — was sie brauchen

```tsx
// components/AddToCartButton.tsx
'use client';  // Diese Direktive macht die Komponente zu einer Client Component

import { useState } from 'react';

export function AddToCartButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  async function handleClick() {
    await addToCart(productId);
    setAdded(true);
  }

  return (
    <button onClick={handleClick}>
      {added ? 'Im Warenkorb' : 'In den Warenkorb'}
    </button>
  );
}
```

### Server und Client kombinieren

```tsx
// app/products/[id]/page.tsx — Server Component
import { AddToCartButton } from '@/components/AddToCartButton';

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Datenfetch auf dem Server
  const product = await fetchProduct(params.id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price} EUR</p>

      {/* Client Component fuer Interaktivitaet */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```

### Die wichtigste Regel

```tsx
// Funktioniert: Server Component uebergibt Client Component als Child
// app/page.tsx (Server Component)
import { InteractiveWidget } from '@/components/InteractiveWidget'; // Client Component

export default function Page() {
  return (
    <div>
      <h1>Titel</h1>
      <InteractiveWidget />
    </div>
  );
}
```

```tsx
// Funktioniert nicht: Client Component importiert Server Component
'use client';

// Das hier ist ein Fehler — ServerOnlyComponent wird zu einer Client Component
import { ServerOnlyComponent } from '@/components/ServerOnlyComponent';
```

```tsx
// Loesung: Server Component als Prop uebergeben
'use client';

export function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(p => !p)}>Toggle</button>
      {isOpen && children}
    </div>
  );
}

// In einer Server Component:
<ClientWrapper>
  <ServerOnlyComponent />  {/* Funktioniert als children-Prop */}
</ClientWrapper>
```

### Typische Entscheidungsfehler

```
Server Component nehmen wenn:
  Datenfetch noetig
  Zugriff auf Backend-Ressourcen
  Grosse Abhaengigkeiten die nicht im Browser gebraucht werden
  Kein interaktives Verhalten noetig

Client Component nehmen wenn:
  useState oder useReducer noetig
  useEffect noetig
  Browser-APIs wie localStorage oder window
  Event-Handler wie onClick, onChange
  Bibliotheken die Browser-APIs nutzen
```

---

## Lab 9.4 — Architekturentscheidungen für ein Feature

### Ein konkretes Szenario

```
Wie oft aendern sich die Produktdaten?
  Taeglich — ISR mit revalidate: 3600 passt.

Muss die Seite SEO-fähig sein?
  Ja — Server Rendering noetig, kein reines CSR.

Welche Teile sind interaktiv?
  Filteroptionen und Warenkorb-Buttons.

Braucht der Filter eine eigene URL?
  Ja — Filterstate in die URL, nicht in useState.
```

### Die Architektur

```tsx
// app/products/page.tsx — Server Component mit ISR
export const revalidate = 3600;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const products = await fetchProducts({
    category: searchParams.category,
  });

  return (
    <div>
      {/* Client Component fuer Filterinteraktion */}
      <CategoryFilter activeCategory={searchParams.category} />

      {/* Server Component fuer die Liste */}
      <ProductGrid products={products} />
    </div>
  );
}
```

```tsx
// components/CategoryFilter.tsx — Client Component
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function CategoryFilter({
  activeCategory,
}: {
  activeCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div>
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => handleChange(c.id)}
          data-active={activeCategory === c.id}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// components/ProductGrid.tsx — Server Component
import { AddToCartButton } from './AddToCartButton';

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>
          <h2>{p.name}</h2>
          <p>{p.price} EUR</p>
          <AddToCartButton productId={p.id} />
        </li>
      ))}
    </ul>
  );
}
```
