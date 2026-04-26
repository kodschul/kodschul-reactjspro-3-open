# Modul 8: Server State und API-Kommunikation

---

## Lab 8.1 — Warum useEffect und fetch nicht ausreichen

### Naiver Ansatz

```tsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorView error={error} />;
  return <List items={products} />;
}
```

---

## Lab 8.2 — Server State und Client State trennen

### Installation

```bash
npm install @tanstack/react-query
```

```bash
npm install @tanstack/react-query-devtools
```

### Einrichtung

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // Daten gelten 60 Sekunden als frisch
      retry: 2,                    // Bei Fehler zweimal wiederholen
      refetchOnWindowFocus: true,  // Refetch wenn Tab wieder aktiv wird
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      {/* DevTools nur im Development sichtbar */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### react-query DevTools — Status-Farben

```
gruen   — fresh, Daten sind aktuell
gelb    — stale, Daten koennen veraltet sein
grau    — inactive, Komponente ist nicht mehr gemountet
blau    — fetching, Request laeuft gerade
rot     — error, letzter Request ist fehlgeschlagen
```

### Die klare Trennung in der Praxis

```tsx
// Server State: react-query zustaendig
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });
}

// Client State: Zustand zustaendig
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

// Beide zusammen in einer Komponente
function ShopPage() {
  const { data: products, isPending } = useProducts();
  const cartItems = useCartStore(state => state.items);

  if (isPending) return <Spinner />;

  return (
    <div>
      <ProductGrid products={products} />
      <CartSidebar items={cartItems} />
    </div>
  );
}
```

### Warum API-Daten nicht in Zustand gehören

```tsx
// Haeufiger Fehler: API-Daten im globalen Store
const useStore = create((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    const data = await fetch('/api/products').then(r => r.json());
    set({ products: data, isLoading: false });
  },
}));
```

---

## Lab 8.3 — react-query professionell einsetzen

### Queries — der queryKey

```tsx
// Verschiedene Keys — separate Caches
useQuery({ queryKey: ['products'], ... })
useQuery({ queryKey: ['product', '1'], ... })
useQuery({ queryKey: ['product', '2'], ... })
useQuery({ queryKey: ['products', { category: 'shoes' }], ... })
```

```tsx
function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: ({ signal }) =>
      fetch(`/api/products/${id}`, { signal }).then(r => {
        if (!r.ok) throw new Error('Produkt nicht gefunden');
        return r.json();
      }),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,  // Nur ausfuehren wenn id vorhanden ist
  });
}
```

### Caching und Stale Time

```
fresh     — Daten sind aktuell, kein Refetch noetig
stale     — Daten koennen veraltet sein, Refetch beim naechsten Trigger
inactive  — Komponente die Query nutzte ist nicht mehr gemountet
```

```tsx
useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000,   // 5 Minuten frisch, danach stale
  gcTime: 10 * 60 * 1000,     // 10 Minuten im Cache behalten wenn inaktiv
})
```

### Refetch-Trigger

```
Komponente mountet neu
Browserfenster bekommt wieder Fokus
Netzwerkverbindung wird wiederhergestellt
Manueller Refetch
Festgelegtes Intervall mit refetchInterval
```

### Mutations — Daten verändern

```tsx
function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Product) =>
      fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }).then(r => r.json()),

    onSuccess: (updatedProduct) => {
      // Cache fuer dieses Produkt direkt aktualisieren
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);

      // Produktliste als veraltet markieren und neu laden
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },

    onError: (error) => {
      console.error('Update fehlgeschlagen:', error);
    },
  });
}
```

```tsx
function ProductEditForm({ product }: { product: Product }) {
  const { mutate, isPending, error } = useUpdateProduct();

  return (
    <form onSubmit={data => mutate(data)}>
      <button disabled={isPending}>
        {isPending ? 'Wird gespeichert...' : 'Speichern'}
      </button>
      {error && <p>Fehler beim Speichern</p>}
    </form>
  );
}
```

### Optimistic Updates

```tsx
function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      fetch(`/api/products/${productId}/favorite`, { method: 'POST' }),

    onMutate: async (productId) => {
      // Laufende Refetches stoppen damit sie nicht ueberschreiben
      await queryClient.cancelQueries({ queryKey: ['product', productId] });

      // Aktuellen Zustand sichern fuer Rollback
      const previous = queryClient.getQueryData(['product', productId]);

      // Cache sofort optimistisch aktualisieren
      queryClient.setQueryData(['product', productId], (old: Product) => ({
        ...old,
        isFavorite: !old.isFavorite,
      }));

      return { previous };
    },

    onError: (err, productId, context) => {
      // Bei Fehler: vorherigen Zustand wiederherstellen
      queryClient.setQueryData(['product', productId], context?.previous);
    },

    onSettled: (data, error, productId) => {
      // Nach Erfolg oder Fehler: mit Server abgleichen
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}
```

### Abhängige und parallele Queries

```tsx
// Abhaengige Query — wartet auf Ergebnis der ersten
function useUserOrders(userId: string) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  return useQuery({
    queryKey: ['orders', user?.accountId],
    queryFn: () => fetchOrders(user!.accountId),
    enabled: !!user?.accountId,
  });
}

// Parallele Queries — starten gleichzeitig
function useDashboard() {
  const products = useQuery({ queryKey: ['products'], queryFn: fetchProducts });
  const stats    = useQuery({ queryKey: ['stats'],    queryFn: fetchStats });

  return {
    products: products.data,
    stats: stats.data,
    isPending: products.isPending || stats.isPending,
  };
}
```

---

## Lab 8.4 — Naiven Code zu react-query migrieren

### Ausgangssituation

```tsx
function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders]     = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    fetch(`/api/users/${userId}/orders`)
      .then(r => r.json())
      .then(data => {
        if (!ignore) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!ignore) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { ignore = true; };
  }, [userId]);

  if (isLoading) return <Spinner />;
  if (error) return <p>Fehler beim Laden</p>;
  return <OrderList orders={orders} />;
}
```

### Nach der Migration

```tsx
function useOrders(userId: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: ({ signal }) =>
      fetch(`/api/users/${userId}/orders`, { signal }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('404')) return false;
      return failureCount < 2;
    },
  });
}

function OrderHistory({ userId }: { userId: string }) {
  const { data: orders, isPending, error, isRefetching } = useOrders(userId);

  if (isPending) return <Spinner />;
  if (error) return <ErrorView error={error} />;

  return (
    <div>
      {isRefetching && <RefreshIndicator />}
      <OrderList orders={orders} />
    </div>
  );
}
```
