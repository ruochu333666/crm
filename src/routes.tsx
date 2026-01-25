import type { RouteObject } from "react-router-dom";
import LoginPage from "./page/login";
import RegisterPage from "./page/register";
import CustomerManagementPage from "./page/customer management";

const routes: RouteObject[] = [
  // 在这里定义您的路由
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/customer-management",
    element: <CustomerManagementPage />,
  },
];

export default routes;
