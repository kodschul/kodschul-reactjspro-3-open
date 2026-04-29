"use client";
import React, { useReducer, useState } from "react";

const initialState = {
  count: 0,
  changes: 0,
};

type State = typeof initialState;

enum ActionTypes {
  INC,
  DEC,
}

type Action = {
  type: ActionTypes;
  // payload?: any;
};

const countReducer = (oldState: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.INC:
      return {
        ...oldState,
        count: oldState.count + 1,
        changes: oldState.changes + 1,
      };

    case ActionTypes.DEC:
      return {
        ...oldState,
        count: oldState.count - 1,
        changes: oldState.changes + 1,
      };

    default:
      return oldState;
  }
};

function StatePage() {
  const [countState, dispatch] = useReducer(countReducer, initialState);

  const inc = () => dispatch({ type: ActionTypes.INC });
  const dec = () => dispatch({ type: ActionTypes.DEC });

  return (
    <div>
      <button className="bg-amber-200 p-4" onClick={inc}>
        +
      </button>
      <div>Count: {countState.count}</div>
      <button className="bg-amber-200 p-4" onClick={dec}>
        -
      </button>
    </div>
  );
}

export default StatePage;
