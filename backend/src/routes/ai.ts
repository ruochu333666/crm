import { Router } from "express";
import { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";
import { generateCustomerNextStepAdvice } from "../services/aiClient";

export const aiRouter = Router();
aiRouter.use(requireAuth);

// POST /api/ai/customer-next-step
aiRouter.post("/customer-next-step", async (req, res, next) => {
  try {
    const user = req.user as { id: number; role?: "sales" | "manager" | "admin"; teamId?: number };
    const { customerId } = req.body as { customerId?: number };

    if (!customerId || Number.isNaN(Number(customerId))) {
      return res.status(400).json({ message: "customerId 必填" });
    }

    let whereClause = "WHERE c.id = ?";
    const params: Array<string | number> = [Number(customerId)];
    if (user.role === "sales") {
      whereClause += " AND c.owner_user_id = ? AND c.pool_status = 'private'";
      params.push(user.id);
    } else if (user.role === "manager") {
      whereClause += " AND c.owner_user_id IN (SELECT id FROM users WHERE team_id = ?) ";
      params.push(user.teamId || 1);
    }

    const [customerRows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.name, c.company, c.status, c.region
       FROM customers c
       ${whereClause}
       LIMIT 1`,
      params
    );
    const customer = customerRows[0];
    if (!customer) {
      return res.status(404).json({ message: "客户不存在或无权限访问" });
    }

    const [followRows] = await pool.query<RowDataPacket[]>(
      `SELECT method, content, created_at
       FROM followup_records
       WHERE customer_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [customer.id]
    );

    const [taskRows] = await pool.query<RowDataPacket[]>(
      `SELECT title, due_at, status
       FROM tasks
       WHERE customer_id = ? AND status = 'open'
       ORDER BY due_at ASC
       LIMIT 5`,
      [customer.id]
    );

    const advice = await generateCustomerNextStepAdvice({
      customerName: String(customer.name),
      company: String(customer.company || ""),
      status: String(customer.status || ""),
      region: String(customer.region || ""),
      lastFollowups: followRows.map((r) => ({
        createdAt: String(r.created_at || ""),
        method: String(r.method || ""),
        content: String(r.content || ""),
      })),
      openTasks: taskRows.map((r) => ({
        title: String(r.title || ""),
        dueAt: String(r.due_at || ""),
        status: String(r.status || ""),
      })),
    });

    return res.json({ data: advice });
  } catch (error) {
    console.error("[ai] 生成客户建议失败:", error);
    next(error);
  }
});

