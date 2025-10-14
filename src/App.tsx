import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import LoginPage from "./page/login";
import RegisterPage from "./page/register";
import HomePage from "./page/home";
import CustomerPage from "./page/customer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./store/auth";

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // 应用启动时检查认证状态
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <CustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
