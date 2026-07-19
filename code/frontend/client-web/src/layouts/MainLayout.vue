<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  House,
  Search,
  ChatDotRound,
  Collection,
  Star,
  Clock,
  Setting,
  SwitchButton,
  Bell,
  Search as SearchIcon,
  ArrowDown,
  DocumentCopy,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenu = computed(() => {
  const path = route.path.split('/')[1]
  return path || 'home'
})

const userMenuVisible = ref(false)

const menuItems = [
  { index: 'home', icon: House, title: '工作台' },
  { index: 'search', icon: Search, title: '知识检索' },
  { index: 'report', icon: DocumentCopy, title: '报告中心' },
  { index: 'assistants', icon: ChatDotRound, title: 'AI助手' },
  { index: 'knowledge', icon: Collection, title: '我的知识' },
  { index: 'favorites', icon: Star, title: '收藏夹' },
  { index: 'history', icon: Clock, title: '历史记录' },
  { index: 'settings', icon: Setting, title: '个人设置' },
]

function handleMenuSelect(index: string) {
  router.push(`/${index}`)
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function goToHome() {
  window.location.href = '/'
}

const currentTime = ref(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}, 1000)

const pageTitle = computed(() => {
  const item = menuItems.find(m => m.index === activeMenu.value)
  return item?.title || '工作台'
})
</script>

<template>
  <el-container class="main-layout">
    <el-aside width="256px" class="sidebar">
      <div class="logo">
        <img src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/564a89ae70ca4e39bf726b5df394adcd~tplv-a9rns2rl98-image.image?lk3s=8e244e95&rcl=20260309141151751B542FFD9DA9E73910&rrcfp=f06b921b&x-expires=1775628774&x-signature=tBAbjK9Zq6csTc9nOLecQ4dqUYA%3D" alt="Logo" class="logo-img" />
        <h1 class="logo-text">知识管理平台</h1>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <el-button class="back-btn" @click="goToHome">
          <el-icon><SwitchButton /></el-icon>
          返回首页
        </el-button>
      </div>
    </el-aside>

    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>

        <div class="header-right">
          <div class="search-box">
            <el-input placeholder="搜索知识..." :prefix-icon="SearchIcon" />
          </div>

          <el-badge :value="3" class="notification-badge">
            <el-button :icon="Bell" circle />
          </el-badge>

          <el-dropdown trigger="click" @visible-change="userMenuVisible = $event">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar || 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/7c13c77275254956913656617d9f8b40~tplv-a9rns2rl98-image.image?lk3s=8e244e95&rcl=20260309141151751B542FFD9DA9E73910&rrcfp=f06b921b&x-expires=1775620252&x-signature=w2FgC6%2F94a1Z%2F7v6XpZ6z0tOQf4%3D'" />
              <span class="username">{{ userStore.userInfo?.nickname || '张小明' }}</span>
              <el-icon class="dropdown-icon" :class="{ 'is-active': userMenuVisible }"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人资料</el-dropdown-item>
                <el-dropdown-item>账户设置</el-dropdown-item>
                <el-dropdown-item>帮助中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive :include="['Home', 'Knowledge', 'Search', 'Assistants']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #00CFFD;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #E2E8F0;
  border-left: 3px solid #00CFFD;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #E2E8F0;
}

.back-btn {
  width: 100%;
  border: 1px solid #00CFFD;
  color: #00CFFD;
}

.back-btn:hover {
  background-color: #00CFFD;
  color: #070D19;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  width: 256px;
}

.notification-badge :deep(.el-badge__content) {
  background-color: #BFFF00;
  color: #070D19;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-weight: 500;
}

.dropdown-icon {
  transition: transform 0.3s;
}

.dropdown-icon.is-active {
  transform: rotate(180deg);
}

.main-content {
  background: #F8FAFC;
  padding: 24px;
  overflow-y: auto;
}
</style>