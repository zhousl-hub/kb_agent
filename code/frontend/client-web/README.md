# KBA 用户端前端

## 项目介绍

KBA 用户端是基于 **Vue 3** 和 **Vant** 构建的移动端知识检索应用，提供智能问答、知识搜索、文档查看等功能。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.13 | 前端框架 |
| TypeScript | 5.7.2 | 类型系统 |
| Vite | 6.0.7 | 构建工具 |
| Vant | 4.9.10 | 移动端 UI 组件库 |
| Pinia | 3.0.2 | 状态管理 |
| Vue Router | 4.5.0 | 路由管理 |
| Axios | 1.7.9 | HTTP 客户端 |
| Marked | 15.0.4 | Markdown 解析 |
| Highlight.js | 11.11.1 | 代码高亮 |

## 功能模块

- **智能问答**: 自然语言问答、多轮对话
- **知识搜索**: 关键词搜索、语义检索、筛选过滤
- **文档查看**: 在线预览、来源追溯
- **历史记录**: 问答历史、搜索记录
- **个人中心**: 用户信息、偏好设置

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

访问 http://localhost:5174

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

## 目录结构

```
client-web/
├── src/
│   ├── api/                 # API 接口定义
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件
│   ├── composables/         # 组合式函数
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
└── tsconfig.json            # TypeScript 配置
```

## 环境配置

创建 `.env.local` 文件配置本地环境：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=KBA
```

## 开发规范

### 命名规范
- 组件文件: PascalCase (如 `ChatView.vue`)
- 工具函数: camelCase (如 `formatDate.ts`)
- 页面文件: kebab-case (如 `chat-view.vue`)

### 组件规范
- 使用 `<script setup lang="ts">` 语法
- 使用 Vant 组件库
- 移动端适配使用 `postcss-px-to-viewport`

### 状态管理
- 使用 Pinia 进行状态管理
- 会话数据持久化到 localStorage

### 样式规范
- 使用 Vant 内置主题变量
- 自定义样式使用 scoped
- 支持 viewport 适配

## 移动端适配

项目使用 `postcss-px-to-viewport` 进行移动端适配，配置如下：

```javascript
// postcss 配置
{
  viewportWidth: 375,  // 设计稿宽度
  viewportUnit: 'vw'
}
```

## 相关链接

- [Vant 文档](https://vant-ui.github.io/vant)
- [Vue 3 文档](https://vuejs.org)
- [Pinia 文档](https://pinia.vuejs.org)