# Docker 开发环境

本项目提供完整的 Docker 开发环境配置，包含 MySQL、Redis、MinIO 和 Keycloak 服务。

## 服务概览

| 服务 | 端口 | 用途 | 默认账号 |
|------|------|------|----------|
| MySQL 8.0 | 3306 | 主数据库 | root/root123456 |
| Redis 7 | 6379 | 缓存服务 | 无密码 |
| MinIO | 9000 (API) / 9001 (Console) | 对象存储 | minioadmin/minioadmin123 |
| Keycloak | 8081 | 认证服务 | admin/admin123456 |

## 快速开始

### 1. 准备配置文件

```bash
# 复制环境变量文件
cp .env.example .env

# 根据需要修改 .env 中的配置
# 生产环境务必修改所有密码！
```

### 2. 创建必要的目录结构

```bash
mkdir -p mysql/init mysql/conf.d redis
```

### 3. 创建 MySQL 配置文件

创建 `mysql/conf.d/my.cnf`:

```ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_connections=500
innodb_buffer_pool_size=256M
```

### 4. 创建 Redis 配置文件

创建 `redis/redis.conf`:

```conf
bind 0.0.0.0
protected-mode no
port 6379
# requirepass redis123456
appendonly yes
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 5. 启动服务

```bash
# 启动所有服务
docker compose -f compose.dev.yml up -d

# 查看服务状态
docker compose -f compose.dev.yml ps

# 查看日志
docker compose -f compose.dev.yml logs -f [service_name]
```

### 6. 停止服务

```bash
# 停止所有服务
docker compose -f compose.dev.yml down

# 停止并删除数据卷（慎用！）
docker compose -f compose.dev.yml down -v
```

## 服务访问

### MySQL

```bash
# 命令行连接
mysql -h 127.0.0.1 -P 3306 -u root -p

# 或使用 Docker
docker exec -it kba-mysql mysql -u root -p
```

### Redis

```bash
# 命令行连接
redis-cli -h 127.0.0.1 -p 6379

# 或使用 Docker
docker exec -it kba-redis redis-cli
```

### MinIO

- API 地址: http://localhost:9000
- 控制台: http://localhost:9001
- 默认 Access Key: `minioadmin`
- 默认 Secret Key: `minioadmin123`

```bash
# 使用 mc 客户端
mc alias set local http://localhost:9000 minioadmin minioadmin123
mc ls local
```

### Keycloak

- 管理控制台: http://localhost:8081
- 管理员账号: `admin` / `admin123456`

首次访问需要创建 Realm 和 Client。

## 初始化脚本

### MySQL 初始化

将 SQL 脚本放入 `mysql/init/` 目录，容器首次启动时会自动执行（按文件名字母顺序）。

示例 `mysql/init/01-init.sql`:

```sql
CREATE DATABASE IF NOT EXISTS kba DEFAULT CHARACTER SET utf8mb4;
USE kba;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MinIO Bucket 初始化

`minio-init` 容器会自动创建 `kba` bucket，并设置 `public/` 目录为公开访问。

## 常见问题

### Keycloak 启动失败

Keycloak 依赖 MySQL，确保 MySQL 完全启动后再启动 Keycloak：

```bash
# 单独重启 Keycloak
docker compose -f compose.dev.yml restart keycloak
```

### 端口被占用

检查端口占用情况：

```bash
# Windows
netstat -ano | findstr :3306

# Linux/Mac
lsof -i :3306
```

修改 `compose.dev.yml` 中的端口映射。

### 数据持久化

数据存储在 Docker volumes 中：

```bash
# 查看卷
docker volume ls

# 查看卷详情
docker volume inspect docker_mysql_data
```

## 生产环境建议

1. **修改所有默认密码**
2. **启用 Redis 密码认证**
3. **配置 MySQL 远程访问限制**
4. **Keycloak 启用 HTTPS**
5. **MinIO 配置分布式模式**
6. **定期备份数据卷**

## 备份与恢复

### MySQL 备份

```bash
docker exec kba-mysql mysqldump -u root -p[root_password] kba > backup.sql
```

### MySQL 恢复

```bash
docker exec -i kba-mysql mysql -u root -p[root_password] kba < backup.sql
```

### Redis 备份

```bash
docker exec kba-redis redis-cli BGSAVE
docker cp kba-redis:/data/dump.rdb ./redis_backup.rdb
```

### MinIO 备份

```bash
mc mirror local/kba ./minio_backup
```