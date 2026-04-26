## React JS: Prop-Handling: Erweiterte Möglichkeiten zur Übergabe von Daten an Komponenten

In React sind Props (Properties) der Mechanismus, durch den Daten von einer Komponente an eine andere übergeben werden. Das Prop-Handling ist eine zentrale Technik zur Verwaltung des Datenflusses und zur Komponentenkonfiguration. Hier werden erweiterte Möglichkeiten zur Übergabe und Nutzung von Props in React beschrieben.

### Grundlagen der Props

Props sind unveränderliche Datenstrukturen, die von einer übergeordneten Komponente an eine untergeordnete Komponente weitergegeben werden. Sie sind schreibgeschützt und können nicht direkt von der empfangenden Komponente geändert werden.

#### Beispiel:

```jsx
function Welcome(props) {
  return <h1>Hallo, {props.name}</h1>;
}

const element = <Welcome name="Sara" />;
```

In diesem Beispiel wird der Name "Sara" als Prop an die Welcome-Komponente übergeben.

### Erweiterte Möglichkeiten der Prop-Übergabe
1. Standardwerte für Props (Default Props)
Komponenten können Standardwerte für Props definieren, die verwendet werden, wenn keine entsprechenden Werte übergeben werden.

```jsx
function Welcome(props) {
  return <h1>Hallo, {props.name}</h1>;
}

Welcome.defaultProps = {
  name: 'Gast',
};
```

In diesem Beispiel wird "Gast" als Standardwert für den Prop name verwendet, falls kein Wert übergeben wird.

2. Prop-Typenvalidierung (Prop Types)
React bietet eine Möglichkeit zur Typüberprüfung von Props, um sicherzustellen, dass die Komponenten mit den richtigen Datentypen verwendet werden.

```jsx
import PropTypes from 'prop-types';

function Welcome(props) {
  return <h1>Hallo, {props.name}</h1>;
}

Welcome.propTypes = {
  name: PropTypes.string,
};
```

Hier wird sichergestellt, dass der Prop name vom Typ string ist.

3. Übergabe von Funktionen als Props
Funktionen können als Props übergeben werden, um Ereignishandler oder Callbacks in untergeordneten Komponenten zu definieren.

```jsx
function Button(props) {
  return <button onClick={props.onClick}>Klicken</button>;
}

function App() {
  function handleClick() {
    alert('Button wurde geklickt!');
  }

  return <Button onClick={handleClick} />;
}
```

In diesem Beispiel wird eine Funktion handleClick als Prop onClick an die Button-Komponente übergeben.

4. Kinder-Props (Children Props)
React unterstützt die Übergabe von Komponenten oder JSX als Kinder-Props (children), um verschachtelte Strukturen zu erstellen.

```jsx
function Container(props) {
  return <div className="container">{props.children}</div>;
}

function App() {
  return (
    <Container>
      <h1>Hallo, Welt!</h1>
      <p>Willkommen bei React.</p>
    </Container>
  );
}
```

Hier wird der Inhalt der App-Komponente als children an die Container-Komponente übergeben.

5. Render-Props
Render-Props sind eine Technik, bei der eine Funktion als Prop übergeben wird, um eine dynamische Rendering-Logik zu ermöglichen.

```jsx
function DataFetcher(props) {
  const data = fetchDataFromAPI();
  return props.render(data);
}

function App() {
  return (
    <DataFetcher
      render={(data) => (
        <div>
          <h1>Daten:</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    />
  );
}
```
