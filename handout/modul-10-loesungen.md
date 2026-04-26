# Modul 10 — Lösungen

---

## Lösung 10.1 — Anti-Patterns

### Bewertung

**Test 1 — Snapshot ohne Mehrwert**

Problem: Snapshot ändert sich bei jeder UI-Änderung. Wird meist blind aktualisiert.

```tsx
// Besser: gezielt prüfen was wichtig ist
test('UserCard zeigt Name und E-Mail', () => {
  render(<UserCard user={mockUser} />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  expect(screen.getByText(mockUser.email)).toBeInTheDocument();
});
```

**Test 2 — CSS-Klasse statt Verhalten**

Problem: Klassennamen sind Implementierungsdetail, nicht das was Nutzer sehen.

```tsx
// Besser: prüfen was tatsächlich auf dem Bildschirm passiert
test('Primary Button ist als primaer markiert', () => {
  render(<Button variant="primary">Speichern</Button>);
  const button = screen.getByRole('button', { name: 'Speichern' });
  // Wenn primary etwas Sichtbares oder Semantisches bedeutet, das pruefen
  // Sonst Test weglassen
});
```

**Test 3 — Internen State testen**

Problem: `result.current.state.count` testet die Implementierung, nicht das Ergebnis.

```tsx
// Besser: durch die Komponente testen die den Hook nutzt
test('Counter erhoeht sich beim Klick', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole('button', { name: 'Erhöhen' }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

**Test 4 — Internal-Mock-Hell**

Problem: Mockt interne Implementierungsdetails. Bricht beim ersten Refactoring.

```tsx
// Besser: nur die externe Schnittstelle mocken
test('Login ruft onSubmit mit korrekten Daten auf', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText('E-Mail'), 'test@example.com');
  await user.type(screen.getByLabelText('Passwort'), 'sicher12345');
  await user.click(screen.getByRole('button', { name: 'Anmelden' }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'sicher12345',
  });
});
```

**Test 5 — setTimeout im Test**

Problem: `setTimeout(1000)` ist langsam und unzuverlässig. `waitFor` oder `findBy` warten gezielt.

```tsx
// Besser: gezielt auf das Erscheinen warten
test('TodoList zeigt Items nach dem Laden', async () => {
  render(<TodoList />);
  expect(await screen.findByText('Erstes Todo')).toBeInTheDocument();
});
```

---

## Lösung 10.2 — Komponenten-Test schreiben

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  test('zeigt initialen Wert von 0 an', () => {
    render(<Counter />);
    expect(screen.getByText('Aktueller Wert: 0')).toBeInTheDocument();
  });

  test('zeigt benutzerdefinierten initialen Wert', () => {
    render(<Counter initialCount={42} />);
    expect(screen.getByText('Aktueller Wert: 42')).toBeInTheDocument();
  });

  test('Erhöhen-Button erhöht den Wert um 1', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    await user.click(screen.getByRole('button', { name: 'Erhöhen' }));
    expect(screen.getByText('Aktueller Wert: 1')).toBeInTheDocument();
  });

  test('Verringern-Button verringert den Wert um 1', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={5} />);
    await user.click(screen.getByRole('button', { name: 'Verringern' }));
    expect(screen.getByText('Aktueller Wert: 4')).toBeInTheDocument();
  });

  test('Zurücksetzen-Button setzt auf initialCount zurück', async () => {
    const user = userEvent.setup();
    render(<Counter initialCount={10} />);

    await user.click(screen.getByRole('button', { name: 'Erhöhen' }));
    await user.click(screen.getByRole('button', { name: 'Erhöhen' }));
    expect(screen.getByText('Aktueller Wert: 12')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Zurücksetzen' }));
    expect(screen.getByText('Aktueller Wert: 10')).toBeInTheDocument();
  });

  test('respektiert benutzerdefinierten step', async () => {
    const user = userEvent.setup();
    render(<Counter step={5} />);
    await user.click(screen.getByRole('button', { name: 'Erhöhen' }));
    expect(screen.getByText('Aktueller Wert: 5')).toBeInTheDocument();
  });

  test('ruft onChange mit dem neuen Wert auf', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Counter onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: 'Erhöhen' }));

    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
```

### Bewusst nicht getestet

```
- Die internen useState-Aufrufe
- Die genauen Funktionsnamen (increment, decrement, reset)
- Die HTML-Struktur (div, button-Reihenfolge)
- CSS-Klassen oder Styling
```

Begründung: das sind Implementierungsdetails. Wenn die Komponente refactored wird (z.B. zu useReducer), sollen die Tests nicht angepasst werden müssen solange das Verhalten gleich bleibt.

---

## Lösung 10.3 — Formular-Test mit zod

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  test('ruft onSubmit mit gültigen Daten auf', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('E-Mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Passwort'), 'sicheres-passwort');
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'sicheres-passwort',
    });
  });

  test('zeigt Fehler bei ungültiger E-Mail', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('E-Mail'), 'keine-email');
    await user.type(screen.getByLabelText('Passwort'), 'sicheres-passwort');
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ungültige E-Mail');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('zeigt Fehler bei zu kurzem Passwort', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('E-Mail'), 'test@example.com');
    await user.type(screen.getByLabelText('Passwort'), 'kurz');
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mindestens 8 Zeichen');
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('zeigt beide Fehler bei zwei ungültigen Feldern', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Anmelden' }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(2);
  });
});
```

### Verwendete Queries

```
getByLabelText:
  Fuer Inputs mit zugehoerigem Label.
  Spiegelt wie Nutzer Felder identifizieren (per Label gucken)
  und wie Screen Reader sie ansagen.

getByRole('button', { name: ... }):
  Fuer Buttons. role + name ist die zugaenglichste Art.

findByRole('alert'):
  Fuer asynchron erscheinende Fehlermeldungen.
  findBy wartet automatisch bis das Element da ist.
  role='alert' ist semantisch korrekt fuer Fehler.
```

---

## Lösung 10.4 — Test mit react-query

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductList } from './ProductList';

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe('ProductList', () => {
  test('zeigt Loading-State an', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    // Promise das nie aufgeloest wird — bleibt im Loading-State

    renderWithQuery(<ProductList />);

    expect(screen.getByText('Wird geladen...')).toBeInTheDocument();
  });

  test('zeigt Produkte nach erfolgreichem Laden', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: '1', name: 'Produkt A' },
        { id: '2', name: 'Produkt B' },
      ]),
    });

    renderWithQuery(<ProductList />);

    expect(await screen.findByText('Produkt A')).toBeInTheDocument();
    expect(screen.getByText('Produkt B')).toBeInTheDocument();
  });

  test('zeigt Fehlermeldung bei API-Fehler', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Netzwerkfehler'));

    renderWithQuery(<ProductList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Fehler beim Laden');
  });
});
```

### Warum retry: false im Test

In Production möchte man dass react-query bei Fehlern automatisch wiederholt. In Tests führt das aber zu unnötig langen Wartezeiten und macht Fehlerfälle schwer testbar — der Test müsste auf alle Retry-Versuche warten bevor die Fehlermeldung erscheint. `retry: false` macht den Fehlerfall sofort sichtbar.

---

## Lösung 10.5 — Schlechten Test umschreiben

### Probleme

```
1. renderHook plus render in einem Test — Mischung von Ansaetzen
2. Internen State direkt manipulieren via result.current.setQuery
3. Internen State pruefen via result.current.users
4. CSS-Klasse pruefen statt Verhalten
5. Mehrere unverbundene Aspekte in einem Test
6. Mock-fetch ohne ok-Property — wuerde bei strikter Pruefung fehlschlagen
```

### Neuer Test

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSearch } from './UserSearch';

describe('UserSearch', () => {
  test('zeigt gefundene Nutzer nach Suche an', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'Max' }]),
    });

    render(<UserSearch />);

    await user.type(screen.getByLabelText('Suche'), 'Max');

    expect(await screen.findByText('Max')).toBeInTheDocument();
  });

  test('zeigt leere Liste an wenn keine Nutzer gefunden werden', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<UserSearch />);

    await user.type(screen.getByLabelText('Suche'), 'NichtVorhanden');

    expect(await screen.findByText('Keine Nutzer gefunden')).toBeInTheDocument();
  });
});
```

### Bewusst nicht mehr geprüft

```
- Interner Loading-State — wird im neuen Test indirekt geprueft durch
  das Warten auf das Suchergebnis
- Interner users-Array — wird durch das sichtbare Ergebnis abgedeckt
- CSS-Klasse '.search-results' — Implementierungsdetail
- Direkte State-Manipulation via setQuery — wird durch userEvent ersetzt
  was naeher am echten Nutzerverhalten ist
```

---

## Lösung 10.6 — E2E Test mit Playwright

```ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('Nutzer kann sich erfolgreich einloggen und ausloggen', async ({ page }) => {
    // API-Mock fuer Login
    await page.route('**/api/login', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', name: 'Max Mustermann', email: 'max@example.com' },
          token: 'fake-jwt-token',
        }),
      })
    );

    // API-Mock fuer Dashboard-Daten
    await page.route('**/api/dashboard', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ widgets: [] }),
      })
    );

    // 1-3. Login durchfuehren
    await page.goto('/login');
    await page.getByLabel('E-Mail').fill('max@example.com');
    await page.getByLabel('Passwort').fill('sicheres-passwort');
    await page.getByRole('button', { name: 'Anmelden' }).click();

    // 4. Weiterleitung zum Dashboard
    await expect(page).toHaveURL('/dashboard');

    // 5. Nutzername im Header sichtbar
    await expect(page.getByTestId('user-name')).toHaveText('Max Mustermann');

    // 6-7. Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL('/');
  });

  test('zeigt Fehlermeldung bei falschem Passwort', async ({ page }) => {
    await page.route('**/api/login', route =>
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Falsches Passwort' }),
      })
    );

    await page.goto('/login');
    await page.getByLabel('E-Mail').fill('max@example.com');
    await page.getByLabel('Passwort').fill('falsch');
    await page.getByRole('button', { name: 'Anmelden' }).click();

    await expect(page.getByRole('alert')).toHaveText('Falsches Passwort');
    await expect(page).toHaveURL('/login');
  });
});
```

### Ohne echte Datenbank ausführen

`page.route` fängt alle Netzwerk-Anfragen ab und liefert vordefinierte Antworten. Damit braucht der Test weder eine echte API noch eine Datenbank.

Alternative für komplexere Setups: Mock Service Worker (msw) der API-Mocks zentral verwaltet und sowohl in E2E Tests als auch in Komponententests funktioniert.

### Welcher Teil als Integrationstest

Die reine Formular-Validierung und der Submit-Aufruf sind besser als Integrationstest mit React Testing Library:

- Schneller (kein Browser nötig)
- Gezielter (nur die Komponente, nicht der ganze Flow)
- Stabiler (keine Netzwerk-Timeouts, keine Browser-Flakiness)

Der E2E Test sollte sich auf den durchgehenden Flow konzentrieren: Navigation, Auth-Cookie wird gesetzt, Dashboard wird erreicht, Logout funktioniert über die echte Browser-URL. Die Detail-Validierung des Formulars selbst (z.B. "zeigt Fehler bei leerem E-Mail-Feld") gehört in einen Komponententest.
