import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const opportunitiesRouter = Router();
opportunitiesRouter.use(requireAuth);

type Role = "sales" | "manager" | "admin";
const allowedStages = [
  "prospecting",
  "requirements",
  "quotation",
  "negotiation",
  "won",
  "lost",
];

function isAllowedStage(stage: unknown): stage is string {
  return typeof stage === "string" && allowedStages.includes(stage);
}

opportunitiesRouter.get("/", async (req, res, next) => {
  try {
    const { role, teamId, id: ownerUserId } = req.user as {
      role?: Role;
      teamId?: number;
      id: number;
    };

    const stage = (req.query.stage as string | undefined) || "";
    const search = (req.query.search as string | undefined) || "";
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(
      Math.max(Number(req.query.pageSize || 20), 1),
      100
    );

    let whereClause = "WHERE 1=1";
    const params: Array<number | string> = [];

    if (role === "sales") {
      whereClause += " AND o.owner_user_id = ? ";
      params.push(ownerUserId);
    } else if (role === "manager") {
      whereClause += " AND o.team_id = ? ";
      params.push(teamId || 1);
    }

    if (stage) {
      whereClause += " AND o.stage = ?";
      params.push(stage);
    }

    if (search) {
      whereClause += " AND (o.title LIKE ? OR c.name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM opportunities o
       LEFT JOIN customers c ON c.id = o.customer_id
       ${whereClause}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         o.id,
         o.customer_id,
         o.owner_user_id,
         o.team_id,
         o.stage,
         o.title,
         o.estimated_amount,
         o.currency,
         o.expected_close_at,
         o.loss_reason,
         o.created_at,
         o.updated_at,
         c.name AS customer_name,
         u.username AS owner_username
       FROM opportunities o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u ON u.id = o.owner_user_id
       ${whereClause}
       ORDER BY o.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      data: rows,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("[opportunities] 查询失败:", error);
    next(error);
  }
});

// POST /api/opportunities
opportunitiesRouter.post("/", async (req, res, next) => {
  try {
    const { role, teamId, id } = req.user as {
      role?: Role;
      teamId?: number;
      id: number;
    };

    if (role !== "sales" && role !== "admin") {
      return res.status(403).json({ message: "无权限创建商机" });
    }

    const {
      customerId,
      title,
      estimatedAmount,
      expectedCloseAt,
    } = req.body as {
      customerId?: number;
      title?: string;
      estimatedAmount?: number;
      expectedCloseAt?: string | null;
    };

    if (!customerId || !title) {
      return res.status(400).json({ message: "customerId/title 必填" });
    }

    // 强制销售只能用自己的私海客户创建
    const [customerRows] = await pool.query<RowDataPacket[]>(
      `SELECT id
       FROM customers
       WHERE id = ?
         AND owner_user_id = ?
         AND pool_status = 'private'
       LIMIT 1`,
      [customerId, id]
    );
    if (!customerRows[0]) {
      return res.status(400).json({ message: "客户不存在或不在你的私海" });
    }

    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO opportunities
       (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, created_at, updated_at)
       VALUES (?, ?, ?, 'prospecting', ?, ?, 'CNY', ?, NOW(), NOW())`,
      [
        customerId,
        id,
        teamId || 1,
        title,
        typeof estimatedAmount === "number" ? estimatedAmount : null,
        expectedCloseAt || null,
      ]
    );

    res.status(201).json({ message: "商机创建成功", id: insertResult.insertId });
  } catch (error) {
    console.error("[opportunities] 创建失败:", error);
    next(error);
  }
});

// POST /api/opportunities/:id/stage-change
opportunitiesRouter.post("/:id/stage-change", async (req, res, next) => {
  try {
    const { role, id: userId } = req.user as { role?: Role; id: number };
    if (role !== "sales" && role !== "admin") {
      return res.status(403).json({ message: "无权限发起阶段变更申请" });
    }

    const opportunityId = Number(req.params.id);
    const { toStage, reason } = req.body as {
      toStage?: string;
      reason?: string;
    };

    if (!opportunityId || Number.isNaN(opportunityId)) {
      return res.status(400).json({ message: "opportunity id 无效" });
    }
    if (!toStage || !isAllowedStage(toStage)) {
      return res.status(400).json({ message: "toStage 无效" });
    }
    if (!reason) {
      return res.status(400).json({ message: "reason 必填" });
    }

    const [oppRows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.name AS customer_name
       FROM opportunities o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ?
       LIMIT 1`,
      [opportunityId]
    );
    const opportunity = oppRows[0];
    if (!opportunity) {
      return res.status(404).json({ message: "商机不存在" });
    }

    if (role === "sales" && Number(opportunity.owner_user_id) !== userId) {
      return res.status(403).json({ message: "只能对自己的商机发起申请" });
    }

    const [pendingRows] = await pool.query<RowDataPacket[]>(
      `SELECT id
       FROM opportunity_stage_requests
       WHERE opportunity_id = ? AND status = 'pending'
       LIMIT 1`,
      [opportunityId]
    );
    if (pendingRows[0]) {
      return res.status(400).json({ message: "该商机已有待审批的阶段变更申请" });
    }

    await pool.query(
      `INSERT INTO opportunity_stage_requests
       (opportunity_id, from_stage, to_stage, requested_by_user_id, status, reason)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [opportunityId, opportunity.stage, toStage, userId, reason]
    );

    await pool.query(
      `INSERT INTO opportunity_actions
       (opportunity_id, operator_user_id, action, from_stage, to_stage, reason, created_at)
       VALUES (?, ?, 'stage_request_created', ?, ?, ?, NOW())`,
      [opportunityId, userId, opportunity.stage, toStage, reason]
    );

    res.json({ message: "阶段变更申请已提交" });
  } catch (error) {
    console.error("[opportunities] 提交阶段申请失败:", error);
    next(error);
  }
});

// GET /api/opportunities/stage-requests?status=pending&page=&pageSize=
opportunitiesRouter.get("/stage-requests", async (req, res, next) => {
  try {
    const { role, id: userId, teamId } = req.user as {
      role?: Role;
      id: number;
      teamId?: number;
    };

    if (role !== "manager" && role !== "admin") {
      return res.status(403).json({ message: "无权限查看待审批" });
    }

    const status = (req.query.status as string | undefined) || "pending";
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);
    const offset = (page - 1) * pageSize;

    let whereClause = "WHERE r.status = ?";
    const params: Array<number | string> = [status];
    if (role === "manager") {
      whereClause += " AND o.team_id = ?";
      params.push(teamId || 1);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total
       FROM opportunity_stage_requests r
       INNER JOIN opportunities o ON o.id = r.opportunity_id
       ${whereClause}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         r.id,
         r.opportunity_id,
         o.title AS opportunity_title,
         c.name AS customer_name,
         r.from_stage,
         r.to_stage,
         r.status,
         r.reason,
         r.reject_reason,
         r.requested_at,
         r.approved_at,
         u.username AS requested_by_username
       FROM opportunity_stage_requests r
       INNER JOIN opportunities o ON o.id = r.opportunity_id
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN users u ON u.id = r.requested_by_user_id
       ${whereClause}
       ORDER BY r.requested_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ data: rows, total, page, pageSize });
  } catch (error) {
    console.error("[opportunities] 查询阶段申请失败:", error);
    next(error);
  }
});

opportunitiesRouter.put("/stage-requests/:id/approve", async (req, res, next) => {
  try {
    const { role, id: userId, teamId } = req.user as {
      role?: Role;
      id: number;
      teamId?: number;
    };
    if (role !== "manager" && role !== "admin") {
      return res.status(403).json({ message: "无权限审批" });
    }

    const requestId = Number(req.params.id);
    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ message: "request id 无效" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, o.team_id
       FROM opportunity_stage_requests r
       INNER JOIN opportunities o ON o.id = r.opportunity_id
       WHERE r.id = ? AND r.status = 'pending'
       LIMIT 1`,
      [requestId]
    );
    const reqRow = rows[0];
    if (!reqRow) {
      return res.status(404).json({ message: "申请不存在或已处理" });
    }

    if (role === "manager" && Number(reqRow.team_id) !== Number(teamId || 1)) {
      return res.status(403).json({ message: "不能审批其他团队申请" });
    }

    const toStage = reqRow.to_stage as string;
    if (!isAllowedStage(toStage)) {
      return res.status(400).json({ message: "toStage 无效" });
    }

    await pool.query(
      `UPDATE opportunity_stage_requests
       SET status = 'approved', approved_by_user_id = ?, approved_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [userId, requestId]
    );

    await pool.query(
      `UPDATE opportunities
       SET stage = ?, updated_at = NOW()
       WHERE id = ?`,
      [toStage, reqRow.opportunity_id]
    );

    await pool.query(
      `INSERT INTO opportunity_actions
       (opportunity_id, operator_user_id, action, from_stage, to_stage, reason, created_at)
       VALUES (?, ?, 'stage_change_approved', ?, ?, ?, NOW())`,
      [reqRow.opportunity_id, userId, reqRow.from_stage, reqRow.to_stage, reqRow.reason]
    );

    res.json({ message: "审批通过" });
  } catch (error) {
    console.error("[opportunities] 审批通过失败:", error);
    next(error);
  }
});

opportunitiesRouter.put("/stage-requests/:id/reject", async (req, res, next) => {
  try {
    const { role, id: userId, teamId } = req.user as {
      role?: Role;
      id: number;
      teamId?: number;
    };
    if (role !== "manager" && role !== "admin") {
      return res.status(403).json({ message: "无权限审批" });
    }

    const requestId = Number(req.params.id);
    const { rejectReason } = req.body as { rejectReason?: string };

    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ message: "request id 无效" });
    }
    if (!rejectReason) {
      return res.status(400).json({ message: "rejectReason 必填" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, o.team_id
       FROM opportunity_stage_requests r
       INNER JOIN opportunities o ON o.id = r.opportunity_id
       WHERE r.id = ? AND r.status = 'pending'
       LIMIT 1`,
      [requestId]
    );
    const reqRow = rows[0];
    if (!reqRow) {
      return res.status(404).json({ message: "申请不存在或已处理" });
    }

    if (role === "manager" && Number(reqRow.team_id) !== Number(teamId || 1)) {
      return res.status(403).json({ message: "不能审批其他团队申请" });
    }

    await pool.query(
      `UPDATE opportunity_stage_requests
       SET status = 'rejected',
           reject_reason = ?, approved_by_user_id = ?, approved_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [rejectReason, userId, requestId]
    );

    await pool.query(
      `INSERT INTO opportunity_actions
       (opportunity_id, operator_user_id, action, from_stage, to_stage, reason, created_at)
       VALUES (?, ?, 'stage_change_rejected', ?, ?, ?, NOW())`,
      [reqRow.opportunity_id, userId, reqRow.from_stage, reqRow.to_stage, rejectReason]
    );

    res.json({ message: "审批驳回" });
  } catch (error) {
    console.error("[opportunities] 审批驳回失败:", error);
    next(error);
  }
});

