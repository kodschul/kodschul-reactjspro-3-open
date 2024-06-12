import logo from "../logo.svg";
import "../App.css";

// import SlowComponent from "./SlowComponent";
import { Suspense, lazy, useState } from "react";

const App = () => {
  const [isLoaded, setLoaded] = useState(false);

  const SlowComponent = lazy(() => import("./SlowComponent"));
  return (
    <div className="App">
      <header className="App-header" onClick={() => setLoaded(true)}>
        <img src={logo} className="App-logo" alt="logo" />
      </header>

      {/* <SlowComponent /> */}
      {isLoaded && (
        <Suspense
          fallback={
            <div
              style={{ width: 400, height: 400, backgroundColor: "green" }}
            ></div>
          }
        >
          <SlowComponent />
        </Suspense>
      )}
    </div>
  );
};

export default App;
