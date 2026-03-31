import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const followupsRouter = Router();

followupsRouter.use(requireAuth);

// GET /api/followups?customerId=1
followupsRouter.get("/", async (req, res, next) => {
  try {
    const customerId = Number(req.query.customerId);
    const ownerUserId = req.user?.id;

    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "customerId 必填" });
    }
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at
       FROM followup_records
       WHERE customer_id = ? AND owner_user_id = ?
       ORDER BY created_at DESC`,
      [customerId, ownerUserId]
    );

    return res.json({ data: rows });
  } catch (err) {
    console.error("[followups] 查询跟进记录失败:", err);
    next(err);
  }
});

// POST /api/followups
followupsRouter.post("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const { customerId, method, content, nextFollowUpAt } = req.body as {
      customerId?: number;
      method?: string;
      content?: string;
      nextFollowUpAt?: string | null;
    };

    if (!customerId || !method || !content) {
      return res.status(400).json({ message: "customerId/method/content 必填" });
    }

    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO followup_records
       (customer_id, owner_user_id, method, content, next_follow_up_at)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, ownerUserId, method, content, nextFollowUpAt || null]
    );
    const followupId = insertResult.insertId;

    await pool.query(
      `UPDATE customers
       SET last_follow_up_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [customerId]
    );

    if (nextFollowUpAt) {
      await pool.query(
        `INSERT INTO tasks
         (customer_id, owner_user_id, followup_id, title, due_at, status, priority)
         VALUES (?, ?, ?, ?, ?, 'open', 2)`,
        [customerId, ownerUserId, followupId, `客户跟进提醒（${method}）`, nextFollowUpAt]
      );
    }

    return res.status(201).json({
      message: "新增跟进记录成功",
      id: followupId,
    });
  } catch (err) {
    console.error("[followups] 新增跟进记录失败:", err);
    next(err);
  }
});

