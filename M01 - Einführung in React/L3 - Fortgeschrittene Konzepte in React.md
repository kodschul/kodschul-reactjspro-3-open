## React JS: Fortgeschrittene Konzepte in React

React bietet neben den grundlegenden Konzepten wie Komponenten, Zustand und Props auch fortgeschrittene Techniken, die Entwicklern helfen, komplexe Anwendungen zu erstellen und zu verwalten. Diese fortgeschrittenen Konzepte ermöglichen es, leistungsfähige, wartbare und wiederverwendbare Anwendungen zu entwickeln. Im Folgenden werden einige dieser fortgeschrittenen Konzepte in React vorgestellt.

### 1. Kontext-API (Context API)

Die Kontext-API ermöglicht es, Daten über die Komponenten-Hierarchie hinweg zu teilen, ohne Props explizit durch jede Ebene zu reichen. Dies ist besonders nützlich für globale Zustände wie das Thema, die Benutzerauthentifizierung oder die Spracheinstellungen.

- **Beispiel**: Erstellen eines Kontexts für das Thema und Verwenden in tiefer verschachtelten Komponenten.

```jsx
const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = React.useContext(ThemeContext);
  return <button style={{ background: theme === 'dark' ? '#333' : '#FFF' }}>Button</button>;
}
```

### 2. Render Props
Render Props ist ein Muster, bei dem eine Funktion als Prop an eine Komponente übergeben wird, die diese Funktion verwendet, um JSX zu rendern. Dies ermöglicht es, Logik in eine separate Komponente auszulagern und die Wiederverwendbarkeit zu erhöhen.

Beispiel: Eine Komponente, die die Mausposition verfolgt und diese Informationen an eine Render Prop-Funktion übergibt.

```jsx
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove = (event) => {
    this.setState({ x: event.clientX, y: event.clientY });
  };

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

function App() {
  return (
    <MouseTracker render={({ x, y }) => (
      <h1>Mouse position: ({x}, {y})</h1>
    )} />
  );
}

```

### 3. Higher-Order Components (HOCs)
Higher-Order Components sind Funktionen, die eine Komponente als Argument nehmen und eine neue Komponente zurückgeben. HOCs sind nützlich, um wiederverwendbare Logik zu teilen und Komponenten zu erweitern.

Beispiel: Ein HOC, der einen Logging-Mechanismus zu einer Komponente hinzufügt.

```jsx
function withLogging(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      console.log(`Component ${WrappedComponent.name} mounted`);
    }

    componentWillUnmount() {
      console.log(`Component ${WrappedComponent.name} will unmount`);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

const MyComponent = () => <div>My Component</div>;
const MyComponentWithLogging = withLogging(MyComponent);

function App() {
  return <MyComponentWithLogging />;
}

```

### 4. React Hooks
React Hooks ermöglichen die Nutzung von Zustand und anderen React-Funktionen in Funktionskomponenten. Zu den wichtigsten Hooks gehören useState, useEffect, useContext, useReducer und useMemo.

Beispiel: Verwenden von useState und useEffect in einer Funktionskomponente.

```jsx
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

function App() {
  return <Counter />;
}

```

### 5. Code-Splitting und Lazy Loading
Code-Splitting ermöglicht es, den Code in kleinere Bündel aufzuteilen, die bei Bedarf geladen werden. Dies verbessert die Ladezeiten der Anwendung und die Benutzererfahrung.

Beispiel: Verwenden von React.lazy und Suspense zum Lazy Loading von Komponenten.

```jsx
import React, { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

```

### 6. Error Boundaries
Error Boundaries sind Komponenten, die JavaScript-Fehler in ihrem Komponentenbaum abfangen und eine Fehleranzeige rendern können, anstatt den gesamten Komponentenbaum abstürzen zu lassen.

Beispiel: Erstellen einer Error Boundary-Komponente.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

function BuggyComponent() {
  throw new Error('I crashed!');
  return <div>Buggy Component</div>;
}

function App() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}

```