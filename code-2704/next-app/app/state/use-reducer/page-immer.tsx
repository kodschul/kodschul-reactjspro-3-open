"use client";
import React, { useReducer, useState } from "react";
import { produce } from "immer";

const initialState = produce(
  {
    count: 0,
    changes: 0,
  },
  () => {}
);

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
  const finalState = produce(oldState, (draftState) => {
    switch (action.type) {
      case ActionTypes.INC:
        draftState.count += 1;
        draftState.changes += 1;
        break;

      case ActionTypes.DEC:
        draftState.count -= 1;
        draftState.changes -= 1;
        break;
    }
  });

  return finalState;
};

function StatePage() {
  const [countState, dispatch] = useReducer(countReducer, initialState);

  const inc = () => dispatch({ type: ActionTypes.INC });
  const dec = () => dispatch({ type: ActionTypes.DEC });

  countState.count = 100000;

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
