## React JS: Einführung in Hooks: Hintergründe und Grundprinzipien

React Hooks sind Funktionen, die es ermöglichen, State und andere React-Funktionen in Funktionskomponenten zu verwenden. Sie wurden in React 16.8 eingeführt und revolutionierten die Art und Weise, wie Entwickler mit React arbeiten. Dieser Leitfaden erklärt die Hintergründe und Grundprinzipien von Hooks.

### Hintergründe

#### 1. Vereinfachung der Komponentenerstellung

Vor der Einführung von Hooks gab es in React zwei Hauptarten von Komponenten: Funktionskomponenten und Klassenkomponenten. Funktionskomponenten waren einfach, konnten aber keinen lokalen State oder Lifecycle-Methoden verwenden. Klassenkomponenten boten diese Möglichkeiten, waren jedoch oft komplexer und schwieriger zu verstehen.

- **Problem**: Entwickler mussten Klassenkomponenten verwenden, um State und Lifecycle-Methoden zu nutzen, was zu einem komplizierteren Code führte.
- **Lösung**: Hooks erlauben es, State und andere Features in Funktionskomponenten zu verwenden, wodurch der Code einfacher und übersichtlicher wird.

#### 2. Wiederverwendbarkeit von Logik

Klassenkomponenten erschwerten die Wiederverwendung von Logik zwischen verschiedenen Komponenten. Es gab keine einfache Möglichkeit, zustandsbehaftete Logik zu teilen, ohne auf Muster wie Higher-Order Components (HOCs) oder Render Props zurückzugreifen.

- **Problem**: Das Teilen von Logik war umständlich und führte zu unnötiger Komplexität.
- **Lösung**: Hooks ermöglichen die Extraktion von Logik in wiederverwendbare Funktionen, die in verschiedenen Komponenten eingesetzt werden können.

### Grundprinzipien

#### 1. useState

Der `useState`-Hook ermöglicht das Hinzufügen von State zu Funktionskomponenten. Er gibt ein Array zurück, das den aktuellen State-Wert und eine Funktion zum Aktualisieren dieses Wertes enthält.

- **Syntax**: `const [state, setState] = useState(initialState);`

Beispiel:
```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Sie haben {count} Mal geklickt</p>
      <button onClick={() => setCount(count + 1)}>Klicken Sie mich</button>
    </div>
  );
}
```
#### 2. useEffect
Der useEffect-Hook ermöglicht das Ausführen von Nebenwirkungen in Funktionskomponenten. Er ersetzt die Lifecycle-Methoden componentDidMount, componentDidUpdate und componentWillUnmount.

Syntax: useEffect(() => { /* Effekt-Code */ }, [abhängigkeiten]);
Beispiel:

```jsx
import React, { useEffect, useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Sie haben ${count} Mal geklickt`;
  }, [count]);

  return (
    <div>
      <p>Sie haben {count} Mal geklickt</p>
      <button onClick={() => setCount(count + 1)}>Klicken Sie mich</button>
    </div>
  );
}
```

#### 3. useContext
Der useContext-Hook ermöglicht den Zugriff auf den Wert eines Kontextes, ohne dass ein Consumer verwendet werden muss.

Syntax: const value = useContext(MyContext);
Beispiel:

```jsx
import React, { useContext } from 'react';
const ThemeContext = React.createContext('hell');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button style={{ background: theme === 'dunkel' ? '#333' : '#FFF' }}>Themed Button</button>;
}
```

#### Weitere Hooks
Zusätzlich zu den grundlegenden Hooks gibt es weitere spezialisierte Hooks:

useReducer: Verwaltet komplexen State mit einem Reducer.
useMemo: Memoisiert teure Berechnungen.
useCallback: Memoisiert Rückruffunktionen.
useRef: Erzeugt eine Mutable-Ref, die nicht neu gerendert wird.