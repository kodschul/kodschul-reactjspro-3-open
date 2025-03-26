import { useEffect, useReducer, useState } from "react";

import "../App.css";
import { produce } from "immer";

type CounterState = {
  count: number;
};
type CounterAction = {
  type: "INCREMENT" | "DECREMENT" | "RESET";
  step?: number;
};

const initialState = { count: 0 };

const counterReducer = (counterState: CounterState, action: CounterAction) => {
  const newState = produce(counterState, (state) => {
    const step = action.step || 1;
    switch (action.type) {
      case "INCREMENT":
        state.count += step;
        break;
      case "DECREMENT":
        state.count -= step;
        break;
      case "RESET":
        state.count = 0;
        break;
    }
  });

  return newState;

  // const step = action.step || 1;
  // switch (action.type) {
  //   case "INCREMENT":
  //     state.count += step;

  //     console.log("new_state", state, state === originalState);
  //     return state;

  //   // return { count: state.count + step };
  //   case "DECREMENT":
  //     state.count -= step;
  //     return state;
  //   // return { count: state.count - step };
  //   case "RESET":
  //     return { ...initialState };
  //   default:
  //     return state;
  // }
};

function App() {
  const [state, dispatch] = useReducer(counterReducer, initialState);

  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button onClick={() => dispatch({ type: "INCREMENT", step: 1 })}>
          +
        </button>

        <label> count is {state.count}</label>
        <button onClick={() => dispatch({ type: "DECREMENT", step: 1 })}>
          -
        </button>

        <button onClick={() => dispatch({ type: "RESET" })}>Reset</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
