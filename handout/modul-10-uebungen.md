# Modul 10 — Übungen

> Aufgabe für alle Übungen: Schlechte Tests analysieren und verbessern

---

## Übung 10.1 — Anti-Patterns identifizieren

### Schlechte Tests im Code Review

Bewerte jeden Test und nenne das Problem.

```tsx
// Test 1
test('UserCard rendert', () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(container).toMatchSnapshot();
});

// Test 2
test('Button hat die richtige Klasse', () => {
  const { container } = render(<Button variant="primary" />);
  expect(container.querySelector('.btn-primary')).toBeInTheDocument();
});

// Test 3
test('Counter erhoeht den State', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
  expect(result.current.state.count).toBe(1);
});

// Test 4
test('Form ruft die richtigen Funktionen auf', () => {
  const handleValidate = vi.fn();
  const handleSetError = vi.fn();
  const handleSetLoading = vi.fn();

  render(<LoginForm
    validate={handleValidate}
    setError={handleSetError}
    setLoading={handleSetLoading}
  />);

  fireEvent.submit(screen.getByRole('form'));

  expect(handleValidate).toHaveBeenCalled();
  expect(handleSetError).toHaveBeenCalled();
  expect(handleSetLoading).toHaveBeenCalledTimes(2);
});

// Test 5
test('Liste zeigt Items', async () => {
  render(<TodoList />);
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(screen.getByText('Erstes Todo')).toBeInTheDocument();
});
```

### Aufgaben

1. Identifiziere für jeden Test das Anti-Pattern
2. Schreibe für jeden Test eine bessere Version
3. Welche dieser Anti-Patterns kommen in eurem eigenen Code am häufigsten vor?

---

## Übung 10.2 — Komponenten-Test schreiben

### Komponente

```tsx
import { useState } from 'react';

type Props = {
  initialCount?: number;
  step?: number;
  onChange?: (value: number) => void;
};

export function Counter({ initialCount = 0, step = 1, onChange }: Props) {
  const [count, setCount] = useState(initialCount);

  function increment() {
    const next = count + step;
    setCount(next);
    onChange?.(next);
  }

  function decrement() {
    const next = count - step;
    setCount(next);
    onChange?.(next);
  }

  function reset() {
    setCount(initialCount);
    onChange?.(initialCount);
  }

  return (
    <div>
      <p>Aktueller Wert: {count}</p>
      <button onClick={increment}>Erhöhen</button>
      <button onClick={decrement}>Verringern</button>
      <button onClick={reset}>Zurücksetzen</button>
    </div>
  );
}
```

### Aufgaben

1. Schreibe Tests für den initialen Wert
2. Schreibe Tests für die drei Buttons
3. Teste dass `onChange` mit dem korrekten neuen Wert aufgerufen wird
4. Teste dass `step` korrekt verwendet wird (z.B. step=5)
5. Welche Implementierungsdetails würdest du bewusst nicht testen?

---

## Übung 10.3 — Formular-Test mit zod

### Komponente

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email:    z.string().email('Ungültige E-Mail'),
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

### Aufgaben

1. Schreibe einen Test für gültige Eingabe (onSubmit wird mit korrekten Daten aufgerufen)
2. Schreibe einen Test der die E-Mail-Validierung prüft
3. Schreibe einen Test der die Passwort-Validierung prüft
4. Schreibe einen Test der prüft dass bei ungültigen Daten onSubmit nicht aufgerufen wird
5. Welche Queries (getByRole, getByLabelText, etc.) verwendest du und warum?

---

## Übung 10.4 — Test mit react-query

### Komponente

```tsx
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

### Aufgaben

1. Schreibe eine Hilfsfunktion `renderWithQuery` die den `QueryClientProvider` mountet
2. Mocke `fetch` für einen erfolgreichen Test
3. Schreibe einen Test der den Loading-Zustand prüft
4. Schreibe einen Test der das geladene Ergebnis prüft
5. Schreibe einen Test für den Fehlerfall
6. Warum sollte im Test-QueryClient `retry: false` gesetzt sein?

---

## Übung 10.5 — Schlechten Test in guten umschreiben

### Schlechter Test

```tsx
import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';

test('UserSearch funktioniert', async () => {
  // Mock fetch
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve([{ id: '1', name: 'Max' }]),
  });

  const { result } = renderHook(() => useUserSearch());

  // State direkt manipulieren
  act(() => {
    result.current.setQuery('Max');
  });

  // Auf den internen Loading-State warten
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  // Internen State pruefen
  expect(result.current.users).toHaveLength(1);
  expect(result.current.users[0].name).toBe('Max');

  // CSS-Klasse pruefen
  const { container } = render(<UserSearch />);
  expect(container.querySelector('.search-results')).toBeInTheDocument();
});
```

### Aufgaben

1. Identifiziere alle Probleme mit diesem Test
2. Schreibe ihn neu sodass er das Verhalten aus Nutzersicht testet
3. Welche Aspekte werden im neuen Test bewusst nicht mehr geprüft und warum nicht?

---

## Übung 10.6 — E2E Test mit Playwright

### Aufgabe

Schreibe einen E2E-Test für folgenden User Flow:

1. Nutzer besucht die Login-Seite (`/login`)
2. Nutzer gibt E-Mail und Passwort ein
3. Nutzer klickt auf "Anmelden"
4. Nach erfolgreichem Login wird der Nutzer zum Dashboard weitergeleitet (`/dashboard`)
5. Der Header zeigt den Nutzernamen
6. Nutzer klickt auf "Logout"
7. Nutzer wird zur Startseite weitergeleitet

### Aufgaben

1. Implementiere den Test mit `@playwright/test`
2. Mocke die API-Antwort für den Login-Endpoint
3. Wie testest du den Fehlerfall (falsches Passwort)?
4. Wie würdest du diesen Test ausführen ohne dass eine echte Datenbank nötig ist?
5. Welcher Teil dieses Flows wäre besser als Integrationstest mit React Testing Library statt als E2E Test?
