import React, { useEffect, useMemo, useState } from "react";

const expensiveFunc = (text) => {
  // await new Promise((r) => setTimeout(r, 2000));
  console.log("expensiveFunc called");

  let i = 0;

  while (i < 10e8) {
    Math.pow(
      Math.pow(Math.pow(10e9, Math.pow(10e9, 10e9)), Math.pow(10e9, 10e9)),
      Math.pow(10e9, 10e9)
    );
    i += 1;
  }
  return "Calculated: " + text;
};

function RenderingApp() {
  console.log("Parent RENDERED!");

  const [count, setCount] = useState(0);
  const [isVisible, setVisible] = useState(true);

  const result = useMemo(() => expensiveFunc(count), [count]);

  console.log({ result });

  return (
    <div>
      RenderingApp
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button onClick={() => setVisible(!isVisible)}>Toggle</button>
      <Child />
    </div>
  );
}

const Child = () => {
  // const [childCount, setChildCount] = useState(count);

  console.log("Child RENDERED!");

  // console.log("Child RENDERED!", {
  //   childCount,

  //   count,
  // });

  // useEffect(() => {
  //   setChildCount(count);
  // }, [count]);

  useEffect(() => {
    console.log("Child RENDERED ONCE!");
  }, []);
  return <div>Child</div>;
};

export default RenderingApp;
