import { useState } from "react";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button
          data-testid="increment-button"
          onClick={() => setCount(count + 1)}

          // onClick={() => setCount((count) => count + 1)}
        >
          {"count is " + count}
        </button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
