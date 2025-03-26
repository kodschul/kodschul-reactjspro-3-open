import { useEffect, useState } from "react";
import "../App.css";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("counter started");

    const countInterval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => {
      console.log("counter stopped");
      clearInterval(countInterval);
    };
  }, []);

  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button
          onClick={() => setCount(count + 1)}

          // onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
