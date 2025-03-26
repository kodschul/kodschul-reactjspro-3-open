import { Provider } from "react-redux";
import CounterRedux from "./CounterRedux";
import { store } from "./store";
import Watcher from "./Watcher";

const App = () => {
  return (
    <Provider store={store}>
      <CounterRedux />

      <Watcher />
    </Provider>
  );
};

export default App;
