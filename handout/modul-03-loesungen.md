# Modul 3 — Lösungen

---

## Lösung 3.1 — Komponente sinnvoll schneiden

### Identifizierte Verantwortlichkeiten

1. Daten beschaffen (Produkt + Reviews)
2. Produkt-Header anzeigen mit Wishlist-Button
3. Beschreibung mit Expand/Collapse
4. Bewertungen mit Show-More-Logik

### Zerlegte Version

```tsx
import { useQuery } from '@tanstack/react-query';

// Container — Datenbeschaffung, ansonsten dünn
function ProductDetailPage({ productId }: { productId: string }) {
  const { data: product, isPending: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetch(`/api/products/${productId}`).then(r => r.json()),
  });

  const { data: reviews = [], isPending: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetch(`/api/products/${productId}/reviews`).then(r => r.json()),
  });

  if (productLoading || reviewsLoading) return <Spinner />;
  if (!product) return null;

  return (
    <article>
      <ProductHeader product={product} />
      <ProductDescription
        shortDescription={product.shortDescription}
        fullDescription={product.fullDescription}
      />
      <ProductReviews reviews={reviews} />
    </article>
  );
}

// Eigener State fuer Wishlist
function ProductHeader({ product }: { product: Product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  return (
    <header>
      <img src={product.imageUrl} alt={product.name} />
      <h1>{product.name}</h1>
      <p>{product.price} EUR</p>
      <button onClick={() => setIsInWishlist(p => !p)}>
        {isInWishlist ? '★ Auf Wunschliste' : '☆ Zur Wunschliste'}
      </button>
    </header>
  );
}

// Eigener State fuer Expand/Collapse
function ProductDescription({
  shortDescription,
  fullDescription,
}: {
  shortDescription: string;
  fullDescription: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section>
      <h2>Beschreibung</h2>
      <p>{isExpanded ? fullDescription : shortDescription}</p>
      <button onClick={() => setIsExpanded(p => !p)}>
        {isExpanded ? 'Weniger' : 'Mehr lesen'}
      </button>
    </section>
  );
}

// Eigener State fuer Show-More
function ProductReviews({ reviews }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? reviews : reviews.slice(0, 3);
  const average = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section>
      <h2>Bewertungen ({reviews.length})</h2>
      <p>Durchschnitt: {average.toFixed(1)}</p>
      <ul>
        {visible.map(r => (
          <li key={r.id}><strong>{r.author}</strong>: {r.text}</li>
        ))}
      </ul>
      {!showAll && reviews.length > 3 && (
        <button onClick={() => setShowAll(true)}>
          Alle Bewertungen anzeigen
        </button>
      )}
    </section>
  );
}
```

### Welche Komponenten haben lokalen State?

- `ProductHeader`: Wishlist-Toggle
- `ProductDescription`: Expand/Collapse
- `ProductReviews`: Show-All

Jeder dieser States hat keinen Bezug zu anderen Komponenten und gehört deshalb lokal in die Komponente die ihn braucht.

### Testbarkeit ohne Mocks

- `ProductHeader` — testbar mit beliebigem `product`-Prop
- `ProductDescription` — komplett ohne Mocks testbar
- `ProductReviews` — testbar mit fixed `reviews`-Array

Nur `ProductDetailPage` braucht Mocks für die Queries.

---

## Lösung 3.2 — Custom Hook extrahieren

### Der Custom Hook

```tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

Beschreibbar in einem Satz: "Gibt zurück ob der Browser gerade online ist."

### Komponenten mit dem neuen Hook

```tsx
function ProductPage() {
  const isOnline = useOnlineStatus();
  return isOnline ? <ProductList /> : <OfflineWarning />;
}

function CheckoutPage() {
  const isOnline = useOnlineStatus();
  return (
    <div>
      <CheckoutForm disabled={!isOnline} />
      {!isOnline && <p>Sie sind offline</p>}
    </div>
  );
}

function NavigationBar() {
  const isOnline = useOnlineStatus();
  return <nav>{isOnline && <SyncIndicator />}</nav>;
}
```

### Ersparnis

Vorher: 14 Zeilen Logik pro Komponente, dreimal dupliziert = 42 Zeilen.
Nachher: 16 Zeilen Hook + 1 Zeile pro Komponente = 19 Zeilen.

Ersparnis: 23 Zeilen, plus die Garantie dass alle drei Stellen identisch funktionieren.

---

## Lösung 3.3 — Composition statt Prop-Drilling

### Markierte Stellen

```
AppLayout: erhaelt user und notifications, nutzt aber selbst nichts davon
Main: erhaelt user, nutzt selbst nichts
Sidebar: erhaelt user, gibt nur weiter an UserAvatar
```

### Mit Composition

```tsx
function App() {
  const { data: user } = useUser('me');
  const { data: notifications } = useNotifications();

  return (
    <AppLayout
      header={
        <Header>
          <UserMenu user={user} />
          <NotificationBell notifications={notifications} />
        </Header>
      }
    >
      <Main
        sidebar={
          <Sidebar>
            <UserAvatar user={user} />
            <NavLinks />
          </Sidebar>
        }
      >
        <Content />
      </Main>
    </AppLayout>
  );
}

function AppLayout({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      {header}
      {children}
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return <header><Logo />{children}</header>;
}

function Main({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return <main>{sidebar}{children}</main>;
}

function Sidebar({ children }: { children: React.ReactNode }) {
  return <aside>{children}</aside>;
}
```

### Container vs. Slots

Container-Komponenten (definieren Struktur): `AppLayout`, `Header`, `Main`, `Sidebar`
Slots (werden eingesetzt): `UserMenu`, `NotificationBell`, `UserAvatar`, `NavLinks`, `Content`

### Composition vs. Context

Context wäre auch möglich gewesen. Composition ist hier oft besser weil:

- Die Datenherkunft im Code sichtbar bleibt (App entscheidet wer was bekommt)
- Keine zusätzliche Abstraktion nötig
- Komponenten bleiben in jedem Kontext wiederverwendbar
- Keine Performance-Überraschungen durch Context-Propagation

---

## Lösung 3.4 — Compound Component

```tsx
import { createContext, useContext, useState } from 'react';

type TabsContextValue = {
  activeValue: string;
  setActive: (v: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs-Subkomponente muss innerhalb von <Tabs> verwendet werden');
  }
  return ctx;
}

export function Tabs({
  defaultValue,
  value,
  onChange,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  // Unkontrollierter Modus mit defaultValue
  const [internal, setInternal] = useState(defaultValue ?? '');

  // Kontrollierter Modus wenn value gesetzt ist
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internal;
  const setActive = (v: string) => {
    if (!isControlled) setInternal(v);
    onChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeValue, setActive } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(value)}
      data-active={isActive}
    >
      {children}
    </button>
  );
}

export function TabsPanel({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { activeValue } = useTabsContext();
  if (activeValue !== value) return null;
  return <div role="tabpanel">{children}</div>;
}
```

### Verhalten ausserhalb von Tabs

Wenn jemand `TabsTrigger` ohne umgebendes `<Tabs>` verwendet, wirft `useTabsContext` eine klare Fehlermeldung. Damit ist der Fehler beim Entwickeln sofort sichtbar.

### Kontrollierter Modus

Wenn `value` und `onChange` als Props gesetzt sind, schaltet sich die Komponente in den kontrollierten Modus. Der State liegt dann beim Aufrufer:

```tsx
function App() {
  const [tab, setTab] = useState('overview');
  return (
    <Tabs value={tab} onChange={setTab}>
      ...
    </Tabs>
  );
}
```

---

## Lösung 3.5 — Context Performance-Problem

### Warum ThemeButton bei Cart-Änderungen rendert

`AppContext` wird bei jeder State-Änderung mit einem neuen Wert-Objekt versorgt (das `value` wird im Render neu erstellt). Jede Komponente die `AppContext` konsumiert rendert deshalb bei jeder Änderung neu, unabhängig davon welchen Teil sie liest.

### Aufgeteilte Provider

```tsx
// Eigene Contexts pro fachlichem Bereich
const UserContext = createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
} | null>(null);

const CartContext = createContext<{
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
} | null>(null);

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
} | null>(null);

const NotificationsContext = createContext<{
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
} | null>(null);

const MenuContext = createContext<{
  isMenuOpen: boolean;
  toggleMenu: () => void;
} | null>(null);

function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const value = useMemo(() => ({
    cart,
    addToCart: (item: CartItem) => setCart(c => [...c, item]),
    removeFromCart: (id: string) => setCart(c => c.filter(i => i.id !== id)),
  }), [cart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Composed Provider
function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

### Profitierende Komponenten

`ThemeButton` rendert nur noch bei Theme-Änderungen. `CartBadge` nur bei Cart-Änderungen. Nutzerwechsel triggert keine Theme-Renders.

### Zustand für den Cart

Ja, für den Cart wäre Zustand sinnvoller. Argumente:

- Cart-Aktionen werden von vielen Stellen ausgelöst (Add, Remove, Clear, Update Qty)
- Performance: Zustand erlaubt selektives Abonnieren ohne mehrere Contexts
- Persistenz: Zustand hat eine fertige `persist`-Middleware
- Boilerplate: weniger als ein Provider mit useReducer

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set(s => ({ items: [...s.items, item] })),
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
    }),
    { name: 'cart' }
  )
);
```
