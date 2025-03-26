import { use, useEffect, useRef, useState } from "react";
import "../App.css";

function App() {
  const [timeoutSecs, setTimeoutSecs] = useState<number>();
  const [duration, setDuration] = useState(3);
  const [isActive, setActive] = useState(false);

  const timerRef = useRef<number>(null);

  useEffect(() => {
    if (isActive) {
      // start
      setTimeoutSecs(duration);
      timerRef.current = setInterval(() => {
        setTimeoutSecs((prevValue = 0) => prevValue - 1);
      }, 1000);
    }
  }, [isActive]);

  // auto-stop
  useEffect(() => {
    if (timeoutSecs === 0) {
      setActive(false);
      // @ts-ignore
      timerRef?.current && clearInterval(timerRef?.current);
    }
  }, [timeoutSecs]);

  return (
    <div
      style={{
        backgroundColor: timeoutSecs === 0 ? "red" : "white",
        width: "100vw",
        height: "100vh",
      }}
    >
      <h1>Timeout</h1>
      <div className="card">
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.valueAsNumber)}
        />
        <button onClick={() => setActive(true)}>START</button>
        <button onClick={() => setActive(false)}>STOP</button>
        {isActive && <div style={{ fontSize: 200 }}>{timeoutSecs}</div>}
      </div>
    </div>
  );
}

export default App;
