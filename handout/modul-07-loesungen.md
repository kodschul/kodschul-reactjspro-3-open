# Modul 7 — Lösungen

---

## Lösung 7.1 — useState oder useReducer

### Einzelne useState-Kandidaten

```
- Aktueller Schritt — primitive Zahl, einzelnes setState reicht
- Bestellbestaetigung gelesen — Boolean, einzeln
```

### Zusammengehörige Gruppen

```
Liefer- und Rechnungsadresse:
  Beide haben dieselbe Struktur, hängen logisch zusammen.

Submit-Status:
  Ein Statuswert — useState reicht.

Zahlungsart:
  Einzeln, useState.
```

### Reducer-Frage

Ja, ein `useReducer` für den gesamten Bestellprozess macht hier Sinn. Begründung:

- Die Schritte beeinflussen sich gegenseitig (z.B. Schritt 3 nur erreichbar wenn Schritt 2 valide)
- Der Submit-Status hängt mit anderen States zusammen (während submitting darf nichts geändert werden)
- Logging und Debugging ist einfacher wenn alle Aktionen explizit benannt sind

### Action-Skizze

```tsx
type CheckoutAction =
  | { type: 'SET_STEP'; step: 1 | 2 | 3 }
  | { type: 'SET_DELIVERY_ADDRESS'; address: Address }
  | { type: 'SET_BILLING_SAME_AS_DELIVERY'; same: boolean }
  | { type: 'SET_BILLING_ADDRESS'; address: Address }
  | { type: 'SET_PAYMENT_METHOD'; method: 'card' | 'invoice' | 'prepay' }
  | { type: 'CONFIRM_TERMS'; confirmed: boolean }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string };
```

---

## Lösung 7.2 — useReducer von Grund auf

### State und Actions

```tsx
type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type Filter = 'all' | 'open' | 'done';

type TodoState = {
  todos: Todo[];
  filter: Filter;
};

type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_FILTER'; filter: Filter };
```

### Reducer

```tsx
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text: action.text, completed: false },
        ],
      };

    case 'TOGGLE':
      return {
        ...state,
        todos: state.todos.map(t =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        ),
      };

    case 'DELETE':
      return {
        ...state,
        todos: state.todos.filter(t => t.id !== action.id),
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(t => !t.completed),
      };

    case 'SET_FILTER':
      return { ...state, filter: action.filter };
  }
}
```

### Komponente

```tsx
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
  });

  // Derived State direkt im Render — kein separater State
  const visible = state.todos.filter(t => {
    if (state.filter === 'open') return !t.completed;
    if (state.filter === 'done') return t.completed;
    return true;
  });

  return (
    <div>
      <AddTodoForm onAdd={text => dispatch({ type: 'ADD', text })} />

      <FilterButtons
        current={state.filter}
        onChange={f => dispatch({ type: 'SET_FILTER', filter: f })}
      />

      <ul>
        {visible.map(t => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => dispatch({ type: 'TOGGLE', id: t.id })}
            />
            <span>{t.text}</span>
            <button onClick={() => dispatch({ type: 'DELETE', id: t.id })}>
              Löschen
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}>
        Erledigte löschen
      </button>
    </div>
  );
}
```

### Wo lebt der gefilterte State

Berechnet beim Rendern. Begründung:

- Vermeidet doppelten State (todos und filtered todos)
- Keine Synchronisation nötig
- Ist immer korrekt — keine Möglichkeit für Inkonsistenz
- Performance ist vernachlässigbar bei normaler Listenlänge

---

## Lösung 7.3 — State-Architektur bewerten

### Klassifikation

```
products + isLoadingProducts + fetchProducts  -> Server-State
user + isLoadingUser + fetchUser              -> Server-State
cart + addToCart + removeFromCart             -> Client-State (global)
isMenuOpen + toggleMenu                       -> UI-State (global, weil Header und Menu zusammenhaengen)
isCartDrawerOpen + toggleCartDrawer           -> UI-State (eventuell global)
searchQuery + setSearchQuery                  -> UI-State (meist lokal!)
```

### Im falschen Bucket

```
products: gehoert nicht in den globalen Store, sondern in react-query
user: dito, react-query
searchQuery: gehoert wahrscheinlich lokal in die Suchkomponente, nicht global
isCartDrawerOpen: ist UI-State, koennte global oder lokal sein — meist global ok
```

### Saubere Architektur

```tsx
// Server-State: react-query
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetch('/api/user').then(r => r.json()),
  });
}

// Client-State: Zustand, nur was wirklich global ist
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set(s => ({ items: [...s.items, item] })),
  removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
}));

// UI-State: Zustand, nur was global gebraucht wird
const useUIStore = create((set) => ({
  isMenuOpen: false,
  isCartDrawerOpen: false,
  toggleMenu:        () => set(s => ({ isMenuOpen: !s.isMenuOpen })),
  toggleCartDrawer:  () => set(s => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),
}));

// searchQuery: lokal in der Suchkomponente
function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products = [] } = useProducts();

  const filtered = products.filter(p => p.name.includes(searchQuery));
  // ...
}
```

### Welche States nicht global

`searchQuery` und `isCartDrawerOpen` (eventuell). `searchQuery` ist meist nur an einer Stelle relevant. `isCartDrawerOpen` ist ein Grenzfall — wenn der Drawer von verschiedenen Stellen geöffnet werden muss (Header-Icon, "Buy now"-Button), ist global sinnvoll.

---

## Lösung 7.4 — Zustand-Store strukturieren

### Implementation

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(i => i.productId === newItem.productId);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter(i => i.productId !== productId)
            : state.items.map(i =>
                i.productId === productId ? { ...i, quantity } : i
              ),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);
```

### Drei Komponenten

```tsx
// Liest nur die Anzahl — rendert nur wenn sich items.length aendert
function CartBadge() {
  const itemCount = useCartStore(state =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  return <span>{itemCount}</span>;
}

// Liest Gesamtpreis — rendert nur wenn sich der Preis aendert
function CartTotal() {
  const total = useCartStore(state =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
  return <p>Gesamt: {total.toFixed(2)} EUR</p>;
}

// Voller Cart — rendert bei jeder Aenderung
function CartList() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  return (
    <ul>
      {items.map(item => (
        <li key={item.productId}>
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={e => updateQuantity(item.productId, Number(e.target.value))}
          />
          <button onClick={() => removeItem(item.productId)}>Entfernen</button>
        </li>
      ))}
    </ul>
  );
}
```

### Wie verhindere ich unnötige Re-Renders

Zustand vergleicht den Selector-Output mit dem vorherigen Wert. Wenn der Selector denselben Wert zurückgibt, rendert die Komponente nicht neu. Wichtig:

- **Primitive Werte zurückgeben** wenn möglich (number, string, boolean)
- **Bei Objekten/Arrays**: Shallow-Equality-Vergleich aktivieren via `useShallow` aus zustand

```tsx
import { useShallow } from 'zustand/react/shallow';

function CartActions() {
  const { addItem, removeItem } = useCartStore(
    useShallow((state) => ({
      addItem: state.addItem,
      removeItem: state.removeItem,
    }))
  );
  // ...
}
```

---

## Lösung 7.5 — Trade-offs entscheiden

### Bewertung

| Szenario | Lösung | Begründung |
|---|---|---|
| A — Modal offen/zu | useState | Lokaler einfacher State, keine globale Sichtbarkeit nötig. |
| B — Multi-Step Wizard | useReducer | Komplexe Übergänge mit klaren Aktionen. Reducer macht das Verhalten testbar und lesbar. |
| C — Eingeloggter Nutzer | react-query | Server-State, nicht Client-State. Caching und Refetch eingebaut. |
| D — Produktliste mit TTL | react-query | Genau dafür gemacht: Caching, staleTime, Refetch. |
| E — Theme-Einstellungen | Context | Selten ändernd, tief im Baum gebraucht. Klassischer Context-Fall. |
| F — Shopping-Cart persistent + Sync | Zustand mit persist | Persistenz und Tab-Sync sind eingebaut. State ist global. |
| G — Lokaler Filter | useState | Nur an einer Stelle relevant, kein Grund für globale Lösung. |

### Faustregeln

```
Server-Daten -> react-query, niemals in Client-State Stores
Lokal gebraucht -> useState
Komplex aber lokal -> useReducer
Einfach aber global -> Context oder Zustand
Komplex und global -> Zustand
Persistenz oder Tab-Sync noetig -> Zustand mit persist Middleware
```

Die einfachste Lösung die das Problem löst ist meistens die richtige.
