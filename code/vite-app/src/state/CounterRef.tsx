import { useEffect, useRef, useState } from "react";
import "../App.css";

function App() {
  const [count, setCount] = useState(0);

  const renderCount = useRef(0);
  renderCount.current++;

  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef?.current?.click?.();
  }, []);

  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button
          ref={btnRef}
          onClick={() => setCount(count + 1)}

          // onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <button onClick={() => alert(renderCount.current + " times")}>
          Click to show how often I re-rerendered!
        </button>

        <button
          onClick={() => setCount(count - 1)}

          // onClick={() => setCount((count) => count + 1)}
        >
          -
        </button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
