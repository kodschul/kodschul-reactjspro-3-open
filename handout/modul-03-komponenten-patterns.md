# Modul 3: Komponenten-Patterns und Architektur

---

## Lab 3.1 — Komponenten sinnvoll schneiden

### Das Problem

```tsx
function UserCard({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <Skeleton />;

  return (
    <div>
      <img src={user.avatar} />
      <h2>{user.name}</h2>
      <button onClick={() => setIsExpanded(p => !p)}>Details</button>
      {isExpanded && <p>{user.bio}</p>}
    </div>
  );
}
```

### Daten und Darstellung trennen

```tsx
// Nur Darstellung — keine Ahnung woher die Daten kommen
function UserCardView({
  user,
  isExpanded,
  onToggle,
}: {
  user: User;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <img src={user.avatar} />
      <h2>{user.name}</h2>
      <button onClick={onToggle}>Details</button>
      {isExpanded && <p>{user.bio}</p>}
    </div>
  );
}

// Nur Datenbeschaffung — keine Darstellungsdetails
function UserCard({ userId }: { userId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (!user) return <Skeleton />;

  return (
    <UserCardView
      user={user}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(p => !p)}
    />
  );
}
```

### State so nah wie möglich platzieren

```tsx
// Jeder Tastendruck rendert die gesamte Seite
function ProductPage() {
  const [search, setSearch] = useState('');
  const { data: products = [] } = useQuery({ ... });

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <ProductTable products={products} />
      <RecommendationsSidebar />
    </div>
  );
}
```

```tsx
// SearchBar verwaltet ihren eigenen State
// ProductTable und RecommendationsSidebar rendern nicht mehr bei jedem Tastendruck
function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [search, setSearch] = useState('');

  return (
    <input
      value={search}
      onChange={e => {
        setSearch(e.target.value);
        onSearch(e.target.value);
      }}
    />
  );
}
```

---

## Lab 3.2 — Geteilte Logik mit Custom Hooks

### Vom duplizierten Code zum Custom Hook

```tsx
// Dieselbe Logik in zwei Komponenten
const [windowWidth, setWindowWidth] = useState(window.innerWidth);

useEffect(() => {
  const handler = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

```tsx
// Extraktion
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return width;
}

function ComponentA() {
  const width = useWindowWidth();
  return <div>{width > 768 ? 'Desktop' : 'Mobil'}</div>;
}

function ComponentB() {
  const width = useWindowWidth();
  return <nav>{width > 768 ? <FullNav /> : <MobileNav />}</nav>;
}
```

### useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function setValue(value: T | ((prev: T) => T)) {
    try {
      const toStore = value instanceof Function ? value(stored) : value;
      setStored(toStore);
      window.localStorage.setItem(key, JSON.stringify(toStore));
    } catch (err) {
      console.error(err);
    }
  }

  return [stored, setValue] as const;
}

function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="light">Hell</option>
      <option value="dark">Dunkel</option>
    </select>
  );
}
```

### Custom Hook mit API-Logik

```tsx
function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}`, { signal }).then(r => {
        if (!r.ok) throw new Error('Nutzer nicht gefunden');
        return r.json();
      }),
    staleTime: 5 * 60 * 1000,
  });
}
```

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending, error } = useUser(userId);

  if (isPending) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <ProfileView user={user} />;
}

function UserBadge({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  return <span>{user?.name ?? '...'}</span>;
}
```

### Wann ein Hook zu groß ist

```tsx
// Klar beschreibbar
function useDebounce<T>(value: T, delay: number): T { ... }
function useDisclosure(initial = false) { ... }
function useWindowWidth() { ... }

// Zu viele Verantwortlichkeiten
function useUserDashboard(userId: string) {
  // Laedt Nutzerdaten
  // Verwaltet Formular-State
  // Schickt Updates an die API
  // Steuert Modal-Sichtbarkeit
  // Trackt Analytics-Events
}
```

---

## Lab 3.3 — Composition als Architekturprinzip

### Die Idee

```tsx
// Ohne Composition — die Komponente kennt ihren Inhalt
function Card() {
  return (
    <div className="card">
      <h2>Titel</h2>
      <p>Inhalt</p>
    </div>
  );
}

// Mit Composition — die Komponente empfängt ihren Inhalt
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
```

### Composition löst Prop-Drilling

```tsx
// user wird durch Layout und Sidebar durchgereicht
// obwohl beide Komponenten selbst nichts damit anfangen
function App() {
  const { data: user } = useUser('me');
  return <Layout user={user} />;
}

function Layout({ user }: { user: User }) {
  return <main><Sidebar user={user} /></main>;
}

function Sidebar({ user }: { user: User }) {
  return <aside><UserAvatar user={user} /></aside>;
}
```

```tsx
// App entscheidet was in Layout und Sidebar hineinkommt
// Layout und Sidebar wissen nichts ueber user
function App() {
  const { data: user } = useUser('me');

  return (
    <Layout>
      <Sidebar>
        <UserAvatar user={user} />
      </Sidebar>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}

function Sidebar({ children }: { children: React.ReactNode }) {
  return <aside>{children}</aside>;
}
```

### Benannte Slots

```tsx
function PageLayout({
  header,
  sidebar,
  children,
}: {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <header>{header}</header>
      <div className="content">
        <aside>{sidebar}</aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

<PageLayout
  header={<TopNav user={currentUser} />}
  sidebar={<FilterPanel filters={activeFilters} />}
>
  <ProductGrid products={products} />
</PageLayout>
```

### Compound Components

```tsx
const AccordionContext = createContext<{
  openId: string | null;
  toggle: (id: string) => void;
} | null>(null);

function Accordion({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId(p => p === id ? null : id);

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, title, children }: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('AccordionItem muss innerhalb von Accordion stehen');

  return (
    <div>
      <button onClick={() => ctx.toggle(id)}>{title}</button>
      {ctx.openId === id && <div>{children}</div>}
    </div>
  );
}
```

```tsx
// Der Aufrufer sieht keine State-Logik
<Accordion>
  <AccordionItem id="a" title="Versand">
    Lieferzeit 2 bis 3 Werktage.
  </AccordionItem>
  <AccordionItem id="b" title="Rueckgabe">
    30 Tage kostenlos.
  </AccordionItem>
</Accordion>
```

### Wann nicht abstrahieren

```tsx
// Zu frueh abstrahiert
function DataDisplayWidget<T>({
  renderHeader,
  renderContent,
  renderFooter,
  onAction,
  variant,
}: ComplexGenericProps<T>) { ... }

// Besser: konkret beginnen
function UserCard({ user }: { user: User }) { ... }
function ProductCard({ product }: { product: Product }) { ... }

// Erst wenn eine gemeinsame Basis wirklich erkennbar ist:
function Card({ title, children }: {
  title: string;
  children: React.ReactNode;
}) { ... }
```

---

## Lab 3.4 — Context bewusst einsetzen

### Wann Context sinnvoll ist

```tsx
const ThemeContext = createContext<'light' | 'dark'>('light');

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

function DeepButton() {
  const theme = useContext(ThemeContext);
  return <button data-theme={theme}>Aktion</button>;
}
```

### Das Performance-Problem

```tsx
// Ein grosser Context mit vielen Werten
const AppContext = createContext<{
  user: User;
  theme: string;
  cartItems: CartItem[];
  notifications: Notification[];
}>(...);

// Diese Komponente braucht nur theme
// Sie rendert aber auch bei jeder Cart- und Notification-Aenderung
function DeepButton() {
  const { theme } = useContext(AppContext);
  return <button data-theme={theme}>Aktion</button>;
}
```

### Context aufteilen

```tsx
const UserContext    = createContext<User | null>(null);
const ThemeContext   = createContext<'light' | 'dark'>('light');
const CartContext    = createContext<CartItem[]>([]);

// Rendert nur bei Theme-Aenderungen
function DeepButton() {
  const theme = useContext(ThemeContext);
  return <button data-theme={theme}>Aktion</button>;
}

// Rendert nur bei Cart-Aenderungen
function CartBadge() {
  const items = useContext(CartContext);
  return <span>{items.length}</span>;
}
```

### Context mit useReducer

```tsx
type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD':    return { items: [...state.items, action.item] };
    case 'REMOVE': return { items: state.items.filter(i => i.id !== action.id) };
    case 'CLEAR':  return { items: [] };
  }
}
```

```tsx
const CartStateContext    = createContext<CartState>({ items: [] });
const CartDispatchContext = createContext<React.Dispatch<CartAction>>(() => {});

function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
}

function useCart()         { return useContext(CartStateContext); }
function useCartDispatch() { return useContext(CartDispatchContext); }
```

```tsx
// Rendert nicht neu wenn sich der Cart-State aendert
function AddToCartButton({ item }: { item: CartItem }) {
  const dispatch = useCartDispatch();
  return (
    <button onClick={() => dispatch({ type: 'ADD', item })}>
      In den Warenkorb
    </button>
  );
}

// Rendert nur wenn sich der Cart-State aendert
function CartSummary() {
  const { items } = useCart();
  return <p>{items.length} Artikel im Warenkorb</p>;
}
```
