import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isKnownError =
    typeof error === "object" &&
    error !== null &&
    "status" in (error as Record<string, unknown>);
  const status = isKnownError
    ? (error as { status?: number }).status || 500
    : 500;
  const message = isKnownError
    ? (error as { message?: string }).message || "Server Error"
    : "Server Error";

  // eslint-disable-next-line no-console
  console.error("[error]", error);

  res.status(status).json({ message });
}

