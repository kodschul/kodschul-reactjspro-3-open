## React JS: useEffect, useContext und useRef

React bietet mehrere Hooks, die es ermöglichen, funktionale Komponenten mit Zustands- und Lebenszyklus-Methoden auszustatten. Zu den am häufigsten verwendeten Hooks gehören `useEffect`, `useContext` und `useRef`. Diese Hooks erleichtern die Verwaltung von Nebenwirkungen, den Zugriff auf den globalen Zustand und das Arbeiten mit DOM-Referenzen.

### useEffect

Der `useEffect` Hook ermöglicht es, Nebenwirkungen in funktionalen Komponenten auszuführen. Er ersetzt die Lebenszyklus-Methoden `componentDidMount`, `componentDidUpdate` und `componentWillUnmount` in Klassenkomponenten.

#### Verwendung von useEffect

```jsx
import React, { useState, useEffect } from 'react';

function ExampleComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Ausführung bei jedem Rendern
    document.title = `You clicked ${count} times`;

    // Cleanup-Funktion, die bei der Demontage der Komponente ausgeführt wird
    return () => {
      console.log('Component will unmount');
    };
  }, [count]); // Abhängigkeiten-Array: useEffect wird nur ausgeführt, wenn sich "count" ändert

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}

export default ExampleComponent;
```

In diesem Beispiel aktualisiert useEffect den Dokumenttitel bei jeder Änderung von count. Die Abhängigkeiten im Array [count] stellen sicher, dass der Effekt nur ausgeführt wird, wenn sich count ändert.

### useContext
Der useContext Hook ermöglicht es, den Kontext in funktionalen Komponenten zu verwenden. Dies erleichtert den Zugriff auf globale Zustände, ohne Props durch mehrere Ebenen weiterleiten zu müssen.

Erstellung und Verwendung von useContext

```jsx
import React, { useContext, createContext } from 'react';

// Erstellung eines Kontextes
const ThemeContext = createContext('light');

function ThemeButton() {
  // Verwendung des Kontextes
  const theme = useContext(ThemeContext);

  return <button className={theme}>I am styled by theme context!</button>;
}

function App() {
  return (
    // Bereitstellung des Kontextwertes
    <ThemeContext.Provider value="dark">
      <ThemeButton />
    </ThemeContext.Provider>
  );
}

export default App;
```

In diesem Beispiel wird ein ThemeContext erstellt und in der App-Komponente bereitgestellt. Der ThemeButton-Komponente verwendet useContext, um den aktuellen Kontextwert (dark) zu erhalten.

### useRef
Der useRef Hook wird verwendet, um Referenzen auf DOM-Elemente oder andere Werte zu erstellen, die während des gesamten Lebenszyklus der Komponente beibehalten werden sollen, ohne eine Neurenderung auszulösen.

Verwendung von useRef

```jsx
import React, { useRef } from 'react';

function TextInputWithFocusButton() {
  // Erstellen einer Ref
  const inputEl = useRef(null);

  const onButtonClick = () => {
    // Zugriff auf das DOM-Element
    inputEl.current.focus();
  };

  return (
    <div>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </div>
  );
}

export default TextInputWithFocusButton;
```

In diesem Beispiel wird useRef verwendet, um eine Referenz auf ein Eingabefeld zu erstellen. Beim Klicken auf die Schaltfläche wird die Eingabe fokussiert, ohne dass die Komponente neu gerendert wird.