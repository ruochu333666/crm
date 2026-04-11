# Docker 使用指南

## 快速开始

项目现在可以通过一个 `docker compose up` 同时启动：

- MySQL
- 后端服务 `http://localhost:5174`
- 前端开发服务 `http://localhost:5173`

## 使用方式

```bash
cp .env.docker .env
docker compose up --build
```

后台运行：

```bash
docker compose up -d --build
```

查看日志：

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

停止服务：

```bash
docker compose down
```

删除容器和数据卷：

```bash
docker compose down -v
```

## 端口说明

- `5173`: 前端 Vite
- `5174`: 后端 API
- `3307`: MySQL 宿主机端口

## 配置文件

- `Dockerfile`: 前端开发镜像
- `backend/Dockerfile`: 后端开发镜像
- `docker-compose.yml`: 前后端和 MySQL 的统一编排
- `.env.docker`: Docker 默认环境变量模板

## 环境变量

至少关注这些字段：

```env
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=app_db
MYSQL_USER=crm_user
MYSQL_PASSWORD=crm123
MYSQL_PORT=3307

HOST=0.0.0.0
PORT=5174
DB_HOST=mysql
DB_PORT=3306
DB_USER=crm_user
DB_PASSWORD=crm123
DB_NAME=app_db

VITE_API_BASE=http://localhost:5174/api
JWT_SECRET=change-me
```

## 说明

- 前端和后端都使用源码挂载，改代码后容器内会直接生效。
- `backend` 会等待 `mysql` 健康检查通过后再启动。
- `frontend` 会等待 `backend` 健康检查通过后再启动。
