## React JS: Emotion - Einführung in die CSS-in-JS-Bibliothek für stilvolles Design

Emotion ist eine leistungsfähige CSS-in-JS-Bibliothek für React-Anwendungen, die es Entwicklern ermöglicht, stilvolle Designs direkt in ihre Komponenten zu integrieren. Diese Einführung zeigt die Motivation für Emotion und wie es in modernen React-Projekten eingesetzt werden kann.

### Motivation für Emotion

#### 1. Kapselung von Styles

Emotion ermöglicht die Definition von CSS innerhalb von JavaScript-Dateien, was zu einer besseren Komponentenisolierung und Wiederverwendbarkeit führt. Stildefinitionen werden direkt mit der zugehörigen Komponente gebündelt, was zu einem klareren und wartbareren Code führt.

#### 2. Dynamische Styles

Mit Emotion können Styles dynamisch generiert werden, basierend auf Props oder dem Anwendungszustand. Dies ermöglicht es Entwicklern, auf einfache Weise interaktive und reaktive Designs zu erstellen, ohne auf externe CSS-Klassen zurückgreifen zu müssen.

#### 3. Theming-Unterstützung

Emotion bietet eine integrierte Unterstützung für Theming, wodurch es einfach wird, globale Stilvariablen zu definieren und sie in verschiedenen Teilen der Anwendung zu verwenden. Dies fördert eine konsistente visuelle Identität und vereinfacht das Ändern des Designs.

### Verwendung von Emotion

#### 1. Installation

Um Emotion in ein React-Projekt zu integrieren, kann es über npm oder yarn installiert werden:

```bash
npm install @emotion/react @emotion/styled
# oder
yarn add @emotion/react @emotion/styled
```

#### 2. Verwendung von Styled Components
Mit Styled Components können Entwickler benutzerdefinierte React-Komponenten erstellen, die mit CSS-ähnlichen Syntaxen gestylt werden können. Hier ist ein einfaches Beispiel:

```javascript
import styled from '@emotion/styled';

const Button = styled.button`
  background-color: ${props => props.primary ? 'blue' : 'white'};
  color: ${props => props.primary ? 'white' : 'blue'};
  font-size: 16px;
  border: 2px solid blue;
  padding: 10px 20px;
`;

// Verwendung des Styled Components
<Button primary>Primary Button</Button>
<Button>Secondary Button</Button>
```

In diesem Beispiel wird ein Styled Component Button definiert, der verschiedene CSS-Stile aufweist, abhängig von den übergebenen Props.

3. Verwendung von Emotion Core
Emotion Core bietet eine Low-Level-API zum Erstellen von CSS-in-JS-Styles. Es kann verwendet werden, um Styles dynamisch zu generieren oder um Stylesheets auf Komponentenebene zu erstellen.

```javascript
import { css } from '@emotion/react';

// CSS-Definitionen
const styles = css`
  background-color:

```