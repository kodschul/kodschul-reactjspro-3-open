import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./race-condition-fetch-no-op";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
