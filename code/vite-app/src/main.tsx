import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./rickmorty/CharactersPageRQ";

createRoot(document.getElementById("root")!).render(<App />);
