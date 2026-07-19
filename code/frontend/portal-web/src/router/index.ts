import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  const publicPages = ['/', '/login', '/register', '/forgot-password']
  const isPublicPage = publicPages.includes(to.path) || to.path.startsWith('/reset-password')
  
  if (userStore.token && !userStore.userInfo) {
    await userStore.initUserState()
  }
  
  if (!isPublicPage && !userStore.isLoggedIn) {
    return next({ name: 'Home', query: { redirect: to.fullPath } })
  }
  
  next()
})

export default router