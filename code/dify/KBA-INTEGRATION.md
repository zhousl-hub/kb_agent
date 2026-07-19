# Dify 源码与 KBA 集成说明

本目录为从开源仓库复制的 Dify 完整源码，供本仓库统一管理与本地部署。

## 目录说明

- `api/`：Dify API（Python）
- `web/`：Dify 控制台前端
- `docker/`：官方 Docker Compose 部署配置
- `docker/docker-compose.kba.yml`：KBA 集成覆盖（接入共享网络 `kba-shared-network`，API 别名 `dify-api`）

## 与 KBA 的关系

- 不修改 Dify 官方 `docker-compose.yaml`
- KBA 后端通过 HTTP 调用 Dify Service API（`/v1/chat-messages`、`/v1/datasets/.../retrieve`）
- 默认 API 地址：`http://dify-api:5001`
- API Key 由 Dify 控制台创建应用后生成，写入仓库根目录 `docker/.env` 的 `DIFY_API_KEY`

## 启动顺序

1. 启动 KBA 基础设施（创建共享网络）：
   `docker compose -f docker/compose.dev.yml up -d`
2. 启动 Dify：
   ```bash
   cd code/dify/docker
   cp .env.example .env
   docker compose -f docker-compose.yaml -f docker-compose.kba.yml up -d
   ```
3. 浏览器打开 http://localhost/install 完成初始化
4. 创建应用并复制 API Key 到 `docker/.env`
5. 启动或重启 KBA 业务服务
