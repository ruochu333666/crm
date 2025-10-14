# Backend - Node.js + Express + MySQL

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置数据库

在 MySQL 中运行 `init.sql` 初始化数据库和表：

```bash
mysql -u root -p < init.sql
```

### 3. 配置环境变量

编辑 `.env` 文件，填写你的数据库密码等信息

### 4. 启动开发服务器

```bash
pnpm dev
```

服务将在 http://localhost:5174 启动

## API 接口

### 健康检查

- `GET /api/health` - 返回服务状态

### 认证相关

- `POST /api/auth/register` - 用户注册
  ```json
  { "username": "test", "password": "123456" }
  ```
- `POST /api/auth/login` - 用户登录
  ```json
  { "username": "test", "password": "123456" }
  ```
  返回 JWT token 和用户信息

## 技术栈

- Express - Web 框架
- TypeScript - 类型安全
- MySQL2 - 数据库驱动
- bcryptjs - 密码加密
- jsonwebtoken - JWT 认证

