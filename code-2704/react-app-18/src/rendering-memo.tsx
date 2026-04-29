import React, { memo, useEffect, useState } from "react";

const navigationCachedFunc = () => null;
const formatUsername = (username) => username.toUpperCase();

function RenderingApp() {
  console.log("Parent RENDERED!");

  const [count, setCount] = useState(0);
  const [isVisible, setVisible] = useState(true);

  return (
    <div>
      RenderingApp
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <button onClick={() => setVisible(!isVisible)}>Toggle</button>
      <Child navigation={navigationCachedFunc} count={count} />
    </div>
  );
}
const propsAreEqual = (prevProps, nextProps) => {
  return prevProps.count === nextProps.count;
};

const Child = memo(({ count }) => {
  // const [childCount, setChildCount] = useState(count);

  console.log("Child RENDERED!", count);

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
});

export default RenderingApp;
