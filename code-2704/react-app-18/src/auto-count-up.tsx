import { useEffect, useRef, useState } from "react";

function AutoCountUp() {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  const [isRunning, setRunning] = useState(true);
  const timerRef = useRef<number>(null);

  useEffect(() => {
    if (isRunning) {
      //   console.log({ count });
      console.log("create a new interval");
      timerRef.current = setInterval(() => {
        //   console.log("INCR:", count + 1);
        setCount((prevCount) => prevCount + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (count >= 4) {
      if (isRunning) {
        setRunning(false);
        // setCount(0);
      }
    }
  }, [count, isRunning]);

  return (
    <div>
      AutoCountUp: {count}
      <button onClick={() => setCount2(count2 + 1)}>{count2}</button>
      <button onClick={() => setRunning(false)}> Stop </button>
      <button onClick={() => setRunning(true)}> Start </button>
    </div>
  );
}

export default AutoCountUp;
