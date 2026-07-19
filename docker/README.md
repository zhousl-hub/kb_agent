# Docker 开发环境

本项目提供完整的 Docker 开发环境配置，包含 MySQL、Redis、MinIO、Keycloak、Qdrant，以及独立部署的 Dify。

## 服务概览

| 服务 | 端口 | 用途 | 默认账号 |
|------|------|------|----------|
| MySQL 8.0 | 3306 | 主数据库 | root/root123456 |
| Redis 7 | 6379 | 缓存服务 | 无密码 |
| MinIO | 9000 (API) / 9001 (Console) | 对象存储 | minioadmin/minioadmin123 |
| Keycloak | 8180 | 认证服务 | admin/admin123456 |
| Qdrant | 6333 / 6334 | 向量库 | - |
| Dify Web/API | 80（nginx） | LLM 应用平台 | 首次访问初始化 |

KBA 与 Dify 通过外部共享网络 `kba-shared-network` 互通；KBA 侧默认访问 `http://dify-api:5001`。

## 快速开始

### 1. 准备配置文件

```bash
# 复制环境变量文件
cp .env.example .env

# 根据需要修改 .env 中的配置
# 生产环境务必修改所有密码！
# 填入 DIFY_API_KEY（在 Dify 控制台创建应用后生成）
```

### 2. 启动 KBA 基础设施

```bash
# 仅基础设施
docker compose -f compose.dev.yml up -d

# 基础设施 + 微服务/前端
docker compose -f compose.dev.yml -f compose.services.yml up -d

# 查看服务状态
docker compose -f compose.dev.yml ps
```

### 3. 启动 Dify（独立 Compose）

```bash
cd ../code/dify/docker
cp .env.example .env
# 需先有共享网络：启动 compose.dev.yml 会创建 kba-shared-network
docker compose -f docker-compose.yaml -f docker-compose.kba.yml up -d
```

浏览器访问 http://localhost/install 完成 Dify 初始化，创建 Chat 应用并复制 API Key 到 `docker/.env` 的 `DIFY_API_KEY`，然后重启 `knowledge-service` 与 `ai-application-service`。

### 4. 停止服务

```bash
# 停止 KBA
docker compose -f compose.dev.yml -f compose.services.yml down

# 停止 Dify
cd ../code/dify/docker
docker compose -f docker-compose.yaml -f docker-compose.kba.yml down

# 停止并删除数据卷（慎用！）
docker compose -f compose.dev.yml down -v
```

## 服务访问

### MySQL

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
docker exec -it kba-mysql mysql -u root -p
```

### Redis

```bash
redis-cli -h 127.0.0.1 -p 6379
docker exec -it kba-redis redis-cli
```

### MinIO

- API 地址: http://localhost:9000
- 控制台: http://localhost:9001
- 默认 Access Key: `minioadmin`
- 默认 Secret Key: `minioadmin123`

### Keycloak

- 管理控制台: http://localhost:8180
- 管理员账号: `admin` / `admin123456`

### Dify

- 控制台: http://localhost/install （首次）或 http://localhost
- 容器内 API 地址（供 KBA 调用）: `http://dify-api:5001`
- 集成配置项: `DIFY_API_URL`、`DIFY_API_KEY`（见 `.env.example`）

## 初始化脚本

### MySQL 初始化

将 SQL 脚本放入 `mysql/init/` 目录，容器首次启动时会自动执行（按文件名字母顺序）。

### MinIO Bucket 初始化

`minio-init` 容器会自动创建 `kba`、`knowledge`、`dify` bucket，并设置 `public/` 目录为公开访问。

## 常见问题

### Dify API 调用失败

1. 确认 Dify 已启动且与 KBA 同属 `kba-shared-network`
2. 确认已配置非空的 `DIFY_API_KEY`
3. 容器内应使用 `http://dify-api:5001`，不要用 `host.docker.internal`（除非 Dify 跑在宿主机）

### Keycloak 启动失败

```bash
docker compose -f compose.dev.yml restart keycloak
```

### 端口被占用

```bash
# Windows
netstat -ano | findstr :3306
```

修改 `compose.dev.yml` 中的端口映射。

## 生产环境建议

1. 修改所有默认密码
2. 启用 Redis 密码认证
3. Keycloak 启用 HTTPS
4. 妥善保管 Dify API Key，按应用拆分密钥
5. 定期备份数据卷
