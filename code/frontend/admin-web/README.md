# KBA 管理端前端

## 项目介绍

KBA 管理端是基于 **Vue 3** 和 **Element Plus** 构建的企业级知识库管理后台，提供知识库管理、系统配置、用户权限等功能。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 前端框架 |
| TypeScript | 5.8.2 | 类型系统 |
| Vite | 6.2.2 | 构建工具 |
| Element Plus | 2.9.7 | UI 组件库 |
| Pinia | 3.0.1 | 状态管理 |
| Vue Router | 4.5.0 | 路由管理 |
| Axios | 1.8.4 | HTTP 客户端 |
| UnoCSS | 66.0.0 | 原子化 CSS |
| TailwindCSS | 3.4.17 | 样式框架 |
| ECharts | 5.6.0 | 图表库 |

## 功能模块

- **用户认证**: 登录、登出、Token 管理
- **知识库管理**: 文档上传、解析、分类管理
- **知识空间**: 知识库创建、配置、权限管理
- **数据源接入**: 连接器配置、同步任务管理
- **检索配置**: 检索策略、召回配置、重排规则
- **系统管理**: 用户管理、角色权限、系统配置
- **监控统计**: 使用统计、性能监控、日志查看

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+ 或 pnpm 8+

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
# 运行 lint 并自动修复
npm run lint

# 类型检查
npm run type-check
```

### 运行测试

```bash
# 运行测试
npm run test

# 生成覆盖率报告
npm run test:coverage
```

## 目录结构

```
admin-web/
├── src/
│   ├── api/                 # API 接口定义
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件
│   ├── composables/         # 组合式函数
│   ├── layouts/             # 布局组件
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理
│   ├── styles/              # 全局样式
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── views/               # 页面组件
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── public/                   # 公共资源
├── index.html               # HTML 模板
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # TailwindCSS 配置
└── uno.config.ts            # UnoCSS 配置
```

## 环境配置

创建 `.env.local` 文件配置本地环境：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=KBA 管理端
```

## 开发规范

### 命名规范
- 组件文件: PascalCase (如 `UserList.vue`)
- 工具函数: camelCase (如 `formatDate.ts`)
- 类型文件: camelCase (如 `userTypes.ts`)
- 样式文件: kebab-case (如 `user-list.scss`)

### 组件规范
- 使用 `<script setup lang="ts">` 语法
- Props 定义使用 `defineProps` with TypeScript
- 使用组合式 API (Composition API)
- 样式使用 scoped 或 UnoCSS 原子类

### 状态管理
- 使用 Pinia 进行状态管理
- Store 按模块划分
- 持久化使用 `pinia-plugin-persistedstate`

### API 调用
- API 定义放在 `src/api/` 目录
- 使用 Axios 封装的请求实例
- 响应数据统一处理

## 相关链接

- [Element Plus 文档](https://element-plus.org)
- [Vue 3 文档](https://vuejs.org)
- [Pinia 文档](https://pinia.vuejs.org)
- [UnoCSS 文档](https://unocss.dev)