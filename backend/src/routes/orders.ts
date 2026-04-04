import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

function genOrderNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rand}`;
}

async function assertCustomerOwned(
  customerId: number,
  ownerUserId: number
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM customers WHERE id = ? AND owner_user_id = ? AND pool_status = 'private'",
    [customerId, ownerUserId]
  );
  return rows.length > 0;
}

/** GET /api/orders?customerId=&page=&pageSize=&status=&search= */
ordersRouter.get("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const customerId = req.query.customerId
      ? Number(req.query.customerId)
      : null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
    const status = req.query.status ? String(req.query.status) : "";
    const search = req.query.search ? String(req.query.search).trim() : "";

    let where =
      "WHERE o.owner_user_id = ? AND c.owner_user_id = ? AND c.pool_status = 'private'";
    const params: Array<string | number> = [ownerUserId, ownerUserId];

    if (customerId && !Number.isNaN(customerId)) {
      where += " AND o.customer_id = ?";
      params.push(customerId);
    }
    if (status) {
      where += " AND o.status = ?";
      params.push(status);
    }
    if (search) {
      where += " AND (o.order_no LIKE ? OR o.product_summary LIKE ? OR c.name LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM orders o
       INNER JOIN customers c ON c.id = o.customer_id
       ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.name AS customer_name, c.company AS customer_company
       FROM orders o
       INNER JOIN customers c ON c.id = o.customer_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return res.json({
      data: rows,
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[orders] 列表查询失败:", err);
    next(err);
  }
});

ordersRouter.get("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "无效订单 ID" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.name AS customer_name, c.company AS customer_company
       FROM orders o
       INNER JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? AND o.owner_user_id = ? AND c.pool_status = 'private'`,
      [id, ownerUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "订单不存在" });
    }
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error("[orders] 单条查询失败:", err);
    next(err);
  }
});

ordersRouter.post("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }

    const body = req.body as Record<string, unknown>;
    const customerId = Number(body.customerId);
    const productSummary = String(body.productSummary ?? "").trim();
    const amount = body.amount != null ? Number(body.amount) : 0;
    const currency = String(body.currency ?? "CNY").slice(0, 8) || "CNY";
    const incoterms = body.incoterms != null ? String(body.incoterms).slice(0, 64) : null;
    const shippingMethod =
      body.shippingMethod != null ? String(body.shippingMethod).slice(0, 64) : null;
    const logisticsNo =
      body.logisticsNo != null ? String(body.logisticsNo).slice(0, 128) : null;
    const depositAmount =
      body.depositAmount != null && body.depositAmount !== ""
        ? Number(body.depositAmount)
        : null;
    const balanceAmount =
      body.balanceAmount != null && body.balanceAmount !== ""
        ? Number(body.balanceAmount)
        : null;
    const status = String(body.status ?? "pending").slice(0, 32) || "pending";
    const orderedAt = body.orderedAt != null ? String(body.orderedAt) : null;
    const expectedShipAt =
      body.expectedShipAt != null ? String(body.expectedShipAt) : null;
    const shippedAt = body.shippedAt != null ? String(body.shippedAt) : null;
    const remark = body.remark != null ? String(body.remark) : null;
    let orderNo = body.orderNo != null ? String(body.orderNo).trim().slice(0, 40) : "";

    if (!customerId || Number.isNaN(customerId)) {
      return res.status(400).json({ message: "customerId 必填" });
    }
    if (!productSummary) {
      return res.status(400).json({ message: "productSummary 必填" });
    }

    const ok = await assertCustomerOwned(customerId, ownerUserId);
    if (!ok) {
      return res.status(404).json({ message: "客户不存在或无权操作" });
    }

    if (!orderNo) {
      orderNo = genOrderNo();
    }

    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO orders
       (customer_id, owner_user_id, order_no, product_summary, amount, currency,
        incoterms, shipping_method, logistics_no, deposit_amount, balance_amount,
        status, ordered_at, expected_ship_at, shipped_at, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        ownerUserId,
        orderNo,
        productSummary,
        amount,
        currency,
        incoterms,
        shippingMethod,
        logisticsNo,
        depositAmount,
        balanceAmount,
        status,
        orderedAt,
        expectedShipAt,
        shippedAt,
        remark,
      ]
    );

    return res.status(201).json({
      message: "创建订单成功",
      id: insertResult.insertId,
      orderNo,
    });
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
    if (code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "订单编号已存在，请更换或留空自动生成" });
    }
    console.error("[orders] 创建失败:", err);
    next(err);
  }
});

ordersRouter.patch("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "无效订单 ID" });
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT o.id, o.customer_id FROM orders o
       INNER JOIN customers c ON c.id = o.customer_id
       WHERE o.id = ? AND o.owner_user_id = ? AND c.pool_status = 'private'`,
      [id, ownerUserId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "订单不存在" });
    }

    const body = req.body as Record<string, unknown>;
    const updates: string[] = [];
    const values: Array<string | number | null> = [];

    const push = (col: string, val: string | number | null) => {
      updates.push(`${col} = ?`);
      values.push(val);
    };

    if (body.productSummary !== undefined) {
      const v = String(body.productSummary).trim();
      if (!v) return res.status(400).json({ message: "productSummary 不能为空" });
      push("product_summary", v);
    }
    if (body.amount !== undefined) push("amount", Number(body.amount));
    if (body.currency !== undefined) push("currency", String(body.currency).slice(0, 8));
    if (body.incoterms !== undefined) push("incoterms", body.incoterms == null ? null : String(body.incoterms).slice(0, 64));
    if (body.shippingMethod !== undefined)
      push("shipping_method", body.shippingMethod == null ? null : String(body.shippingMethod).slice(0, 64));
    if (body.logisticsNo !== undefined)
      push("logistics_no", body.logisticsNo == null ? null : String(body.logisticsNo).slice(0, 128));
    if (body.depositAmount !== undefined)
      push(
        "deposit_amount",
        body.depositAmount === null || body.depositAmount === ""
          ? null
          : Number(body.depositAmount)
      );
    if (body.balanceAmount !== undefined)
      push(
        "balance_amount",
        body.balanceAmount === null || body.balanceAmount === ""
          ? null
          : Number(body.balanceAmount)
      );
    if (body.status !== undefined) push("status", String(body.status).slice(0, 32));
    if (body.orderedAt !== undefined)
      push("ordered_at", body.orderedAt == null ? null : String(body.orderedAt));
    if (body.expectedShipAt !== undefined)
      push("expected_ship_at", body.expectedShipAt == null ? null : String(body.expectedShipAt));
    if (body.shippedAt !== undefined)
      push("shipped_at", body.shippedAt == null ? null : String(body.shippedAt));
    if (body.remark !== undefined) push("remark", body.remark == null ? null : String(body.remark));

    if (body.customerId !== undefined) {
      const newCid = Number(body.customerId);
      if (Number.isNaN(newCid)) {
        return res.status(400).json({ message: "无效 customerId" });
      }
      const owned = await assertCustomerOwned(newCid, ownerUserId);
      if (!owned) {
        return res.status(404).json({ message: "客户不存在或无权操作" });
      }
      push("customer_id", newCid);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "无更新字段" });
    }

    updates.push("updated_at = NOW()");
    values.push(id, ownerUserId);

    await pool.query(`UPDATE orders SET ${updates.join(", ")} WHERE id = ? AND owner_user_id = ?`, values);

    return res.json({ message: "更新成功" });
  } catch (err) {
    console.error("[orders] 更新失败:", err);
    next(err);
  }
});

ordersRouter.delete("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "无效订单 ID" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM orders WHERE id = ? AND owner_user_id = ?",
      [id, ownerUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "订单不存在" });
    }
    return res.json({ message: "已删除" });
  } catch (err) {
    console.error("[orders] 删除失败:", err);
    next(err);
  }
});
