# KBA 企业级知识管理平台

KBA 是一个面向企业知识管理与 AI 应用的单仓库项目，包含知识库管理、文档与数据源管理、知识检索、AI 助手、会话管理、权限管理、文件服务、通知和运维监控等能力。

项目由 KBA 业务系统和内置的 Dify 源码组成。当前 AI 对话与知识检索由 KBA 后端调用 Dify Service API 完成。

## 项目状态

当前仓库处于开发阶段，主要业务模块和页面已具备基础实现，但以下能力尚未完整落地：

- 文档切分、向量化及完整处理流水线仍在开发中。
- WeKnora 仅出现在设计资料中，当前业务代码未实际接入。
- Qdrant 已包含在开发环境中，但 KBA 后端暂未调用。
- Keycloak 已包含在 Docker 环境中，本地登录目前主要使用用户表和 Sa-Token。
- 管理端及用户端的部分页面或接口仍使用模拟数据。
- `compose.services.yml` 引用的 KBA 服务 Dockerfile 当前不存在，暂不能直接通过该文件构建全部业务服务。

## 技术栈

### 后端

- Java 17
- Spring Boot 3.2.5
- Spring Cloud 2023.0.1
- Spring Cloud Alibaba、Nacos、Spring Cloud Gateway
- MyBatis-Plus 3.5.7
- Sa-Token 1.39.0
- MySQL 8、Redis 7、MinIO
- Maven 多模块工程

### 前端

- Vue 3、TypeScript、Vite
- Vue Router、Pinia、Axios
- Element Plus、Vant、Tailwind CSS
- ECharts

### AI 平台

仓库内置 Dify 1.13.0 源码：

- API：Python 3.11～3.12、Flask、SQLAlchemy、Celery
- Web：Next.js、React、TypeScript、pnpm

## 目录结构

```text
kb_agent/
├── code/
│   ├── backend/                 # KBA Java 微服务
│   ├── frontend/
│   │   ├── portal-web/          # 统一入口与登录门户
│   │   ├── admin-web/           # 管理端
│   │   └── client-web/          # 用户端
│   └── dify/                    # Dify 源码
├── docker/
│   ├── compose.dev.yml          # KBA 开发基础设施
│   ├── compose.services.yml     # KBA 服务编排草案
│   └── mysql/init/              # 数据库初始化脚本
└── doc/                         # 架构设计与项目资料
```

## 后端模块

| 模块 | 默认端口 | 职责 |
| --- | ---: | --- |
| `kba-gateway` | 8080 | 统一 API 入口、路由和认证信息传递 |
| `kba-identity` | 8101 | 登录、用户、角色、权限和租户管理 |
| `kba-knowledge` | 8102 | 知识库、文档、数据源、同步、检索、收藏和报告 |
| `kba-ai-application` | 8103 | AI 应用、助手、模型、会话和聊天消息 |
| `kba-operations` | 8104 | 审计、系统配置、监控指标和运营面板 |
| `kba-notification` | 8105 | 站内通知、邮件和短信接口 |
| `kba-file` | 8106 | MinIO 文件存储及文件元数据管理 |
| `kba-common` | - | 统一响应、异常、安全、Redis 和 Dify 公共能力 |

## 核心调用链

### 用户认证

```text
前端 → Gateway → Identity → MySQL 校验用户
     → Sa-Token 创建会话 → 返回 Bearer Token
```

后续请求由前端携带 `Authorization` 和 `X-Tenant-Id`，网关将用户及租户信息传递给下游服务。

### AI 对话

```text
client-web → Gateway → AI Application
           → 保存用户消息 → Dify /v1/chat-messages
           → 流式返回回答 → 保存助手消息
```

### 知识检索

```text
搜索请求 → Gateway → Knowledge
         → Dify /v1/datasets/{datasetId}/retrieve
         → 返回内容、相关度及文档信息
```

当前 KBA 的知识库 ID 会直接作为 Dify Dataset ID 使用，尚未提供独立映射层。

## 环境要求

### KBA 开发

- Windows 10/11
- JDK 17+
- Maven 3.8+
- Node.js 18+
- npm 9+
- Docker Desktop 与 Docker Compose

### Dify 源码开发

- Python `>=3.11,<3.13`
- Node.js 22
- pnpm 10.27.0
- `uv`

Dify 的 Makefile 使用 POSIX 命令，在 Windows 下建议通过 WSL 或兼容终端执行。

## 快速开始

以下命令均以 PowerShell 为例。每个命令块都从仓库根目录开始执行，启动多个服务时请分别打开终端。

### 1. 启动基础设施

```powershell
Set-Location docker
Copy-Item .env.example .env
docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml ps
```

该环境包含 MySQL、Redis、Nacos、MinIO、Keycloak 和 Qdrant。首次创建 MySQL 数据卷时，会自动执行 `docker/mysql/init/` 中的初始化脚本。

### 2. 启动 Dify

KBA 与 Dify 依赖共享网络 `kba-shared-network`，因此需要先启动上一节的基础设施。

```powershell
Set-Location code\dify\docker
Copy-Item .env.example .env
docker compose -f docker-compose.yaml -f docker-compose.kba.yml up -d
```

首次启动后访问 [http://localhost/install](http://localhost/install) 完成初始化，并在 Dify 控制台创建应用、生成 API Key。

本机通过 Maven 启动 KBA 服务时，需要在启动 `kba-knowledge` 和 `kba-ai-application` 的终端中设置：

```powershell
$env:DIFY_API_URL = "http://localhost"
$env:DIFY_API_KEY = "app-xxxxxxxxxxxxxxxx"
```

如果后续通过 Docker 运行 KBA 服务，则应将 `DIFY_API_URL=http://dify-api:5001` 和 API Key 写入 `docker/.env`。`DIFY_API_KEY` 为空时，AI 对话和知识检索功能无法调用 Dify。

### 3. 构建后端

```powershell
Set-Location code\backend
mvn clean install
```

开发环境下可在不同终端分别启动各服务：

```powershell
mvn spring-boot:run -pl kba-gateway "-Dspring-boot.run.profiles=dev"
mvn spring-boot:run -pl kba-identity "-Dspring-boot.run.profiles=dev"
mvn spring-boot:run -pl kba-knowledge "-Dspring-boot.run.profiles=dev"
mvn spring-boot:run -pl kba-ai-application "-Dspring-boot.run.profiles=dev"
mvn spring-boot:run -pl kba-operations "-Dspring-boot.run.profiles=dev"
mvn spring-boot:run -pl kba-notification "-Dspring-boot.run.profiles=dev"
mvn spring-boot:run -pl kba-file "-Dspring-boot.run.profiles=dev"
```

也可以在 IDE 中运行各模块的 `*Application` 主类。`dev` 配置默认连接本机基础设施，并关闭 Nacos 服务发现。启动 Knowledge 和 AI Application 前，请在对应终端设置上一节所示的 Dify 环境变量。

### 4. 启动前端

分别在三个终端中执行：

```powershell
Set-Location code\frontend\admin-web
npm install
npm run dev
```

```powershell
Set-Location code\frontend\client-web
npm install
npm run dev
```

```powershell
Set-Location code\frontend\portal-web
npm install
npm run dev
```

默认访问地址：

- 管理端：[http://localhost:5173](http://localhost:5173)
- 用户端：[http://localhost:5174](http://localhost:5174)
- 门户：[http://localhost:5175](http://localhost:5175)
- API 网关：[http://localhost:8080](http://localhost:8080)

管理端和用户端的开发配置默认启用 Mock。与真实后端联调时，请将对应环境文件中的 `VITE_ENABLE_MOCK` 或 `VITE_MOCK` 关闭。

## 主要配置

### KBA 基础设施

配置模板位于 `docker/.env.example`，主要变量包括：

| 变量 | 用途 |
| --- | --- |
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码 |
| `MYSQL_USER`、`MYSQL_PASSWORD` | MySQL 容器初始化账号；业务服务的 `dev` 配置默认使用 `kba` 账号 |
| `MINIO_ROOT_USER`、`MINIO_ROOT_PASSWORD` | MinIO 管理账号 |
| `KEYCLOAK_ADMIN`、`KEYCLOAK_ADMIN_PASSWORD` | Keycloak 管理账号 |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak 客户端密钥 |
| `DIFY_API_URL`、`DIFY_API_KEY` | Dify Service API 配置 |

### 后端环境变量

后端配置支持以下主要环境变量：

- MySQL：`MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD`
- Redis：`REDIS_HOST`、`REDIS_PORT`、`REDIS_PASSWORD`
- Nacos：`NACOS_SERVER_ADDR`、`NACOS_NAMESPACE`、`NACOS_GROUP`
- Dify：`DIFY_API_URL`、`DIFY_API_KEY`

### 前端环境变量

- `VITE_API_BASE_URL`：API 网关地址
- `VITE_ENABLE_MOCK`：管理端 Mock 开关
- `VITE_MOCK`：用户端 Mock 开关
- `VITE_USER_PORTAL_URL`：门户的用户端跳转地址
- `VITE_ADMIN_PORTAL_URL`：门户的管理端跳转地址

## API 路径

统一网关地址为 `http://localhost:8080`，主要接口前缀如下：

- 认证与权限：`/api/v1/auth/**`、`/api/v1/users/**`、`/api/v1/roles/**`
- 知识与文档：`/api/v1/knowledge/**`、`/api/v1/documents/**`
- 知识检索：`/api/v1/search/**`
- AI 应用与对话：`/api/v1/apps/**`、`/api/v1/assistants/**`、`/api/v1/chat/**`
- 文件管理：`/api/v1/files/**`
- 通知：`/api/v1/notifications/**`
- 运维：`/api/v1/monitor/**`、`/api/v1/audit/**`、`/api/v1/config/**`

## 构建与检查

### 后端构建

```powershell
Set-Location code\backend
mvn clean compile
mvn test
mvn clean package -DskipTests
```

### 管理端

```powershell
Set-Location code\frontend\admin-web
npm run type-check
npm run lint
npm run build
```

### 用户端

```powershell
Set-Location code\frontend\client-web
npm run type-check
npm run lint
npm run build
```

### 门户

```powershell
Set-Location code\frontend\portal-web
npm run type-check
npm run build
```

## 基础设施访问地址

| 服务 | 地址 |
| --- | --- |
| MySQL | `localhost:3306` |
| Redis | `localhost:6379` |
| Nacos | [http://localhost:8848](http://localhost:8848) |
| MinIO API | [http://localhost:9000](http://localhost:9000) |
| MinIO Console | [http://localhost:9001](http://localhost:9001) |
| Keycloak | [http://localhost:8180](http://localhost:8180) |
| Qdrant HTTP | [http://localhost:6333](http://localhost:6333) |
| Dify | [http://localhost](http://localhost) |

## 注意事项

1. `.env.example` 中的账号和密码仅适用于本地开发，生产环境必须全部更换。
2. 当前 Redis 容器未实际启用密码认证。
3. MySQL 初始化脚本只会在数据卷首次创建时执行。
4. `docker compose down -v` 会删除数据卷及其中的数据，请谨慎使用。
5. `kba-knowledge` 的开发配置与 Docker 默认 MinIO Secret Key 存在差异，联调前请统一配置。
6. 部分用户端 API 路径与网关的 `/api/v1/**` 路由可能不一致，真实后端联调时需要核对请求地址。
7. 当前 KBA 主体未提供独立 LICENSE，使用或分发前请先确认授权方式。
8. 内置 Dify 使用其仓库中的许可证，使用 Dify 源码及前端时应遵守 `code/dify/LICENSE`。

## 相关文档

- `doc/kba_design.md`：KBA 架构设计
- `code/backend/README.md`：后端说明
- `docker/README.md`：Docker 开发环境说明
- `code/dify/KBA-INTEGRATION.md`：KBA 与 Dify 集成说明
- `code/dify/README.md`：Dify 项目说明
