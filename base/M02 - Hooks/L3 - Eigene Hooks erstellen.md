## React JS: Eigene Hooks erstellen: Code wiederverwenden und die Lesbarkeit verbessern

React bietet mit Hooks eine mächtige Möglichkeit, Zustands- und Nebeneffektenlogik in Funktionskomponenten zu verwenden. Neben den eingebauten Hooks können Entwickler eigene Hooks erstellen, um wiederverwendbare Logik zu kapseln und die Lesbarkeit des Codes zu verbessern. Im Folgenden sind die Grundlagen zum Erstellen eigener Hooks beschrieben:

### Motivation für eigene Hooks

#### 1. Wiederverwendbarkeit

Eigene Hooks ermöglichen es, Logik zu kapseln, die in mehreren Komponenten benötigt wird. Dadurch wird der Code modularer und wiederverwendbarer.

- **Beispiel**: Ein Hook, der die Größe des Browserfensters überwacht, kann in mehreren Komponenten verwendet werden, die auf Änderungen der Fenstergröße reagieren müssen.

#### 2. Lesbarkeit

Durch das Kapseln komplexer Logik in eigene Hooks wird der Code der Komponenten übersichtlicher und leichter verständlich. Dies fördert die Wartbarkeit und die Zusammenarbeit im Team.

- **Beispiel**: Anstatt mehrere Zeilen von Zustands- und Effekthooks in einer Komponente zu haben, kann ein eigener Hook diese Logik abstrahieren.

### Grundlagen zum Erstellen eigener Hooks

Ein eigener Hook ist einfach eine JavaScript-Funktion, die andere Hooks aufruft. Ein Hook muss immer mit "use" beginnen, damit React erkennen kann, dass es sich um einen Hook handelt.

#### Beispiel 1: Ein einfacher eigener Hook

```jsx
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default useWindowSize;
```

In diesem Beispiel überwacht der Hook useWindowSize die Größe des Browserfensters und gibt die aktuelle Größe zurück. Dieser Hook kann in jeder Komponente verwendet werden, die die Fenstergröße benötigt.

#### Beispiel 2: Ein eigener Hook mit Parameter

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
```

In diesem Beispiel führt der Hook useFetch eine Fetch-Anfrage durch und gibt den Ladezustand, die empfangenen Daten und eventuelle Fehler zurück. Der Hook akzeptiert eine URL als Parameter und kann in jeder Komponente verwendet werden, die Daten von dieser URL abrufen muss.

### Verwendung eigener Hooks
Eigene Hooks werden wie die eingebauten Hooks verwendet. Sie können in den Funktionskomponenten aufgerufen und deren Rückgabewerte direkt genutzt werden.

#### Beispiel 3: Verwendung von useWindowSize

```jsx
import React from 'react';
import useWindowSize from './useWindowSize';

function MyComponent() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Fensterbreite: {width}px</p>
      <p>Fensterhöhe: {height}px</p>
    </div>
  );
}

export default MyComponent;
```
#### Beispiel 4: Verwendung von useFetch

```jsx
import React from 'react';
import useFetch from './useFetch';

function DataComponent() {
  const { data, loading, error } = useFetch('https://api.example.com/data');

  if (loading) return <p>Laden...</p>;
  if (error) return <p>Fehler: {error.message}</p>;

  return (
    <div>
      <h1>Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DataComponent;
```