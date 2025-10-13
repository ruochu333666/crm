import React from "react";
import type { RouteObject } from "react-router-dom";
import LoginPage from "./page/login";

const routes: RouteObject[] = [
  // 在这里定义您的路由
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export default routes;
