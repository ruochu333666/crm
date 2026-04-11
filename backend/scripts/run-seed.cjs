/**
 * 在 Windows/macOS 上执行 seed_demo_data.sql（不依赖 mysql 命令行在 PATH 中）
 * 用法：在 backend 目录执行  npm run seed
 */
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const sqlPath = path.join(__dirname, "..", "seed_demo_data.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("找不到文件:", sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, "utf8");

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME || "app_db",
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    console.log("演示数据导入完成。请用 demo / demo123 登录（若你自建了 demo 账号，数据会归在该用户下）。");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("导入失败:", err.message);
  process.exit(1);
});
