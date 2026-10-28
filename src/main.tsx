import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans";
import "./index.css";
import App from "./App";
import { applyTheme, loadCachedTheme } from "./lib/theme";

const cached = loadCachedTheme();
applyTheme(cached.theme, cached.appearance);

const isReminder =
  window.location.hash.startsWith("#/reminder") ||
  new URLSearchParams(window.location.search).get("window") === "reminder";

if (isReminder) {
  document.documentElement.classList.add("reminder-window");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App isReminder={isReminder} />
  </React.StrictMode>,
);
