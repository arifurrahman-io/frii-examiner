import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "@fontsource/anek-bangla/bengali-400.css";
import "@fontsource/anek-bangla/bengali-500.css";
import "@fontsource/anek-bangla/bengali-600.css";
import "@fontsource/anek-bangla/bengali-700.css";
import "@fontsource/anek-bangla/latin-400.css";
import "@fontsource/anek-bangla/latin-600.css";
import "@fontsource/anek-bangla/latin-700.css";
import { AuthProvider } from "./context/AuthContext.jsx";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
