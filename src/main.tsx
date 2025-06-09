import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import App2 from "./App2.tsx"; // Assume this is your new PEDMAS app
import App3 from "./App3.tsx";
import App4 from "./App4.tsx";
import App5 from "./App5.tsx";
import App6 from "./App6.tsx"; // Added import for App6
import App7 from "./App7.tsx"; // Added import for App7
import "./index.css";

function Main() {
  const [selectedApp, setSelectedApp] = useState("App1");

  const renderSelectedApp = () => {
    switch (selectedApp) {
      case "App1":
        return <App />;
      case "App2":
        return <App2 />;
      case "App3":
        return <App3 />;
      case "App4":
        return <App4 />;
      case "App5":
        return <App5 />;
      case "App6":
        return <App6 />;
      case "App7": // Added case for App7
        return <App7 />;
      default:
        return <App />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <select
        className="mb-4 p-2 border rounded"
        value={selectedApp}
        onChange={(e) => setSelectedApp(e.target.value)}
      >
        <option value="App1">Addition / Subtraction</option>
        <option value="App2">PEDMAS</option>
        <option value="App3">Spelling</option>
        <option value="App4">Estimation</option>
        <option value="App5">Square Roots</option>
        <option value="App6">Pythagorean Theorem</option> {/* Added App6 */}
        <option value="App7">Geometry Calculations</option> {/* Added App7 */}
      </select>
      {renderSelectedApp()}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Main />
  </StrictMode>
);
