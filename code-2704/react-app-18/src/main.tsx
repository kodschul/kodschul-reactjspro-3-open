import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./perf-op";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
  </>
);
