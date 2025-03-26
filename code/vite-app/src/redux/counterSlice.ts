import { createSlice } from "@reduxjs/toolkit";

const initialState = { count: 0 };

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state, action: { payload: number }) => {
      state.count += action.payload;
    },
    decrement: (state, action) => {
      state.count -= action.payload;
    },
    reset: (state) => {
      state.count = 0;
    },
  },
});

export const { increment, decrement, reset } = counterSlice.actions;
