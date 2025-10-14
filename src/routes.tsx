import React from "react";
import type { RouteObject } from "react-router-dom";
import LoginPage from "./page/login";
import RegisterPage from "./page/register";

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
];

export default routes;
