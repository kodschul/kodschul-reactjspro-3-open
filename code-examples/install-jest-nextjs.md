```
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node @types/jest @testing-library/user-event
```

add to jest.config.js

```javascript
const nextJest = require("next/jest");

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: "./" });

// Any custom config you want to pass to Jest
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./tests/jest.setup.ts"],
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig);
```

add new file tests/jest.setup.ts

```typescript
import "@testing-library/jest-dom";
```

add jest to npm scripts in package.json

```json
"scripts": {
    ...
  "test": "jest"
  ...
},
```

sample test file: tests/counter.spec.tsx

```typescript
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import CounterComponent from "....";

describe("Counter", () => {
  beforeAll(() => {
    userEvent.setup();
  });
  it("should render", () => {
    render(<CounterComponent />);

    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });
});
```
