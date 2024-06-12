import { useSelector } from "react-redux";

const Watcher = () => {
  const count = useSelector((state) => state.counter.count);

  return (
    <div>
      <div>Current Value is: {count}</div>
    </div>
  );
};

export default Watcher;
