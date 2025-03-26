import { lazy, Suspense } from "react";
import "../App.css";

// import SlowComponent from "./SlowComponent";
const SlowComponent = lazy(() => import("./SlowComponent"));

function App() {
  return (
    <>
      <h1>Lazy Loading</h1>
      <div className="card">
        <Suspense fallback={<div>Loading....</div>}>
          <SlowComponent />
        </Suspense>

        <p>This is Lazy Loading Concept-App</p>
      </div>
    </>
  );
}

export default App;
