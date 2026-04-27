import { useEffect, useState } from "react";

function AutoCountUp() {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  //   if (count < 10) {
  //     setTimeout(() => {
  //       console.log("CHANGE_TIMEOUT", count + 1);
  //       setCount(count + 1);
  //     }, 1000);
  //   }

  useEffect(() => {
    console.log("create a new timeout");

    if (count >= 10) return;

    setInterval(() => {});

    // setTimeout(() => {
    //   setCount(count + 1);
    //   console.log("CHANGE_TIMEOUT", count + 1);
    // }, 1000);
  }, [count]);

  return (
    <div>
      AutoCountUp: {count}
      <button onClick={() => setCount2(count2 + 1)}>{count2}</button>
    </div>
  );
}

export default AutoCountUp;
