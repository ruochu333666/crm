import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  sub?: number | string;
  username?: string;
  role?: "sales" | "manager" | "admin";
  teamId?: number | string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "未授权访问" });
      return;
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const secret = process.env.JWT_SECRET || "dev_secret";
    const payload = jwt.verify(token, secret) as TokenPayload;

    const userId = Number(payload.sub);
    if (!userId || Number.isNaN(userId)) {
      res.status(401).json({ message: "无效令牌" });
      return;
    }

    req.user = {
      id: userId,
      username: payload.username || "",
      role: (payload.role as TokenPayload["role"]) || "sales",
      teamId: payload.teamId ? Number(payload.teamId) : 1,
    };
    next();
  } catch (error) {
    console.error("[auth] 鉴权失败:", error);
    res.status(401).json({ message: "登录已过期，请重新登录" });
  }
}

