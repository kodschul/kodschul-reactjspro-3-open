import { useAppSelector } from "./store";

const Watcher = () => {
  const count = useAppSelector((state) => state.counter?.count);
  return <div> Current Value is: {count}</div>;
};

export default Watcher;
