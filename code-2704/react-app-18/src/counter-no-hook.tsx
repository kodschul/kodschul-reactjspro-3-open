import { useState } from "react";

function CounterApp() {
  const [count, setCount] = useState(0);

  const inc = () => setCount(count + 1);
  const dec = () => setCount(count - 1);

  return (
    <div>
      <button onClick={inc}>inc</button>
      {count}
      <button onClick={dec}>dec</button>

      <button onClick={() => setCount(count + 10)}>dec hidden</button>
    </div>
  );
}

export default CounterApp;
