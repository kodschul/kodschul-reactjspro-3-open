import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import { decrement, increment, reset } from "./counterSlice";

function App() {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();
  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button onClick={() => dispatch(increment(1))}>+</button>

        <label> count is {count}</label>
        <button
          onClick={() => dispatch({ type: "counter/decrement", payload: 2 })}
        >
          - -
        </button>

        <button onClick={() => dispatch(reset())}>RESET</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
