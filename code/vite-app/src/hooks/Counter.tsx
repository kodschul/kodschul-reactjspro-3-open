import { useState } from "react";
import "../App.css";
import useCounter from "./useCounter";
// import useReactionGame from "./useReactionGame";

type ReactionGameOutput = {
  start: () => void;
  hit: () => void;
  isWaiting: boolean;
  reactionTime?: number;
  isGameStarted: boolean;
};

function App() {
  const { count, inc, dec, reset } = useCounter(0, 5);

  //   const { start, hit, isGameStarted, reactionTime }: ReactionGameOutput =
  //     useReactionGame();

  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button
          onClick={inc}

          // onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>

        <button onClick={dec}>-</button>
        <button onClick={reset}>reset</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

function App2() {
  const { count, inc, dec, reset } = useCounter(0, 10);

  return (
    <>
      <h1>Counter 2</h1>
      <div className="card">
        <button
          onClick={inc}

          // onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>

        <button onClick={dec}>-</button>
        <button onClick={reset}>reset</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

const AppContainer = () => {
  return (
    <>
      <App />
      <App2 />
    </>
  );
};

export default AppContainer;
