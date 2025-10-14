import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Routers (to be implemented in follow-up edits)
import { apiRouter } from "./routes/index";

// Global error handler
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRouter);

// 404 fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handler should be the last middleware
app.use(
  errorHandler as unknown as (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void
);

const PORT = Number(process.env.PORT || 5174);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${PORT}`);
});
