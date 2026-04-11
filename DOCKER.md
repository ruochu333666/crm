# Docker 使用指南

## 目录结构

Docker 配置现在统一放在 `docker/` 下：

```text
docker/
  dev/
    compose.yml
    Dockerfile.frontend
    Dockerfile.backend
  prod/
    compose.yml
    Dockerfile.frontend
    Dockerfile.backend
    nginx.conf
```

## 开发环境

复制环境变量并启动：

```bash
cp .env.docker .env
docker compose -f docker/dev/compose.yml up -d --build
```

查看日志：

```bash
docker compose -f docker/dev/compose.yml logs -f
```

停止服务：

```bash
docker compose -f docker/dev/compose.yml down
```

开发环境端口：

- `5173`: 前端 Vite
- `5174`: 后端 API
- `3307`: MySQL 宿主机端口

## 生产环境

先准备生产环境变量：

```bash
cp .env.prod.example .env.prod
```

部署：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml up -d --build
```

生产环境默认只暴露前端端口：

- `80`: 前端和 `/api` 反向代理入口

停止生产环境：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml down
```

## 环境变量

开发环境使用 `.env.docker`，生产环境使用 `.env.prod`。

开发环境关键字段：

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

生产环境关键字段：

```env
MYSQL_ROOT_PASSWORD=strong-root-password
MYSQL_DATABASE=app_db
MYSQL_USER=crm_user
MYSQL_PASSWORD=strong-db-password

DB_USER=crm_user
DB_PASSWORD=strong-db-password
DB_NAME=app_db

JWT_SECRET=very-long-random-secret
VITE_API_BASE=/api
APP_PORT=80
```

## 说明

- 开发环境保留源码挂载和热更新。
- 生产环境前端使用 Nginx 提供静态文件，并反代 `/api` 到后端。
- 生产环境后端使用编译后的 `dist` 启动，不再使用 `ts-node-dev`。
