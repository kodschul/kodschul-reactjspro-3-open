## React JS: Styled-Components - Erstellen wiederverwendbarer und thematisierter Komponenten

Styled-Components ist eine populäre Bibliothek in der React-Entwicklung, die es ermöglicht, CSS direkt in die React-Komponenten einzubetten. Diese Herangehensweise erleichtert die Erstellung wiederverwendbarer und thematisierter Komponenten, was zu einer verbesserten Modulare und wartbareren Codebasis führt.

### Motivation für Styled-Components

#### 1. Komponentenorientierter Ansatz

Styled-Components folgt dem komponentenorientierten Ansatz von React und ermöglicht es Entwicklern, CSS direkt in den Komponenten zu definieren. Dadurch werden Komponenten selbstständig und portabel.

- **Beispiel**: Eine Schaltfläche kann eine eigene Stildefinition haben, die unabhängig von anderen Schaltflächen ist.

#### 2. CSS-in-JS

Styled-Components verwendet CSS-in-JS, was bedeutet, dass Styles direkt in JavaScript geschrieben werden. Dies verbessert die Lesbarkeit, Wartbarkeit und Portabilität des Codes.

- **Vorteil**: Entwickler können JavaScript-Funktionalitäten wie Bedingungen und Schleifen verwenden, um dynamische Styles zu generieren.

#### 3. Thematisierung

Styled-Components unterstützt die Thematisierung von Komponenten, was es ermöglicht, dass Styles auf das gesamte Projekt angewendet werden können.

- **Beispiel**: Durch Definieren eines zentralen Themas können Farben, Schriftarten und andere Designelemente konsistent über die gesamte Anwendung hinweg verwendet werden.

### Verwendung von Styled-Components

#### 1. Definieren von Komponenten

Styled-Components ermöglicht die Definition von wiederverwendbaren Komponenten durch das Kombinieren von JavaScript und CSS.

```javascript
import styled from 'styled-components';

const Button = styled.button`
  background-color: ${props => props.primary ? 'blue' : 'white'};
  color: ${props => props.primary ? 'white' : 'blue'};
  border: 2px solid blue;
  padding: 10px 20px;
  font-size: 16px;
`;

export default Button;
```

In diesem Beispiel wird eine Schaltflächenkomponente definiert, die unterschiedliche Styles basierend auf dem primary Prop hat.

#### 2. Verwendung in Komponenten
Die erstellten Styled-Komponenten können wie jede andere React-Komponente verwendet werden.

```javascript
import React from 'react';
import Button from './Button';

function App() {
  return (
    <div>
      <Button>Normal</Button>
      <Button primary>Primary</Button>
    </div>
  );
}

export default App;

```

In diesem Beispiel wird die erstellte Schaltflächenkomponente verwendet, einmal als normale Schaltfläche und einmal als primäre Schaltfläche.

### Vorteile von Styled-Components
1. Bessere Isolation
Styled-Components bieten eine bessere Isolation von Styles, da sie automatisch eindeutige Klassen generieren und diese nur auf die betreffenden Komponenten anwenden.

2. Dynamische Styles
Mit Styled-Components können dynamische Styles basierend auf Props oder anderen JavaScript-Logik einfach implementiert werden.

3. Einfache Wiederverwendung
Da Styles direkt in den Komponenten definiert sind, können sie einfach wiederverwendet und portiert werden, ohne zusätzlichen Boilerplate-Code.