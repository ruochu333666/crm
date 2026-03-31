# Docker 使用指南

## 🐳 Docker 快速开始

本项目已配置完整的 Docker 支持，可以一键启动整个 CRM 系统（前端 + 后端 + MySQL）。

---

## 📋 前置要求

1. **安装 Docker Desktop**
   - Windows: https://www.docker.com/products/docker-desktop/
   - Mac: https://www.docker.com/products/docker-desktop/
   - Linux: https://docs.docker.com/engine/install/

2. **安装 Docker Compose** (Docker Desktop 已包含)

3. **确保端口可用**
   - 80: 前端服务
   - 5174: 后端服务
   - 3306: MySQL 数据库

---

## 🚀 使用方式

### 方式一: 生产环境部署

```bash
# 1. 创建环境变量文件
cp .env.example .env

# 2. 编辑 .env 文件，修改密码和密钥
nano .env

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 访问应用
# 前端: http://localhost
# 后端: http://localhost:5174/api/health
```

### 方式二: 开发环境（支持热重载）

```bash
# 启动开发环境（前端和后端都支持代码热更新）
docker-compose -f docker-compose.dev.yml up

# 或后台运行起来
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🛠️ 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# 进入容器
docker-compose exec backend sh
docker-compose exec mysql mysql -u crm_user -pcrm123 app_db

# 重新构建
docker-compose build
docker-compose up -d

# 清理所有未使用的资源
docker system prune
```

---

## 📁 Docker 配置文件说明

- **Dockerfile**: 前端生产环境镜像
- **Dockerfile.dev**: 前端开发环境镜像（支持热重载）
- **backend/Dockerfile**: 后端服务镜像
- **docker-compose.yml**: 生产环境编排
- **docker-compose.dev.yml**: 开发环境编排
- **.dockerignore**: 构建时忽略的文件
- **nginx.conf.default**: Nginx 配置

---

## 🔧 环境变量说明

在 `.env` 文件中配置以下变量：

```env
# MySQL配置
MYSQL_ROOT_PASSWORD=your_root_password      # MySQL root密码
MYSQL_DATABASE=app_db                      # 数据库名
MYSQL_USER=crm_user                        # 应用数据库用户
MYSQL_PASSWORD=your_secure_password         # 应用数据库密码

# JWT配置
JWT_SECRET=your_jwt_secret_key             # JWT密钥（生产环境必须修改）
```

---

## 🗄️ 数据持久化

MySQL 数据通过 Docker volume 持久化存储：

```bash
# 查看所有 volumes
docker volume ls

# 备份数据
docker-compose exec mysql mysqldump -u crm_user -pcrm123 app_db > backup.sql

# 恢复数据
docker-compose exec -T mysql mysql -u crm_user -pcrm123 app_db < backup.sql
```

---

## 🐛 故障排查

### 1. 容器启动失败

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs mysql
```

### 2. 数据库连接失败

```bash
# 检查MySQL是否就绪
docker-compose exec mysql mysql -u root -proot123 -e "SHOW DATABASES;"
```

### 3. 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"    # 将80改为8080
```

### 4. 前端无法访问后端

确保 nginx 配置中的代理地址正确：
```nginx
proxy_pass http://backend:5174/api/;
```

---

## 🌐 生产环境部署建议

### 1. 使用强密码
```bash
# 生成随机密码
openssl rand -base64 32
```

### 2. 修改 JWT_SECRET
```bash
# .env
JWT_SECRET=$(openssl rand -base64 32)
```

### 3. 配置HTTPS
使用 Traefik 或 Nginx 反向代理配置SSL证书

### 4. 设置资源限制
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 📊 监控和维护

```bash
# 查看资源使用情况
docker stats

# 查看容器详细信息
docker inspect crm-backend

# 查看网络
docker network ls
```

---

## 🔒 安全注意事项

1. **不要提交 .env 文件到Git**
2. **生产环境必须修改所有默认密码**
3. **使用强随机字符串作为 JWT_SECRET**
4. **定期备份数据库**
5. **限制容器权限**
6. **定期更新Docker镜像**

---

## 📚 参考链接

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 反向代理](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
