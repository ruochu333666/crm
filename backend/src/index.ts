import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Routers (to be implemented in follow-up edits)
import { apiRouter } from "./routes/index";

// Global error handler
import { errorHandler } from "./middleware/errorHandler";
import {
  assertUsersTable,
  testConnection,
} from "./config/db";

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

async function bootstrap(): Promise<void> {
  try {
    await testConnection();
    // eslint-disable-next-line no-console
    console.log("[server] 数据库连接成功");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[server] 数据库连接失败。请在 backend 目录创建 .env，至少设置："
    );
    // eslint-disable-next-line no-console
    console.error(
      "  DB_HOST=127.0.0.1  DB_PORT=3306  DB_USER=root  DB_PASSWORD=<与 Docker MYSQL_ROOT_PASSWORD 一致>  DB_NAME=app_db"
    );
    // eslint-disable-next-line no-console
    console.error(
      "  并在 MySQL 中执行 backend/init.sql 创建库与 users 表（见 .env.example）。"
    );
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }

  try {
    await assertUsersTable();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      "[server] 未找到 users 表。请在 MySQL 中执行：mysql -uroot -p < backend/init.sql（库名需与 DB_NAME 一致）。"
    );
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

void bootstrap();
