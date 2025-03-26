import {} from "react";
import "../App.css";
import { create } from "zustand";

// type CounterState = {
//   count: number;
// };

const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}));

function App() {
  const { count, inc, dec } = useStore();
  return (
    <>
      <h1>Counter</h1>
      <div className="card">
        <button
          onClick={() => inc()}

          // onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>

        <button onClick={() => dec()}>Decrement</button>
        <p>This is an Empty App</p>
      </div>
    </>
  );
}

export default App;
