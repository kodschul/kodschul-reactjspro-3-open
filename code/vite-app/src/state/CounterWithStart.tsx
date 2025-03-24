import { useEffect, useState } from "react";
import "../App.css";

function App() {
  const [count, setCount] = useState<any>(undefined);

  useEffect(() => {
    console.log("Hallo with UseEffect!");
  }, []);

  // if (count == undefined) {
  //   console.log("Welcome to the Counter App!");

  // }

  setCount(0);

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

        <button onClick={() => setCount(undefined)}>Set Undefined</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
