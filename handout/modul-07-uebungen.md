# Modul 7 — Übungen

> Aufgabe für alle Übungen: State-Architektur bewerten und refactoren
> Hinweis: Dieses Modul liefert einen gröberen Überblick. Es wird nicht erwartet dass alle Begriffe vorab bekannt sind.

---

## Übung 7.1 — useState oder useReducer

### Ausgangslage

Du baust eine Komponente die einen Bestellprozess abbildet. Folgende States sind erforderlich:

```
- Aktueller Schritt (1, 2, oder 3)
- Liefer-Adresse (Strasse, PLZ, Ort)
- Rechnungs-Adresse (gleich wie Lieferadresse oder separat)
- Zahlungsart (Karte, Rechnung, Vorkasse)
- Bestellbestaetigung gelesen (boolean)
- Submit-Status (idle, submitting, success, error)
```

### Aufgaben

1. Welche dieser States passen einzeln in `useState`?
2. Welche bilden eine Gruppe die zusammengehört?
3. Würdest du den gesamten Bestellprozess in einem `useReducer` modellieren? Begründe.
4. Skizziere die Action-Typen falls du `useReducer` einsetzen würdest

---

## Übung 7.2 — useReducer von Grund auf

### Aufgabe

Implementiere einen To-Do-Reducer der folgende Operationen unterstützt:

- Todo hinzufügen (mit Text)
- Todo als erledigt markieren
- Todo wieder als offen markieren
- Todo löschen
- Alle erledigten Todos auf einmal löschen
- Filter setzen (alle, offene, erledigte)

### Aufgaben

1. Definiere die State-Struktur
2. Definiere die Action-Typen (mit TypeScript)
3. Implementiere den Reducer
4. Schreibe eine Komponente die den Reducer einsetzt
5. Wo lebt der "gefilterte" State — als eigener Wert im State oder berechnet beim Rendern?

---

## Übung 7.3 — State-Architektur bewerten

### Ausgangslage

Eine bestehende E-Commerce-App hat folgende State-Struktur:

```tsx
// Globaler Zustand-Store
const useAppStore = create((set, get) => ({
  // Server-State
  products: [],
  isLoadingProducts: false,
  fetchProducts: async () => {
    set({ isLoadingProducts: true });
    const data = await fetch('/api/products').then(r => r.json());
    set({ products: data, isLoadingProducts: false });
  },

  user: null,
  isLoadingUser: false,
  fetchUser: async () => {
    set({ isLoadingUser: true });
    const data = await fetch('/api/user').then(r => r.json());
    set({ user: data, isLoadingUser: false });
  },

  // Client-State (Warenkorb)
  cart: [],
  addToCart: (item) => set(s => ({ cart: [...s.cart, item] })),
  removeFromCart: (id) => set(s => ({ cart: s.cart.filter(i => i.id !== id) })),

  // UI-State
  isMenuOpen: false,
  toggleMenu: () => set(s => ({ isMenuOpen: !s.isMenuOpen })),

  isCartDrawerOpen: false,
  toggleCartDrawer: () => set(s => ({ isCartDrawerOpen: !s.isCartDrawerOpen })),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
```

### Aufgaben

1. Klassifiziere jeden State: ist es Server-State, Client-State, oder UI-State?
2. Welche States sind im falschen Bucket?
3. Schreibe eine sauber getrennte Architektur. Was kommt wohin?
4. Welche zwei States gehören gar nicht in den globalen Store?

---

## Übung 7.4 — Zustand-Store strukturieren

### Aufgabe

Du baust einen Warenkorb der im Browser persistiert werden soll. Anforderungen:

- Items hinzufügen, entfernen, Mengen ändern
- Gesamtpreis berechnen
- Im localStorage persistieren
- Aus mehreren Komponenten zugreifbar
- Performance: Komponenten die nur `itemCount` brauchen sollen nicht bei jeder Mengenänderung rendern

### Aufgaben

1. Implementiere den Zustand-Store
2. Nutze die `persist`-Middleware für localStorage
3. Schreibe drei Komponenten die unterschiedliche Aspekte des Stores nutzen
4. Wie verhindere ich Re-Renders in Komponenten die nur einen abgeleiteten Wert (totalPrice) brauchen?

---

## Übung 7.5 — Trade-offs entscheiden

### Szenarien

Bewerte für jedes Szenario welche State-Lösung am besten passt: `useState`, `useReducer`, `Context + useReducer`, `Zustand`, oder `react-query`.

```
Szenario A:
Eine Modal-Komponente verwaltet ihren eigenen offen/geschlossen-Zustand.

Szenario B:
Ein Multi-Step-Wizard mit 5 Schritten und komplexer Logik fuer naechsten/vorherigen Schritt.

Szenario C:
Der eingeloggte Nutzer wird in der Header-Komponente, im Profil-Menue, im Footer
und in vielen Detail-Views angezeigt.

Szenario D:
Eine Produktliste die von einer REST-API kommt und nach 5 Minuten als veraltet gilt.

Szenario E:
Die globalen Theme-Einstellungen die vom Nutzer geaendert werden koennen.

Szenario F:
Ein Shopping-Cart der zwischen Tabs synchronisiert sein soll und persistent
gespeichert wird.

Szenario G:
Eine Komponente die einen Filter-String haelt der nur lokal in dieser Komponente
gebraucht wird.
```

### Aufgaben

1. Wähle für jedes Szenario die passendste Lösung
2. Begründe in jeweils zwei Sätzen
3. Welche Faustregeln helfen bei der Entscheidung?
