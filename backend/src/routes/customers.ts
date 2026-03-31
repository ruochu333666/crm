import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { requireAuth } from "../middleware/auth";

export const customersRouter = Router();
customersRouter.use(requireAuth);

// 获取客户列表
customersRouter.get("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const {
      page = 1,
      pageSize = 10,
      search = "",
      status = "",
      region = "",
    } = req.query;

    let whereClause = "WHERE owner_user_id = ? AND pool_status = 'private'";
    const params: Array<string | number> = [ownerUserId];

    if (search) {
      whereClause += " AND (name LIKE ? OR contact LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereClause += " AND status = ?";
      params.push(String(status));
    }

    if (region) {
      whereClause += " AND region = ?";
      params.push(String(region));
    }

    // 获取总数
    const [countResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM customers ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 获取分页数据
    const offset = (Number(page) - 1) * Number(pageSize);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );

    res.json({
      data: rows,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// 获取单个客户详情
customersRouter.get("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const { id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM customers WHERE id = ? AND owner_user_id = ? AND pool_status = 'private'",
      [id, ownerUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "客户不存在" });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// 创建客户
customersRouter.post("/", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const {
      name,
      company,
      contact,
      phone,
      email,
      region,
      status = "potential",
      industry,
      address,
      remark,
    } = req.body;

    // 验证必填字段
    if (!name || !company || !contact || !phone || !email || !region) {
      return res.status(400).json({ message: "必填字段不能为空" });
    }

    const [result] = await pool.query(
      `INSERT INTO customers 
       (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'private')`,
      [
        name,
        company,
        contact,
        phone,
        email,
        region,
        status,
        industry,
        address,
        remark,
        ownerUserId,
      ]
    );

    res.status(201).json({
      message: "创建成功",
      id: (result as any).insertId,
    });
  } catch (err) {
    next(err);
  }
});

// 更新客户
customersRouter.put("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const { id } = req.params;
    const {
      name,
      company,
      contact,
      phone,
      email,
      region,
      status,
      industry,
      address,
      remark,
    } = req.body;

    // 验证必填字段
    if (!name || !company || !contact || !phone || !email || !region) {
      return res.status(400).json({ message: "必填字段不能为空" });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE customers SET 
       name=?, company=?, contact=?, phone=?, email=?, region=?, status=?, 
       industry=?, address=?, remark=?, updated_at=NOW()
       WHERE id=? AND owner_user_id = ? AND pool_status = 'private'`,
      [
        name,
        company,
        contact,
        phone,
        email,
        region,
        status,
        industry,
        address,
        remark,
        id,
        ownerUserId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "客户不存在" });
    }

    res.json({ message: "更新成功" });
  } catch (err) {
    next(err);
  }
});

// 删除客户
customersRouter.delete("/:id", async (req, res, next) => {
  try {
    const ownerUserId = req.user?.id;
    if (!ownerUserId) {
      return res.status(401).json({ message: "未授权访问" });
    }
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM customers WHERE id = ? AND owner_user_id = ? AND pool_status = 'private'",
      [id, ownerUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "客户不存在" });
    }

    res.json({ message: "删除成功" });
  } catch (err) {
    next(err);
  }
});
