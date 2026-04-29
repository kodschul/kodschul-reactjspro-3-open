import React, { useEffect, useState } from "react";

function RenderingApp() {
  console.log("Parent RENDERED!");

  const [count, setCount] = useState(0);
  const [isVisible, setVisible] = useState(true);

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
