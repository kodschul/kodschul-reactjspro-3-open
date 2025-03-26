import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "./counterSlice";
import { useSelector } from "react-redux";

export const store = configureStore({
  reducer: {
    // Add your reducers here
    counter: counterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export const useAppSelector = useSelector.withTypes<RootState>();
