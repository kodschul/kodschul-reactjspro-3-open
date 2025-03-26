import { useState } from "react";

const useCounter = (initialState = 0, step = 1) => {
  const [count, setCount] = useState(initialState);

  const inc = () => setCount(count + step);
  const dec = () => setCount(count - step);
  const reset = () => setCount(0);

  return { count, inc: count > 5 ? undefined : inc, dec, reset };
};

export default useCounter;
