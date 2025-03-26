import { useMemo, useState } from "react";
import "../App.css";
import useCounter from "../hooks/useCounter";

function App() {
  const { count, inc, dec, reset } = useCounter(0, 5);
  const [x, setX] = useState(0);

  const calculateExpensive = (localCount) => {
    console.log("Expensive calculation");
    return localCount * 2;
  };

  const expensiveValue = useMemo(() => calculateExpensive(count), [count]);

  console.log({ expensiveValue });
  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button
          onClick={inc}

          // onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>

        <button onClick={dec}>-</button>

        <button onClick={() => setX(x + 1)}>x</button>
        <button onClick={reset}>reset</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
