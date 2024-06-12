import logo from "../logo.svg";
import "../App.css";
import { useEffect, useRef, useState, useReducer } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import Counter from "./Counter";
import Watcher from "./Watcher";
import { PersistGate } from "redux-persist/integration/react";

import store, { persistor } from "./store";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <div className="App">
          <header className="App-header">
            <Watcher />
            <img src={logo} className="App-logo" alt="logo" />

            <Counter />
          </header>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
