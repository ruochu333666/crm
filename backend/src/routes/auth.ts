import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";

export const authRouter = Router();

// POST /api/auth/register
authRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      return res.status(400).json({ message: "username 和 password 必填" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(1) as count FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    const exists = (rows[0] as any)?.count > 0;
    if (exists) {
      return res.status(409).json({ message: "用户名已存在" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, NOW())",
      [username, passwordHash]
    );

    return res.status(201).json({ message: "注册成功" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };
    if (!username || !password) {
      return res.status(400).json({ message: "username 和 password 必填" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const secret = process.env.JWT_SECRET || "dev_secret";
    const token = jwt.sign({ sub: user.id, username: user.username }, secret, {
      expiresIn: "7d",
    });

    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    next(err);
  }
});
