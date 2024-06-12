import logo from "../logo.svg";
import "../App.css";
import { useEffect, useRef, useState, useReducer } from "react";

import { produce } from "immer";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <Counter />
      </header>
    </div>
  );
}

const useCounterReducer = (initialState) =>
  useReducer(counterReducer, initialState);

const counterReducer = (currentState, action) => {
  const nextState = produce(currentState, (state) => {
    switch (action.type) {
      case "INCREMENT":
        state.count += state.count >= 5 ? 10 : 1;
        break;

      case "DECREMENT":
        state.count -= state.count >= 5 ? 10 : 1;
        break;

      default:
        break;
    }
  });

  return nextState;
};

const Counter = () => {
  //   const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  const [state, dispatch] = useCounterReducer({ count: 0 });

  const increment = () => {
    dispatch({ type: "INCREMENT" });
  };

  const decrement = () => {
    dispatch({ type: "DECREMENT" });
  };

  console.log(state);

  return (
    <>
      <button onClick={increment}>+</button>
      <p>{state.count}</p>
      <button onClick={decrement}>-</button>
    </>
  );
};

export default App;
