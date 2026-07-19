import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '工作台', keepAlive: true },
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/search/index.vue'),
        meta: { title: '知识检索', keepAlive: true },
      },
      {
        path: 'assistants',
        name: 'Assistants',
        component: () => import('@/views/assistants/index.vue'),
        meta: { title: 'AI助手', keepAlive: true },
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/index.vue'),
        meta: { title: '我的知识', keepAlive: true },
      },
      {
        path: 'knowledge/create',
        name: 'KnowledgeCreate',
        component: () => import('@/views/knowledge/create/index.vue'),
        meta: { title: '创建知识库' },
      },
      {
        path: 'knowledge/:id',
        name: 'KnowledgeDetail',
        component: () => import('@/views/knowledge/detail/index.vue'),
        meta: { title: '知识库详情' },
      },
      {
        path: 'ai-assistant',
        name: 'AiAssistant',
        component: () => import('@/views/ai-assistant/index.vue'),
        meta: { title: 'AI助手' },
      },
      {
        path: 'chat/:id?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
        meta: { title: 'AI对话' },
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/favorites/index.vue'),
        meta: { title: '收藏夹' },
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/history/index.vue'),
        meta: { title: '历史记录' },
      },
      {
        path: 'report',
        name: 'ReportList',
        component: () => import('@/views/report/list/index.vue'),
        meta: { title: '报告中心', keepAlive: true },
      },
      {
        path: 'report/edit',
        name: 'ReportCreate',
        component: () => import('@/views/report/edit/index.vue'),
        meta: { title: '新建报告' },
      },
      {
        path: 'report/edit/:id',
        name: 'ReportEdit',
        component: () => import('@/views/report/edit/index.vue'),
        meta: { title: '编辑报告' },
      },
      {
        path: 'report/version/:id',
        name: 'ReportVersion',
        component: () => import('@/views/report/version/index.vue'),
        meta: { title: '版本历史' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人设置' },
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '注册' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const publicPaths = ['/login', '/register']

router.beforeEach((to, _from, next) => {
  document.title = (to.meta?.title as string) || '智能知识助手'

  const userStore = useUserStore()
  const isPublic = publicPaths.includes(to.path)

  if (userStore.isLoggedIn && isPublic) {
    next('/home')
    return
  }

  if (!isPublic && !userStore.isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router