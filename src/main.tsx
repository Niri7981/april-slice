import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/fusion-pixel-12px-monospaced-sc";
import { App } from "./app/App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
