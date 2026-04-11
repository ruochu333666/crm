import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

/** 将 ISO 8601 或常见字符串转为 MySQL DATETIME 可接受的格式 */
function toMysqlDateTime(input: string): string | null {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// GET /api/tasks
tasksRouter.get("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const priority = req.query.priority as string | undefined;
    const search = req.query.search as string | undefined;
    const dueFrom = req.query.dueFrom as string | undefined;
    const dueTo = req.query.dueTo as string | undefined;
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);

    let whereClause = "WHERE t.owner_user_id = ?";
    const params: Array<number | string> = [ownerUserId];

    if (status) {
      whereClause += " AND t.status = ?";
      params.push(status);
    }
    if (dueTo) {
      whereClause += " AND t.due_at <= ?";
      params.push(dueTo);
    }
    if (dueFrom) {
      whereClause += " AND t.due_at >= ?";
      params.push(dueFrom);
    }
    if (type) {
      whereClause += " AND t.type = ?";
      params.push(type);
    }
    if (priority) {
      whereClause += " AND t.priority = ?";
      params.push(Number(priority));
    }
    if (search) {
      whereClause += " AND (t.title LIKE ? OR c.name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM tasks t
       LEFT JOIN customers c ON c.id = t.customer_id
       ${whereClause}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         t.id,
         t.customer_id,
         t.owner_user_id,
         t.followup_id,
         t.title,
         t.type,
         t.source,
         t.due_at,
         t.status,
         t.priority,
         t.result,
         t.done_at,
         t.created_at,
         t.updated_at,
         c.name AS customer_name
       FROM tasks t
       LEFT JOIN customers c ON c.id = t.customer_id
       ${whereClause}
       ORDER BY t.due_at ASC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({ data: rows, total, page, pageSize });
  } catch (err) {
    console.error("[tasks] 查询任务失败:", err);
    next(err);
  }
});

// POST /api/tasks
tasksRouter.post("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const {
      customerId,
      title,
      dueAt,
      type = "followup",
      source = "manual",
      priority = 2,
      status = "open",
      result,
    } = req.body as {
      customerId?: number;
      title?: string;
      dueAt?: string;
      type?: string;
      source?: string;
      priority?: number;
      status?: "open" | "done" | "cancelled";
      result?: string;
    };

    if (!customerId || !title || !dueAt) {
      return res.status(400).json({ message: "customerId/title/dueAt 必填" });
    }

    const dueAtMysql = toMysqlDateTime(String(dueAt));
    if (!dueAtMysql) {
      return res.status(400).json({ message: "截止时间格式无效" });
    }

    const [customerRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM customers
       WHERE id = ? AND owner_user_id = ? AND pool_status = 'private'
       LIMIT 1`,
      [customerId, ownerUserId]
    );
    if (!customerRows[0]) {
      return res.status(400).json({ message: "客户不存在或不在你的私海中" });
    }

    const doneAt = status === "done" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null;

    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO tasks
       (customer_id, owner_user_id, followup_id, title, type, source, due_at, status, priority, result, done_at, created_at, updated_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [customerId, ownerUserId, title, type, source, dueAtMysql, status, priority, result || null, doneAt]
    );

    return res.status(201).json({ message: "任务创建成功", id: insertResult.insertId });
  } catch (err) {
    console.error("[tasks] 创建任务失败:", err);
    next(err);
  }
});

// PUT /api/tasks/:id
tasksRouter.put("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const taskId = Number(req.params.id);
    const { status, dueAt, priority, title, result: taskResult } = req.body as {
      status?: "open" | "done" | "cancelled";
      dueAt?: string;
      priority?: number;
      title?: string;
      result?: string;
    };

    if (!taskId || Number.isNaN(taskId)) {
      return res.status(400).json({ message: "task id 无效" });
    }
    if (status && !["open", "done", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "status 必须为 open/done/cancelled" });
    }
    if (
      status === undefined &&
      dueAt === undefined &&
      priority === undefined &&
      title === undefined &&
      taskResult === undefined
    ) {
      return res.status(400).json({ message: "至少提供一个可更新字段" });
    }

    const sets: string[] = ["updated_at = NOW()"];
    const values: Array<string | number | null> = [];

    if (status !== undefined) {
      sets.push("status = ?");
      values.push(status);
      sets.push("done_at = ?");
      values.push(status === "done" ? new Date().toISOString().slice(0, 19).replace("T", " ") : null);
    }
    if (dueAt !== undefined) {
      const mysqlDue = toMysqlDateTime(String(dueAt));
      if (!mysqlDue) {
        return res.status(400).json({ message: "截止时间格式无效" });
      }
      sets.push("due_at = ?");
      values.push(mysqlDue);
    }
    if (priority !== undefined) {
      sets.push("priority = ?");
      values.push(priority);
    }
    if (title !== undefined) {
      sets.push("title = ?");
      values.push(title);
    }
    if (taskResult !== undefined) {
      sets.push("result = ?");
      values.push(taskResult);
    }

    const [updateResult] = await pool.query<ResultSetHeader>(
      `UPDATE tasks
       SET ${sets.join(", ")}
       WHERE id = ? AND owner_user_id = ?`,
      [...values, taskId, ownerUserId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "任务不存在或无权限" });
    }

    return res.json({ message: "更新任务成功" });
  } catch (err) {
    console.error("[tasks] 更新任务失败:", err);
    next(err);
  }
});

