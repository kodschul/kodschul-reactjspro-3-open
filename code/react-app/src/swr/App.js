import logo from "../logo.svg";
import "../App.css";
import Characters from "./Characters";
import { useState } from "react";
import { SWRConfig } from "swr";

function App() {
  const [isVisible, setVisible] = useState(true);
  return (
    <SWRConfig
      value={{
        dedupingInterval: 10000,
      }}
    >
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          {isVisible && <Characters />}

          <button onClick={() => setVisible(!isVisible)}>Toggle</button>
        </header>
      </div>
    </SWRConfig>
  );
}

export default App;
