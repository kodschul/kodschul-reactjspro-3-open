"use client";
import React, { useState } from "react";

function StatePage() {
  const [countState, setCountState] = useState({ count: 0, step: 1 });

  const _inc = () => {
    setCountState({
      ...countState,
      count: countState.count + countState.step,
    });
  };

  const inc = () => {
    countState.count += countState.step;

    console.log(countState === countState);
    setCountState({ ...countState });
    // setCountState({
    //   ...countState,
    //   count: countState.count + countState.step,
    // });
  };

  const dec = () => {
    setCountState({ ...countState, count: countState.count - countState.step });
  };
  return (
    <div>
      <button className="bg-amber-200 p-4" onClick={inc}>
        +
      </button>
      <div>Count: {countState.count}</div>
      <div>Step: {countState.step}</div>
      <button className="bg-amber-200 p-4" onClick={dec}>
        -
      </button>
    </div>
  );
}

export default StatePage;
