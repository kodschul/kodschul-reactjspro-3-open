import { useEffect, useState } from "react";
import "../App.css";

const CounterComponent = ({ initialCount }) => {
  console.log("CounterComponent", initialCount);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  // if (count != initialCount) {
  //   setCount(initialCount);
  // }

  useEffect(() => {
    console.log("CounterComponent was mounted");

    return () => {
      console.log("CounterComponent was unmounted");
    };
  }, []);

  return (
    <div>
      <h1>Counter</h1>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>count is {count}</button>
        <p>This is an Empty App</p>
      </div>
    </div>
  );
};

function App() {
  const [initialCount, setInitialCount] = useState(0);
  const [isVisible, setVisible] = useState(true);

  useEffect(() => {
    console.log("Hallo with UseEffect!");
  }, []);

  return (
    <>
      {isVisible && <CounterComponent initialCount={initialCount} />}

      <button onClick={() => setVisible(!isVisible)}>
        {isVisible ? "Hide" : "Show"}
      </button>

      <button onClick={() => setInitialCount(initialCount + 1)}>
        Main Count is {initialCount}
      </button>
    </>
  );
}

export default App;
