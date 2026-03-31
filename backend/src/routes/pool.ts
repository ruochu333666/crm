import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const poolRouter = Router();
poolRouter.use(requireAuth);

interface PoolRuleRow extends RowDataPacket {
  id: number;
  recycle_days: number;
  daily_take_limit: number;
  followup_required_hours: number;
  grab_protect_minutes: number;
  need_approval: 0 | 1;
}

async function getPoolRule(): Promise<PoolRuleRow> {
  const [rows] = await pool.query<PoolRuleRow[]>(
    `SELECT id, recycle_days, daily_take_limit, followup_required_hours, grab_protect_minutes, need_approval
     FROM pool_rules
     WHERE id = 1
     LIMIT 1`
  );
  if (rows.length > 0) {
    return rows[0];
  }

  await pool.query(
    `INSERT INTO pool_rules
    (id, recycle_days, daily_take_limit, followup_required_hours, grab_protect_minutes, need_approval, created_at, updated_at)
    VALUES (1, 15, 20, 24, 30, 0, NOW(), NOW())`
  );

  const [inserted] = await pool.query<PoolRuleRow[]>(
    `SELECT id, recycle_days, daily_take_limit, followup_required_hours, grab_protect_minutes, need_approval
     FROM pool_rules
     WHERE id = 1
     LIMIT 1`
  );
  return inserted[0];
}

// GET /api/pool/customers
poolRouter.get("/customers", async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = "",
      region = "",
      poolReason = "",
    } = req.query;

    let whereClause = "WHERE c.pool_status = 'pool'";
    const params: Array<string | number> = [];

    if (search) {
      whereClause += " AND (c.name LIKE ? OR c.contact LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      whereClause += " AND c.status = ?";
      params.push(String(status));
    }
    if (region) {
      whereClause += " AND c.region = ?";
      params.push(String(region));
    }
    if (poolReason) {
      whereClause += " AND c.pool_reason = ?";
      params.push(String(poolReason));
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM customers c ${whereClause}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);

    const offset = (Number(page) - 1) * Number(pageSize);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*
       FROM customers c
       ${whereClause}
       ORDER BY c.pooled_at DESC, c.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );

    return res.json({
      data: rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error("[pool] 查询公海客户失败:", error);
    next(error);
  }
});

// POST /api/pool/take
poolRouter.post("/take", async (req, res, next) => {
  try {
    const operatorUserId = req.user?.id;
    if (!operatorUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const { customerId } = req.body as { customerId?: number };
    if (!customerId) {
      return res.status(400).json({ message: "customerId 必填" });
    }

    const rule = await getPoolRule();

    const [todayTakeRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM pool_actions
       WHERE operator_user_id = ? AND action = 'take' AND DATE(created_at) = CURDATE()`,
      [operatorUserId]
    );
    const todayTakeCount = Number(todayTakeRows[0]?.total || 0);
    if (todayTakeCount >= Number(rule.daily_take_limit || 20)) {
      return res.status(400).json({
        message: `今日捞取已达上限（${rule.daily_take_limit}）`,
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, owner_user_id, pool_status FROM customers WHERE id = ? LIMIT 1",
      [customerId]
    );
    const customer = rows[0];
    if (!customer) {
      return res.status(404).json({ message: "客户不存在" });
    }
    if (customer.pool_status !== "pool") {
      return res.status(400).json({ message: "该客户不在公海中" });
    }

    await pool.query(
      `UPDATE customers
       SET owner_user_id = ?, pool_status = 'private', pool_reason = NULL, pooled_at = NULL, taken_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [operatorUserId, customerId]
    );

    await pool.query(
      `INSERT INTO pool_actions
       (customer_id, operator_user_id, action, from_owner_user_id, to_owner_user_id, reason)
       VALUES (?, ?, 'take', ?, ?, ?)`,
      [customerId, operatorUserId, customer.owner_user_id || null, operatorUserId, "销售捞取公海客户"]
    );

    return res.json({ message: "捞取成功" });
  } catch (error) {
    console.error("[pool] 捞取客户失败:", error);
    next(error);
  }
});

// GET /api/pool/rules
poolRouter.get("/rules", async (req, res, next) => {
  try {
    const rule = await getPoolRule();
    return res.json({
      data: {
        recycleDays: rule.recycle_days,
        dailyTakeLimit: rule.daily_take_limit,
        followupRequiredHours: rule.followup_required_hours,
        grabProtectMinutes: rule.grab_protect_minutes,
        needApproval: Boolean(rule.need_approval),
      },
    });
  } catch (error) {
    console.error("[pool] 查询规则失败:", error);
    next(error);
  }
});

// PUT /api/pool/rules
poolRouter.put("/rules", async (req, res, next) => {
  try {
    const operatorUserId = req.user?.id;
    if (!operatorUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const {
      recycleDays,
      dailyTakeLimit,
      followupRequiredHours,
      grabProtectMinutes,
      needApproval,
    } = req.body as {
      recycleDays?: number;
      dailyTakeLimit?: number;
      followupRequiredHours?: number;
      grabProtectMinutes?: number;
      needApproval?: boolean;
    };

    await getPoolRule();

    await pool.query(
      `UPDATE pool_rules
       SET recycle_days = ?, daily_take_limit = ?, followup_required_hours = ?, grab_protect_minutes = ?, need_approval = ?, updated_by = ?, updated_at = NOW()
       WHERE id = 1`,
      [
        Number(recycleDays || 15),
        Number(dailyTakeLimit || 20),
        Number(followupRequiredHours || 24),
        Number(grabProtectMinutes || 30),
        needApproval ? 1 : 0,
        operatorUserId,
      ]
    );

    return res.json({ message: "公海规则已更新" });
  } catch (error) {
    console.error("[pool] 更新规则失败:", error);
    next(error);
  }
});

// POST /api/pool/recycle/run
poolRouter.post("/recycle/run", async (req, res, next) => {
  try {
    const operatorUserId = req.user?.id;
    if (!operatorUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const rule = await getPoolRule();

    const [inactiveRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, owner_user_id
       FROM customers
       WHERE pool_status = 'private'
         AND owner_user_id IS NOT NULL
         AND (
           (last_follow_up_at IS NOT NULL AND TIMESTAMPDIFF(DAY, last_follow_up_at, NOW()) >= ?)
           OR (last_follow_up_at IS NULL AND TIMESTAMPDIFF(DAY, created_at, NOW()) >= ?)
         )`,
      [rule.recycle_days, rule.recycle_days]
    );

    const [timeoutRows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.owner_user_id
       FROM customers c
       WHERE c.pool_status = 'private'
         AND c.owner_user_id IS NOT NULL
         AND c.taken_at IS NOT NULL
         AND TIMESTAMPDIFF(HOUR, c.taken_at, NOW()) >= ?
         AND NOT EXISTS (
           SELECT 1
           FROM followup_records f
           WHERE f.customer_id = c.id
             AND f.owner_user_id = c.owner_user_id
             AND f.created_at >= c.taken_at
         )`,
      [rule.followup_required_hours]
    );

    const recycledIds = new Set<number>();
    const recycleWithReason = async (
      rows: RowDataPacket[],
      reason: "auto_recycle" | "timeout_no_followup"
    ) => {
      for (const row of rows) {
        const customerId = Number(row.id);
        if (recycledIds.has(customerId)) continue;
        recycledIds.add(customerId);

        await pool.query(
          `UPDATE customers
           SET owner_user_id = NULL, pool_status = 'pool', pool_reason = ?, pooled_at = NOW(), taken_at = NULL, updated_at = NOW()
           WHERE id = ?`,
          [reason, customerId]
        );

        await pool.query(
          `INSERT INTO pool_actions
           (customer_id, operator_user_id, action, from_owner_user_id, to_owner_user_id, reason)
           VALUES (?, ?, 'recycle', ?, NULL, ?)`,
          [
            customerId,
            operatorUserId,
            row.owner_user_id ? Number(row.owner_user_id) : null,
            reason === "auto_recycle" ? "超期未跟进自动回收" : "捞取后超时未首跟进，自动退回公海",
          ]
        );
      }
    };

    await recycleWithReason(inactiveRows, "auto_recycle");
    await recycleWithReason(timeoutRows, "timeout_no_followup");

    return res.json({
      message: "回收任务执行完成",
      data: {
        recycledCount: recycledIds.size,
        byInactiveDays: inactiveRows.length,
        byTimeoutNoFollowup: timeoutRows.length,
      },
    });
  } catch (error) {
    console.error("[pool] 执行回收任务失败:", error);
    next(error);
  }
});

// POST /api/pool/to-pool
poolRouter.post("/to-pool", async (req, res, next) => {
  try {
    const operatorUserId = req.user?.id;
    if (!operatorUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const { customerId, reason } = req.body as {
      customerId?: number;
      reason?: string;
    };
    if (!customerId) {
      return res.status(400).json({ message: "customerId 必填" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, owner_user_id, pool_status FROM customers WHERE id = ? LIMIT 1",
      [customerId]
    );
    const customer = rows[0];
    if (!customer) {
      return res.status(404).json({ message: "客户不存在" });
    }

    await pool.query(
      `UPDATE customers
       SET owner_user_id = NULL, pool_status = 'pool', pool_reason = ?, pooled_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [reason || "manual", customerId]
    );

    await pool.query(
      `INSERT INTO pool_actions
       (customer_id, operator_user_id, action, from_owner_user_id, to_owner_user_id, reason)
       VALUES (?, ?, 'to_pool', ?, NULL, ?)`,
      [customerId, operatorUserId, customer.owner_user_id || null, reason || "手动转入公海"]
    );

    return res.json({ message: "已转入公海" });
  } catch (error) {
    console.error("[pool] 转入公海失败:", error);
    next(error);
  }
});

// GET /api/pool/actions?customerId=1
poolRouter.get("/actions", async (req, res, next) => {
  try {
    const { customerId, page = 1, pageSize = 20 } = req.query;
    const params: Array<string | number> = [];
    let whereClause = "WHERE 1=1";

    if (customerId) {
      whereClause += " AND pa.customer_id = ?";
      params.push(Number(customerId));
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM pool_actions pa ${whereClause}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);
    const offset = (Number(page) - 1) * Number(pageSize);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pa.*
       FROM pool_actions pa
       ${whereClause}
       ORDER BY pa.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );

    return res.json({
      data: rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.error("[pool] 查询公海操作日志失败:", error);
    next(error);
  }
});

