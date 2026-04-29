import { useEffect, useState } from "react";

function useCounter() {
  const [count, setCount] = useState(0);

  const inc = () => setCount(count + 1);
  const dec = () => setCount(count - 1);

  return { count, inc, dec };
}

function CounterApp() {
  const { count, inc, dec } = useCounter();

  return (
    <div>
      <button onClick={inc}>inc</button>
      {count}
      <button onClick={dec}>dec</button>
    </div>
  );
}

function CounterApp2() {
  const { count, inc, dec } = useCounter();

  return (
    <div>
      <button onClick={inc}>inc</button>
      {count}
      <button onClick={dec}>dec</button>
      <button onClick={() => null}>dec hidden</button>
    </div>
  );
}

export default function App() {
  return (
    <>
      <CounterApp />
      <CounterApp2 />
    </>
  );
}
