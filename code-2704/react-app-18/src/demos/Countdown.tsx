import React, { useEffect, useRef, useState } from "react";

const Countdown = () => {
  const [state, setState] = useState(0);
  const timerRef = useRef<number>();

  //   useEffect(() => {
  //     setTimeout(() => {
  //       alert("Wilkommen");
  //     }, 1000);
  //   }, []);

  //   setState(1);

  useEffect(() => {
    document.getElementById("countdown").style.backgroundColor = "yellow";
  }, []);

  //   if (document?.getElementById("countdown")) {
  //     document.getElementById("countdown").style.backgroundColor = "yellow";
  //   }

  //   useEffect(() => {
  //     timerRef.current = setTimeout(() => {
  //       alert("Wilkommen");
  //     }, 1000);

  //     return () => {
  //       if (timerRef.current) {
  //         clearTimeout(timerRef.current);
  //       }
  //     };
  //   }, []);

  return <div id="countdown">Countdown</div>;
};

export default Countdown;
