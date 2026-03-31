import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      username: string;
      role?: "sales" | "manager" | "admin";
      teamId?: number;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};

