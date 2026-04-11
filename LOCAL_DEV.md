# 本地开发环境运行指南

## 快速启动

### 1. 启动 MySQL 数据库
```bash
docker-compose up -d
```

### 2. 启动后端服务
```bash
cd backend
npm install
npm run dev
```

### 3. 启动前端服务（新终端）
```bash
npm install
npm run dev
```

## 访问地址

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:5174/api
- **MySQL**: localhost:3306

## 常用命令

```bash
# 启动 MySQL
docker-compose up -d

# 停止 MySQL
docker-compose down

# 查看 MySQL 日志
docker-compose logs -f mysql

# 连接到 MySQL
docker exec -it crm-mysql mysql -u root -proot123
```

## 环境配置

后端配置文件：`backend/.env`

前端配置文件：`.env.development`
