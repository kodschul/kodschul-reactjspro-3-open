import { useEffect, useState } from "react";
import "../App.css";

function App() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    console.log("useEffect 1");

    return () => {
      console.log("cleanup 1");
    };
  }, []);

  useEffect(() => {
    console.log("useEffect 2", document.getElementById("mycard"));

    return () => {
      console.log("cleanup 2");
    };
  });

  console.log("high level", document.getElementById("mycard"));

  useEffect(() => {
    console.log("useEffect 3");

    return () => {
      console.log("cleanup 3");
    };
  }, [count, step]);

  return (
    <>
      <h1>Counter</h1>
      <div id="mycard" className="card">
        <button onClick={() => setCount(count + 1)}>count is {count}</button>

        <button onClick={() => setStep(step + 1)}>step is {step}</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
