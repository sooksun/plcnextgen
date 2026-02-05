import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import "./styles/theme-3d.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
    <ToastContainer position="top-center" autoClose={3000} theme="light" rtl={false} />
  </ThemeProvider>
);
  