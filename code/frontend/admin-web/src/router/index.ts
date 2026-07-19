import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import { getToken, isTokenExpired } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/login/oauth2/code/keycloak', '/404', '/403']

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/login/oauth2/code/keycloak',
    name: 'OAuthCallback',
    component: () => import('@/views/login/oauth-callback.vue'),
    meta: { title: 'OAuth回调', hidden: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Odometer' },
      },
    ],
  },
  {
    path: '/knowledge',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/knowledge/ingestion',
    meta: { title: '知识管理', icon: 'Collection' },
    children: [
      {
        path: 'ingestion',
        name: 'KnowledgeIngestion',
        component: () => import('@/views/knowledge/ingestion/index.vue'),
        meta: { title: '知识接入', icon: 'Upload' },
      },
      {
        path: 'processing',
        name: 'KnowledgeProcessing',
        component: () => import('@/views/knowledge/processing/index.vue'),
        meta: { title: '知识加工', icon: 'Edit' },
      },
      {
        path: 'retrieval',
        name: 'KnowledgeRetrieval',
        component: () => import('@/views/knowledge/retrieval/index.vue'),
        meta: { title: '知识检索', icon: 'Search' },
      },
    ],
  },
  {
    path: '/dify',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dify/app',
    meta: { title: 'Dify应用管理', icon: 'Menu' },
    children: [
      {
        path: 'app',
        name: 'DifyApp',
        component: () => import('@/views/dify/app/index.vue'),
        meta: { title: '应用管理', icon: 'Grid' },
      },
    ],
  },
  {
    path: '/model',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/model/provider',
    meta: { title: '大模型管理', icon: 'Cpu' },
    children: [
      {
        path: 'provider',
        name: 'ModelProvider',
        component: () => import('@/views/model/provider/index.vue'),
        meta: { title: '模型供应商', icon: 'Connection' },
      },
      {
        path: 'router',
        name: 'ModelRouter',
        component: () => import('@/views/model/router/index.vue'),
        meta: { title: '路由策略', icon: 'Guide' },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/auth/user',
    meta: { title: '统一账号', icon: 'UserFilled' },
    children: [
      {
        path: 'user',
        name: 'AuthUser',
        component: () => import('@/views/auth/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'role',
        name: 'AuthRole',
        component: () => import('@/views/auth/role/index.vue'),
        meta: { title: '角色管理', icon: 'Avatar' },
      },
    ],
  },
  {
    path: '/governance',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/governance/permission',
    meta: { title: '治理与安全', icon: 'Lock' },
    children: [
      {
        path: 'permission',
        name: 'GovernancePermission',
        component: () => import('@/views/governance/permission/index.vue'),
        meta: { title: '权限配置', icon: 'Key' },
      },
      {
        path: 'audit',
        name: 'GovernanceAudit',
        component: () => import('@/views/governance/audit/index.vue'),
        meta: { title: '审计日志', icon: 'List' },
      },
    ],
  },
  {
    path: '/monitor',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/monitor/dashboard',
    meta: { title: '监控与运营', icon: 'DataLine' },
    children: [
      {
        path: 'dashboard',
        name: 'MonitorDashboard',
        component: () => import('@/views/monitor/dashboard/index.vue'),
        meta: { title: '运营看板', icon: 'DataAnalysis' },
      },
      {
        path: 'feedback',
        name: 'MonitorFeedback',
        component: () => import('@/views/monitor/feedback/index.vue'),
        meta: { title: '反馈闭环', icon: 'ChatDotRound' },
      },
    ],
  },
  {
    path: '/system',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/system/config',
    meta: { title: '系统设置', icon: 'Setting' },
    children: [
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '系统配置', icon: 'Tools' },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403', hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  document.title = `${to.meta.title || 'KBA'} - 管理平台`

  if (whiteList.includes(to.path)) {
    next()
    return
  }

  const token = getToken()
  
  if (!token) {
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    return
  }

  if (isTokenExpired()) {
    const userStore = useUserStore()
    const refreshed = await userStore.refreshAccessToken()
    if (!refreshed) {
      await userStore.logout(false)
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }
  }

  const userStore = useUserStore()
  if (!userStore.userInfo) {
    const success = await userStore.initUserState()
    if (!success) {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }
  }

  if (to.meta.permission && typeof to.meta.permission === 'string') {
    if (!userStore.hasPermission(to.meta.permission)) {
      next('/403')
      return
    }
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    if (!userStore.hasAnyRole(to.meta.roles)) {
      next('/403')
      return
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router