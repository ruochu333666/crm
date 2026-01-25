import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, initialized } = useAuthStore();
  const location = useLocation();

  // 初始化未完成时，不做重定向，避免闪退
  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
