import { create } from "zustand";

const useCounter = create((set) => ({
  count: 20,
  inc: (value = 1) =>
    set((state) => ({ ...state, count: state.count + value })),
  dec: (value = 1) =>
    set((state) => ({ ...state, count: state.count - value })),
}));

const Counter = () => {
  const { count, inc, dec } = useCounter();

  return (
    <>
      <button onClick={() => inc(2)}>+</button>
      <p>{count}</p>
      <button onClick={() => dec(2)}>-</button>
    </>
  );
};

export default Counter;
