import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "./slices/counter";

const Counter = () => {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  const inc = () => dispatch(increment());
  const dec = () => dispatch(decrement());

  console.log("re-render");

  return (
    <>
      <button onClick={inc}>+</button>
      <p>{count}</p>
      <button onClick={dec}>-</button>
    </>
  );
};

export default Counter;
