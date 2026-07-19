# KBA 后端服务

## 项目介绍

KBA 后端服务基于 **Java 17** 和 **Spring Boot 3.2.5** 构建，提供企业级知识库系统的核心 API 能力。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 运行时环境 |
| Spring Boot | 3.2.5 | 应用框架 |
| MyBatis-Plus | 3.5.7 | ORM 框架 |
| Sa-Token | 1.39.0 | 认证授权 |
| Hutool | 5.8.29 | 工具库 |
| Lombok | 1.18.32 | 代码简化 |

## 模块结构

```
backend/
├── kba-common/          # 公共模块 - 通用工具、常量、基础配置
├── kba-admin/           # 管理服务 - 知识库管理、系统配置
├── auth-service/          # 认证服务 - OAuth2、SSO、权限管理
├── business-admin/        # 管理端业务逻辑
├── business-client/       # 用户端业务逻辑
├── common/                # 通用组件
├── gateway/               # API 网关
└── sql/                   # 数据库脚本
```

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 7+

### 本地开发

```bash
# 1. 克隆项目并进入目录
cd code/backend

# 2. 安装依赖
mvn clean install

# 3. 启动服务 (开发环境)
mvn spring-boot:run -pl kba-admin

# 或使用 IDE 直接运行主类
```

### 配置说明

配置文件位于 `kba-admin/src/main/resources/application.yml`：

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/kba
    username: root
    password: root123456
  redis:
    host: localhost
    port: 6379
```

## 常用命令

```bash
# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包
mvn clean package -DskipTests

# 运行单个测试
mvn test -Dtest=TestClassName -pl kba-admin

# 代码格式化
mvn spotless:apply

# 依赖检查
mvn dependency:tree
```

## API 模块

### 认证模块 (auth-service)
- 用户登录/登出
- OAuth2 授权
- Token 管理
- 权限校验

### 知识库模块 (business-admin)
- 文档上传/解析
- 知识切分/向量化
- 知识空间管理
- 数据源接入

### 检索模块 (business-client)
- 语义检索
- 混合检索
- 问答接口
- 引用追溯

## 数据库

### 初始化

```bash
# 执行 SQL 脚本
mysql -u root -p kba < sql/init.sql
```

### 迁移管理

数据库变更脚本放在 `sql/migrations/` 目录，按版本号命名。

## 开发规范

### 代码规范
- 遵循 Google Java Style Guide
- 使用 Lombok 简化 POJO
- Controller 只做参数校验和响应封装
- Service 层处理业务逻辑
- 使用 MyBatis-Plus 进行数据访问

### 命名规范
- 类名: PascalCase (如 `KnowledgeService`)
- 方法名: camelCase (如 `getDocumentById`)
- 常量: UPPER_SNAKE_CASE (如 `MAX_PAGE_SIZE`)
- 包名: 全小写 (如 `com.kba.admin`)

### 异常处理
- 使用统一异常处理 `GlobalExceptionHandler`
- 业务异常继承 `BusinessException`
- 错误码定义在 `ErrorCode` 枚举

### 日志规范
- 使用 Slf4j + Lombok `@Slf4j`
- 生产环境使用 INFO 级别
- 敏感信息禁止打印

## 测试

```bash
# 运行所有测试
mvn test

# 运行指定模块测试
mvn test -pl kba-common

# 生成覆盖率报告
mvn jacoco:report
```

## 相关文档

- [API 文档](../../docs/api.md)
- [部署指南](../../docs/deployment.md)
- [项目主文档](../../README.md)