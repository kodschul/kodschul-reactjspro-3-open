import { useEffect, useRef, useState } from "react";

function AutoCountUp() {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  const timerRef = useRef<number>(null);

  const stopCounter = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (count >= 4 && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [count]);

  useEffect(() => {
    console.log("create a new interval");
    timerRef.current = setInterval(() => {
      //   console.log("INCR:", count + 1);
      setCount((prevCount) => prevCount + 1);
    }, 1000);
    return () => stopCounter();
  }, []);

  return (
    <div>
      AutoCountUp: {count}
      <button onClick={() => setCount2(count2 + 1)}>{count2}</button>
      <button onClick={() => stopCounter()}> Stop </button>
      <button onClick={stopCounter}> Stop </button>
      <button onClick={startCounter}> Start </button>
    </div>
  );
}

export default AutoCountUp;
