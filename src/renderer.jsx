import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

const App = () => {
  return (
    <p className="text-2xl text-red-200">test</p>
  )
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <App/>
  </StrictMode>
);
