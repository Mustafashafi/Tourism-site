import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fef2f2' }, duration: 6000 },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
