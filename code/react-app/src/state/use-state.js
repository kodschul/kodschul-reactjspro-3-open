import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  const [defaultCount, setDefaultCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <Counter count={defaultCount} />

        <input
          type="number"
          value={defaultCount}
          onChange={(e) => setDefaultCount(parseInt(e.target.value))}
          placeholder="Enter default value"
        />

        {/* <ListComponent /> */}
      </header>
    </div>
  );
}

const useCounter = (defaultCount) => {
  const [count, setCount] = useState(defaultCount);

  // mutable objects between re-renders
  const copyValueRef = useRef(0);

  // useEffect(() => {
  //   setCount(defaultCount);
  // }, [defaultCount]);

  // let copyValue = copyValueRef.c;

  useEffect(() => {
    let interval = setInterval(
      () => setCount((prevCount) => prevCount + 1),
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { copyValueRef, count, setCount };
};

export const Counter = ({ count: defaultCount = 0 }) => {
  const { count, setCount, copyValueRef } = useCounter(defaultCount);

  return (
    <>
      <button testID="click-me" onClick={() => setCount(count + 1)}>
        +
      </button>
      <p>{count}</p>
      <button onClick={() => setCount(count - 1)}>-</button>

      <button
        onClick={() => {
          copyValueRef.current = count;
          alert(copyValueRef.current);
        }}
      >
        Copy value
      </button>
      <button onClick={() => alert(copyValueRef.current)}>Show me</button>

      <hr />
      <button
        onClick={() => {
          copyValueRef.current++;
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          copyValueRef.current--;
        }}
      >
        -
      </button>
    </>
  );
};

// const ListComponent = () => {
//   let elements = [];

//   for (let i = 0; i < 10; i++) {
//     elements.push(i);
//   }

//   return (
//     <div>
//       {elements.map((element) => {
//         console.log("element: ", element);
//         return <div>{element}</div>;
//       })}
//     </div>
//   );
// };

export default App;
