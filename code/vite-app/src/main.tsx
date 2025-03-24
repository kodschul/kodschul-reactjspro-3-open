import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./state/CounterWithComponent";

createRoot(document.getElementById("root")!).render(<App />);
