# Modul 10: Testing in React

---

## Lab 10.1 — Teststrategie festlegen

### Werkzeuge einrichten

```bash
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D @testing-library/jest-dom jsdom
```

```bash
npm install -D jest jest-environment-jsdom @testing-library/react
npm install -D @testing-library/user-event @testing-library/jest-dom
```

### Vitest konfigurieren

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
// Macht Matcher wie toBeInTheDocument(), toHaveValue() verfuegbar
```

### Was in welche Testart gehört

```ts
// Reducer, Hilfsfunktionen, Custom Hooks mit einfacher Logik
function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2) + ' EUR';
}

test('formatPrice rechnet Cent in Euro um', () => {
  expect(formatPrice(1999)).toBe('19.99 EUR');
  expect(formatPrice(100)).toBe('1.00 EUR');
});
```

### Integrationstests-Beispiele

```
Formular abschicken und Erfolgsmeldung pruefen
Nutzer klickt auf Filter und Liste aktualisiert sich
Fehlerfall: API schlaegt fehl, Fehlermeldung erscheint
```

### E2E Tests-Beispiele

```
Registrierung von Anfang bis Ende
Checkout-Prozess komplett durchlaufen
Login und Weiterleitung zur geschuetzten Seite
```

---

## Lab 10.2 — React Testing Library richtig einsetzen

### Queries — bevorzugte Reihenfolge

```
Bevorzugte Reihenfolge:

getByRole          — Semantische Rolle, zugaenglichste Option
getByLabelText     — Label eines Formularfelds
getByPlaceholderText — Placeholder-Text
getByText          — Sichtbarer Text
getByDisplayValue  — Aktueller Wert eines Inputs
getByAltText       — Alt-Text eines Bildes
getByTitle         — Title-Attribut
getByTestId        — data-testid, letzter Ausweg
```

### Counter-Beispiel

```tsx
// components/Counter.tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Aktueller Wert: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Erhoehen</button>
      <button onClick={() => setCount(c => c - 1)}>Verringern</button>
    </div>
  );
}
```

```tsx
// components/Counter.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

test('zeigt den initialen Wert an', () => {
  render(<Counter />);
  expect(screen.getByText('Aktueller Wert: 0')).toBeInTheDocument();
});

test('erhoehen funktioniert', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: 'Erhoehen' }));

  expect(screen.getByText('Aktueller Wert: 1')).toBeInTheDocument();
});

test('mehrfaches Klicken summiert sich', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole('button', { name: 'Erhoehen' }));
  await user.click(screen.getByRole('button', { name: 'Erhoehen' }));
  await user.click(screen.getByRole('button', { name: 'Erhoehen' }));

  expect(screen.getByText('Aktueller Wert: 3')).toBeInTheDocument();
});
```

### Formulare testen

```tsx
// components/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email:    z.string().email('Ungueltige E-Mail'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email">E-Mail</label>
      <input id="email" {...register('email')} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="password">Passwort</label>
      <input id="password" type="password" {...register('password')} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <button type="submit">Anmelden</button>
    </form>
  );
}
```

```tsx
// components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

test('ruft onSubmit mit korrekten Daten auf', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText('E-Mail'), 'test@example.com');
  await user.type(screen.getByLabelText('Passwort'), 'sicheres-passwort');
  await user.click(screen.getByRole('button', { name: 'Anmelden' }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email:    'test@example.com',
    password: 'sicheres-passwort',
  });
});

test('zeigt Validierungsfehler bei ungültiger E-Mail', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={vi.fn()} />);

  await user.type(screen.getByLabelText('E-Mail'), 'keine-email');
  await user.click(screen.getByRole('button', { name: 'Anmelden' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Ungueltige E-Mail');
});

test('verhindert Submit ohne Passwort', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText('E-Mail'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: 'Anmelden' }));

  expect(handleSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('Mindestens 8 Zeichen');
});
```

### Asynchrone Komponenten testen

```tsx
// components/ProductList.tsx
import { useQuery } from '@tanstack/react-query';

export function ProductList() {
  const { data: products, isPending, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });

  if (isPending) return <p>Wird geladen...</p>;
  if (error)     return <p role="alert">Fehler beim Laden</p>;

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

```tsx
// components/ProductList.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductList } from './ProductList';

// Hilfsfunktion um den QueryClient-Provider nicht in jedem Test zu wiederholen
function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

test('zeigt Produkte nach dem Laden', async () => {
  // fetch mocken
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([
      { id: '1', name: 'Produkt A' },
      { id: '2', name: 'Produkt B' },
    ]),
  });

  renderWithQuery(<ProductList />);

  // Loading-State pruefen
  expect(screen.getByText('Wird geladen...')).toBeInTheDocument();

  // Auf geladene Daten warten
  expect(await screen.findByText('Produkt A')).toBeInTheDocument();
  expect(screen.getByText('Produkt B')).toBeInTheDocument();
});

test('zeigt Fehlermeldung wenn API fehlschlaegt', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Netzwerkfehler'));

  renderWithQuery(<ProductList />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Fehler beim Laden');
});
```

---

## Lab 10.3 — Anti-Patterns erkennen

### Tests die Implementierungsdetails kennen

```tsx
// Schlechter Test — testet interne Details
test('setzt isLoading auf true beim Fetch', () => {
  const { result } = renderHook(() => useProducts());

  // Interner State — aendert sich bei Refactoring
  expect(result.current.isLoading).toBe(true);
});

// Guter Test — testet was der Nutzer sieht
test('zeigt Ladeindikator waehrend Daten geladen werden', async () => {
  render(<ProductList />);
  expect(screen.getByText('Wird geladen...')).toBeInTheDocument();
});
```

### Tests die zu stark auf Struktur angewiesen sind

```tsx
// Schlechter Test — bricht bei jeder HTML-Aenderung
test('rendert korrekt', () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(container.querySelector('.user-card__name')).toHaveTextContent('Max');
});

// Guter Test — robust gegenueber HTML-Aenderungen
test('zeigt den Nutzernamen an', () => {
  render(<UserCard user={mockUser} />);
  expect(screen.getByText('Max')).toBeInTheDocument();
});
```

### Snapshot-Tests ohne Mehrwert

```tsx
// Problematisch: Snapshot aendert sich bei jeder UI-Aenderung
test('entspricht dem Snapshot', () => {
  const { container } = render(<Button label="Klick mich" />);
  expect(container).toMatchSnapshot();
});
```

---

## Lab 10.4 — E2E Tests mit Playwright

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',  // Aufzeichnung bei Fehler fuer Debugging
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

### Kritische User Flows testen

```ts
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('Nutzer kann Produkt kaufen', async ({ page }) => {
  // Zur Produktseite navigieren
  await page.goto('/products/sneaker-classic');

  // Produkt in den Warenkorb
  await page.getByRole('button', { name: 'In den Warenkorb' }).click();

  // Warenkorb-Badge aktualisiert sich
  await expect(page.getByTestId('cart-badge')).toHaveText('1');

  // Zum Checkout
  await page.getByRole('link', { name: 'Warenkorb' }).click();
  await page.getByRole('button', { name: 'Zur Kasse' }).click();

  // Formular ausfullen
  await page.getByLabel('E-Mail').fill('test@example.com');
  await page.getByLabel('Kreditkartennummer').fill('4242424242424242');
  await page.getByLabel('Ablaufdatum').fill('12/28');
  await page.getByLabel('CVV').fill('123');

  // Bestellen
  await page.getByRole('button', { name: 'Jetzt kaufen' }).click();

  // Bestaetigung pruefen
  await expect(page.getByText('Bestellung erfolgreich')).toBeVisible();
});
```

### Netzwerkanfragen mocken

```ts
test('zeigt Fehlermeldung wenn Bezahlung fehlschlaegt', async ({ page }) => {
  // API-Antwort fuer diesen Test ueberschreiben
  await page.route('**/api/checkout', route =>
    route.fulfill({
      status: 402,
      body: JSON.stringify({ error: 'Zahlung abgelehnt' }),
    })
  );

  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Jetzt kaufen' }).click();

  await expect(page.getByRole('alert')).toHaveText('Zahlung abgelehnt');
});
```

### Wann E2E, wann Integrationstest

```
Integrationstest mit React Testing Library wenn:
  Komponenten-Logik und Zusammenspiel geprueft werden soll
  Kein echter Browser oder Server noetig ist
  Test schnell laufen soll

E2E Test mit Playwright wenn:
  Ein kompletter Nutzerfluss ueber mehrere Seiten geht
  Echtes Browser-Verhalten wichtig ist (Navigation, Cookies, Storage)
  Kritische Geschaeftsprozesse abgesichert werden sollen
```
