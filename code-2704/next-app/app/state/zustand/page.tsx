"use client";
import React, { useReducer, useState } from "react";

import { create } from "zustand";

type Store = {
  count: number;
  changes: number;
  inc: () => void;
  dec: () => void;
};

const useCounterStore = create<Store>((set) => ({
  count: 0,
  changes: 0,

  inc: () =>
    set((state) => ({
      count: state.count + 1,
      changes: state.changes + 1,
    })),

  dec: () =>
    set((state) => ({
      count: state.count - 1,
      // changes: state.changes + 1,
    })),
}));

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
  const { count, changes, inc, dec } = useCounterStore();

  return (
    <div>
      <button className="bg-amber-200 p-4" onClick={inc}>
        +
      </button>
      <div>Count: {count}</div>
      <button className="bg-amber-200 p-4" onClick={dec}>
        -
      </button>
    </div>
  );
}

function StatePage2() {
  const { count, changes, inc, dec } = useCounterStore();

  return (
    <div>
      <button className="bg-amber-200 p-4" onClick={inc}>
        +
      </button>
      <div>Count: {count}</div>
      <button className="bg-amber-200 p-4" onClick={dec}>
        -
      </button>
    </div>
  );
}
export default function () {
  return (
    <>
      <StatePage />
      <StatePage2 />
    </>
  );
}
