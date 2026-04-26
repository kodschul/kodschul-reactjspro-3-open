# Modul 7: State Management fundiert auswählen

---

## Lab 7.1 — Lokalen State mit useState und useReducer

### Drei Fragen zur Einordnung

```
Bleibt der Wert über Re-Renders gleich?
  -> useRef oder Konstante ausserhalb der Komponente

Kann der Wert aus anderen State- oder Prop-Werten berechnet werden?
  -> Kein State, direkt im Render berechnen

Löst eine Änderung dieses Wertes einen Re-Render aus?
  -> State
```

### useState — wann er ausreicht

```tsx
// Gut fuer useState: unabhaengige, einfache Werte
const [isOpen, setIsOpen]     = useState(false);
const [query, setQuery]       = useState('');
const [page, setPage]         = useState(1);
```

```tsx
const [position, setPosition] = useState({ x: 0, y: 0 });

function handleMove(e: MouseEvent) {
  setPosition({ x: e.clientX, y: e.clientY });
}
```

### Wann useState an seine Grenzen stößt

```tsx
// Viele zusammenhaengende States die sich gegenseitig beeinflussen
const [isLoading, setIsLoading] = useState(false);
const [data, setData]           = useState(null);
const [error, setError]         = useState(null);
const [page, setPage]           = useState(1);
const [totalPages, setTotalPages] = useState(0);

// Die Aktualisierung muss immer koordiniert werden
async function fetchPage(p: number) {
  setIsLoading(true);
  setError(null);
  try {
    const result = await fetchData(p);
    setData(result.data);
    setTotalPages(result.totalPages);
    setPage(p);
  } catch (err) {
    setError(err);
  } finally {
    setIsLoading(false);
  }
}
```

### useReducer — Struktur für komplexen State

```tsx
type State = {
  isLoading: boolean;
  data: Product[] | null;
  error: Error | null;
  page: number;
  totalPages: number;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: Product[]; totalPages: number; page: number }
  | { type: 'FETCH_ERROR'; error: Error }

const initialState: State = {
  isLoading: false,
  data: null,
  error: null,
  page: 1,
  totalPages: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: action.data,
        totalPages: action.totalPages,
        page: action.page,
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error };
  }
}
```

```tsx
function ProductList() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function fetchPage(page: number) {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await fetchData(page);
      dispatch({ type: 'FETCH_SUCCESS', data: result.data, totalPages: result.totalPages, page });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: err as Error });
    }
  }

  return ( ... );
}
```

---

## Lab 7.2 — Weiterführende State-Management-Ansätze

### Zustand

```tsx
import { create } from 'zustand';

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter(i => i.id !== id) })),

  clear: () => set({ items: [] }),
}));
```

```tsx
// Komponenten abonnieren nur was sie brauchen
function CartBadge() {
  const itemCount = useCartStore(state => state.items.length);
  return <span>{itemCount}</span>;
}

function AddToCartButton({ item }: { item: CartItem }) {
  const addItem = useCartStore(state => state.addItem);
  return <button onClick={() => addItem(item)}>Hinzufuegen</button>;
}
```

### Jotai

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

const cartItemsAtom = atom<CartItem[]>([]);

// Abgeleitetes Atom — wird automatisch neu berechnet wenn cartItemsAtom sich aendert
const cartCountAtom = atom((get) => get(cartItemsAtom).length);

// Schreib-Atom mit Logik
const addItemAtom = atom(
  null,
  (get, set, item: CartItem) => {
    set(cartItemsAtom, [...get(cartItemsAtom), item]);
  }
);
```

```tsx
function CartBadge() {
  const count = useAtomValue(cartCountAtom);
  return <span>{count}</span>;
}

function AddToCartButton({ item }: { item: CartItem }) {
  const addItem = useSetAtom(addItemAtom);
  return <button onClick={() => addItem(item)}>Hinzufuegen</button>;
}
```

---

## Lab 7.3 — Trade-offs bewerten

### Server-State und Client-State nicht vermischen

```tsx
// Falsch: API-Daten im globalen Store
const useProductStore = create((set) => ({
  products: [],
  fetchProducts: async () => {
    const data = await fetch('/api/products').then(r => r.json());
    set({ products: data });
  },
}));

// Richtig: API-Daten in react-query, nur echten Client-State im Store
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

function ProductPage() {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const cartItems = useCartStore(state => state.items);
}
```

---

## Lab 7.4 — State-Architekturen analysieren und verbessern

### Ein typisches Architekturproblem

```tsx
// Alles im globalen Store — auch Dinge die dort nicht hingehoeren
const useAppStore = create((set, get) => ({
  // Server-State — gehoert in react-query
  products: [],
  isLoadingProducts: false,
  fetchProducts: async () => {
    set({ isLoadingProducts: true });
    const data = await fetch('/api/products').then(r => r.json());
    set({ products: data, isLoadingProducts: false });
  },

  // UI-State der nur lokal gebraucht wird
  isFilterPanelOpen: false,
  toggleFilterPanel: () =>
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

  // Echter globaler State — hier richtig
  cartItems: [],
  addToCart: (item) =>
    set((state) => ({ cartItems: [...state.cartItems, item] })),
}));
```

### Die aufgeräumte Version

```tsx
// Server-State: react-query
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });
}

// Globaler Client-State: nur was wirklich global ist
const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));

// Lokaler UI-State: bleibt in der Komponente
function ProductPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: products } = useProducts();
  const cartItems = useCartStore(state => state.items);

  return ( ... );
}
```
