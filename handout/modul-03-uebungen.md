# Modul 3 — Übungen

> Aufgabe für alle Übungen: Monolith-Komponente in saubere Hooks und Komponenten zerlegen

---

## Übung 3.1 — Komponente sinnvoll schneiden

### Ausgangslage

```tsx
function ProductDetailPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`).then(r => r.json()).then(setProduct);
    fetch(`/api/products/${productId}/reviews`).then(r => r.json()).then(setReviews);
  }, [productId]);

  if (!product) return <Spinner />;

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const averageRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <article>
      <header>
        <img src={product.imageUrl} alt={product.name} />
        <h1>{product.name}</h1>
        <p>{product.price} EUR</p>
        <button onClick={() => setIsInWishlist(p => !p)}>
          {isInWishlist ? '★ Auf Wunschliste' : '☆ Zur Wunschliste'}
        </button>
      </header>

      <section>
        <h2>Beschreibung</h2>
        <p>{isExpanded ? product.fullDescription : product.shortDescription}</p>
        <button onClick={() => setIsExpanded(p => !p)}>
          {isExpanded ? 'Weniger' : 'Mehr lesen'}
        </button>
      </section>

      <section>
        <h2>Bewertungen ({reviews.length})</h2>
        <p>Durchschnitt: {averageRating.toFixed(1)}</p>
        <ul>
          {visibleReviews.map(r => (
            <li key={r.id}>
              <strong>{r.author}</strong>: {r.text}
            </li>
          ))}
        </ul>
        {!showAllReviews && reviews.length > 3 && (
          <button onClick={() => setShowAllReviews(true)}>
            Alle Bewertungen anzeigen
          </button>
        )}
      </section>
    </article>
  );
}
```

### Aufgaben

1. Identifiziere mindestens drei eigenständige Verantwortlichkeiten
2. Zerlege die Komponente in eine Container-Komponente und mehrere Darstellungs-Komponenten
3. Welche Komponenten könnten ihren State lokal halten?
4. Welche Komponenten sind ohne Mocks testbar?

---

## Übung 3.2 — Custom Hook extrahieren

### Ausgangslage

In drei verschiedenen Komponenten taucht dieselbe Logik auf:

```tsx
function ProductPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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

  return isOnline ? <ProductList /> : <OfflineWarning />;
}

function CheckoutPage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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

  return (
    <div>
      <CheckoutForm disabled={!isOnline} />
      {!isOnline && <p>Sie sind offline</p>}
    </div>
  );
}

function NavigationBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
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

  return <nav>{isOnline && <SyncIndicator />}</nav>;
}
```

### Aufgaben

1. Extrahiere die geteilte Logik in einen Custom Hook
2. Wie heißt der Hook? Lässt sich der Name in einem Satz beschreiben?
3. Schreibe alle drei Komponenten mit dem neuen Hook
4. Wie viele Zeilen Code sparst du dadurch?

---

## Übung 3.3 — Composition statt Prop-Drilling

### Ausgangslage

```tsx
function App() {
  const { data: user } = useUser('me');
  const { data: notifications } = useNotifications();
  return <AppLayout user={user} notifications={notifications} />;
}

function AppLayout({
  user,
  notifications,
}: {
  user: User;
  notifications: Notification[];
}) {
  return (
    <div>
      <Header user={user} notifications={notifications} />
      <Main user={user} />
    </div>
  );
}

function Header({
  user,
  notifications,
}: {
  user: User;
  notifications: Notification[];
}) {
  return (
    <header>
      <Logo />
      <UserMenu user={user} />
      <NotificationBell notifications={notifications} />
    </header>
  );
}

function Main({ user }: { user: User }) {
  return (
    <main>
      <Sidebar user={user} />
      <Content />
    </main>
  );
}

function Sidebar({ user }: { user: User }) {
  return (
    <aside>
      <UserAvatar user={user} />
      <NavLinks />
    </aside>
  );
}
```

### Aufgaben

1. Markiere alle Stellen an denen Props weitergereicht werden ohne dass die Komponente sie nutzt
2. Schreibe die Komponenten so um dass keine durchgereichten Props mehr existieren
3. Welche Komponenten werden als Container, welche als Slots verwendet?
4. Wäre Context hier auch eine Lösung gewesen? Warum ist Composition oft besser?

---

## Übung 3.4 — Compound Component bauen

### Aufgabe

Baue eine Tabs-Komponente nach dem Compound-Component-Muster. Die API soll so aussehen:

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Übersicht</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
  </TabsList>

  <TabsPanel value="overview">
    <h2>Übersicht</h2>
    <p>Allgemeine Informationen zum Produkt.</p>
  </TabsPanel>
  <TabsPanel value="details">
    <h2>Details</h2>
    <p>Technische Daten.</p>
  </TabsPanel>
  <TabsPanel value="reviews">
    <h2>Bewertungen</h2>
    <p>Alle Kundenbewertungen.</p>
  </TabsPanel>
</Tabs>
```

### Aufgaben

1. Implementiere `Tabs`, `TabsList`, `TabsTrigger` und `TabsPanel`
2. Verwende einen internen Context damit der State nicht von aussen verwaltet werden muss
3. Was passiert wenn jemand `TabsTrigger` ausserhalb von `Tabs` verwendet?
4. Wie könnte man optional auch einen kontrollierten Modus unterstützen?

---

## Übung 3.5 — Context Performance-Problem beheben

### Ausgangslage

Eine App mit globalem Context. Bei jeder kleinen Änderung rendert die halbe App neu.

```tsx
type AppContextValue = {
  user: User | null;
  cart: CartItem[];
  theme: 'light' | 'dark';
  notifications: Notification[];
  isMenuOpen: boolean;
  setUser: (u: User | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  setTheme: (t: 'light' | 'dark') => void;
  setNotifications: (n: Notification[]) => void;
  toggleMenu: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const value: AppContextValue = {
    user, cart, theme, notifications, isMenuOpen,
    setUser,
    addToCart: (item) => setCart(c => [...c, item]),
    removeFromCart: (id) => setCart(c => c.filter(i => i.id !== id)),
    setTheme,
    setNotifications,
    toggleMenu: () => setIsMenuOpen(p => !p),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function ThemeButton() {
  const ctx = useContext(AppContext)!;
  return <button data-theme={ctx.theme}>Theme</button>;
}

function CartBadge() {
  const ctx = useContext(AppContext)!;
  return <span>{ctx.cart.length}</span>;
}
```

### Aufgaben

1. Beschreibe konkret warum `ThemeButton` rendert wenn jemand etwas in den Cart legt
2. Teile den Context auf und schreibe die Provider neu
3. Welche Komponenten profitieren am meisten von der Aufteilung?
4. Wäre für den Cart hier eventuell schon Zustand sinnvoller?
