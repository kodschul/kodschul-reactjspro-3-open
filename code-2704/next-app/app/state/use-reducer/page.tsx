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

const actions = {
  inc: () => ({ type: ActionTypes.INC }),
  dec: () => ({ type: ActionTypes.INC }),
};

function StatePage() {
  const [countState, dispatch] = useReducer(countReducer, initialState);

  const inc = () => dispatch(actions.inc());
  const dec = () => dispatch(actions.dec());

  return (
    <div className="h-2/3">
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

function StatePage2() {
  const [countState, dispatch] = useReducer(countReducer, initialState);

  const inc = () => dispatch(actions.inc());
  const dec = () => dispatch(actions.dec());

  return (
    <div className="h-2/3">
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

export default function GroupedStatePage() {
  return (
    <>
      <StatePage />
      <div className="mt-10" />
      <StatePage2 />
    </>
  );
}
