import { Router } from "express";
import { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const statsRouter = Router();
statsRouter.use(requireAuth);

type Role = "sales" | "manager" | "admin";

function getScopeWhere(
  role: Role | undefined,
  userId: number,
  teamId: number | undefined,
  userIdField: string
): { clause: string; params: Array<number> } {
  if (role === "sales") {
    return { clause: ` AND ${userIdField} = ?`, params: [userId] };
  }
  if (role === "manager") {
    return {
      clause: ` AND ${userIdField} IN (SELECT id FROM users WHERE team_id = ?)`,
      params: [teamId || 1],
    };
  }
  return { clause: "", params: [] };
}

// GET /api/stats/dashboard?range=7
statsRouter.get("/dashboard", async (req, res, next) => {
  try {
    const user = req.user as {
      id: number;
      role?: Role;
      teamId?: number;
    };
    const rangeDays = Math.min(Math.max(Number(req.query.range || 7), 1), 90);

    const taskScope = getScopeWhere(
      user.role,
      user.id,
      user.teamId,
      "t.owner_user_id"
    );
    const followScope = getScopeWhere(
      user.role,
      user.id,
      user.teamId,
      "f.owner_user_id"
    );

    const [taskRows] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(t.done_at) AS d, COUNT(*) AS completed
       FROM tasks t
       WHERE t.status = 'done'
         AND t.done_at IS NOT NULL
         AND t.done_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ${taskScope.clause}
       GROUP BY DATE(t.done_at)
       ORDER BY d`,
      [rangeDays, ...taskScope.params]
    );

    const [followRows] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(f.created_at) AS d, COUNT(*) AS cnt
       FROM followup_records f
       WHERE f.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ${followScope.clause}
       GROUP BY DATE(f.created_at)
       ORDER BY d`,
      [rangeDays, ...followScope.params]
    );

    return res.json({
      taskTrend: taskRows.map((r) => ({
        date: r.d,
        completedTasks: Number(r.completed || 0),
      })),
      followupTrend: followRows.map((r) => ({
        date: r.d,
        followups: Number(r.cnt || 0),
      })),
    });
  } catch (error) {
    console.error("[stats] dashboard 统计失败:", error);
    next(error);
  }
});

// GET /api/stats/pool?range=30
statsRouter.get("/pool", async (req, res, next) => {
  try {
    const user = req.user as {
      id: number;
      role?: Role;
      teamId?: number;
    };
    const rangeDays = Math.min(Math.max(Number(req.query.range || 30), 1), 365);

    const scope = getScopeWhere(
      user.role,
      user.id,
      user.teamId,
      "pa.operator_user_id"
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT pa.action, COUNT(*) AS cnt
       FROM pool_actions pa
       WHERE pa.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ${scope.clause}
       GROUP BY pa.action`,
      [rangeDays, ...scope.params]
    );

    return res.json({
      summary: rows.map((r) => ({
        action: String(r.action),
        count: Number(r.cnt || 0),
      })),
    });
  } catch (error) {
    console.error("[stats] pool 统计失败:", error);
    next(error);
  }
});

