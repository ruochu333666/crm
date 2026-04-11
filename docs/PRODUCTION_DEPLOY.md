# 生产环境部署说明

本文基于当前仓库的 `docker/prod/` 配置，说明如何把项目部署到 Linux 服务器。

## 1. 服务器要求

- Ubuntu 22.04 或其他常见 Linux 发行版
- 至少 2 核 CPU
- 至少 4 GB 内存
- 已安装 Docker 和 Docker Compose
- 已有域名，并已解析到服务器公网 IP

## 2. 服务器初始化

安装 Docker：

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

开放端口：

- `80`
- `443`

如果启用了防火墙，例如 `ufw`：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

不建议把 MySQL `3306` 对公网开放。

## 3. 上传代码

方式一，直接在服务器拉代码：

```bash
git clone <your-repo-url>
cd crm
```

方式二，把本地代码上传到服务器后进入项目目录。

## 4. 配置生产环境变量

复制生产环境模板：

```bash
cp .env.prod.example .env.prod
```

编辑 `.env.prod`：

```env
MYSQL_ROOT_PASSWORD=your-root-password
MYSQL_DATABASE=app_db
MYSQL_USER=crm_user
MYSQL_PASSWORD=your-db-password

DB_USER=crm_user
DB_PASSWORD=your-db-password
DB_NAME=app_db

JWT_SECRET=your-long-random-secret

AI_ENABLED=true
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_API_KEY=your-api-key
AI_MODEL=your-model-id
AI_TIMEOUT_MS=20000
AI_PROTOCOL=openai

VITE_API_BASE=/api
APP_PORT=80
```

要求：

- `MYSQL_ROOT_PASSWORD` 和 `MYSQL_PASSWORD` 使用强密码
- `JWT_SECRET` 使用至少 32 位随机字符串
- `VITE_API_BASE` 保持 `/api`

生成随机密钥：

```bash
openssl rand -base64 32
```

## 5. 启动生产环境

在项目根目录执行：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml up -d --build
```

查看状态：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml ps
```

查看日志：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml logs -f
```

此时默认访问：

- `http://你的服务器IP/`
- `http://你的服务器IP/api/health`

## 6. 域名配置

到你的域名服务商后台添加解析：

- `A` 记录
- 主机记录：`@`
- 记录值：你的服务器公网 IP

如果还要 `www`：

- `A` 记录或 `CNAME`
- 主机记录：`www`

等 DNS 生效后再配置 HTTPS。

## 7. HTTPS 配置

当前 `docker/prod` 已经内置了前端 Nginx，但它只监听容器内 `80`，不负责自动签发证书。

更稳妥的上线方式有两种：

### 方式一：服务器外层再加一个 Nginx

外层 Nginx 负责：

- 监听 `80` 和 `443`
- 配置证书
- 反向代理到 Docker 应用端口

这种方式适合传统 Linux 运维。

### 方式二：使用 Caddy 或 Nginx Proxy Manager

优点：

- 自动申请和续期 HTTPS 证书
- 配置更省事

如果你想省事，推荐 Caddy。

## 8. 使用 Caddy 做 HTTPS

如果你选择 Caddy，可以在服务器上单独安装 Caddy，然后把域名流量转发到当前应用。

示例 `Caddyfile`：

```caddy
your-domain.com {
    encode gzip
    reverse_proxy 127.0.0.1:80
}
```

如果你把应用端口改成别的，比如 `APP_PORT=8080`，就改成：

```caddy
your-domain.com {
    encode gzip
    reverse_proxy 127.0.0.1:8080
}
```

## 9. 更新部署

以后更新代码：

```bash
git pull
docker compose --env-file .env.prod -f docker/prod/compose.yml up -d --build
```

## 10. 停止和重启

停止：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml down
```

重启：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml restart
```

## 11. 备份数据库

备份：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > backup.sql
```

恢复时请先确认目标库和密码配置正确。

## 12. 故障排查

查看容器状态：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml ps
```

查看后端日志：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml logs -f backend
```

查看前端日志：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml logs -f frontend
```

查看数据库日志：

```bash
docker compose --env-file .env.prod -f docker/prod/compose.yml logs -f mysql
```

健康检查验证：

```bash
curl http://127.0.0.1/api/health
```

如果你把 `APP_PORT` 改成了别的端口，例如 `8080`，改成：

```bash
curl http://127.0.0.1:8080/api/health
```

## 13. 当前生产方案的边界

这套配置适合：

- 单机部署
- 中小流量
- 快速上线

这套配置暂时没有覆盖：

- 多机高可用
- 独立托管数据库
- 自动 CI/CD 发布
- 完整监控告警

如果后面你要上正式服务器，我建议下一步再补：

- 外层 HTTPS 反向代理配置
- 自动备份脚本
- systemd 或 CI/CD 发布脚本
