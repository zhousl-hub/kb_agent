<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  Odometer,
  Collection,
  Document,
  Menu,
  Cpu,
  UserFilled,
  Lock,
  DataLine,
  Setting,
  Expand,
  Fold,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const menuList = [
  { path: '/dashboard', title: '工作台', icon: Odometer },
  { path: '/knowledge', title: '知识管理', icon: Collection },
  { path: '/report', title: '报告中心', icon: Document },
  { path: '/dify', title: 'Dify应用', icon: Menu },
  { path: '/model', title: '大模型管理', icon: Cpu },
  { path: '/auth', title: '统一账号', icon: UserFilled },
  { path: '/governance', title: '治理与安全', icon: Lock },
  { path: '/monitor', title: '监控运营', icon: DataLine },
  { path: '/system', title: '系统设置', icon: Setting },
]

const activeMenu = computed(() => {
  const path = route.path
  const matched = menuList.find(item => path.startsWith(item.path) && item.path !== '/')
  return matched?.path || route.path
})

const isCollapse = computed(() => appStore.sidebarCollapsed)

function handleSelect(path: string) {
  router.push(path)
}
</script>

<template>
  <el-aside :width="isCollapse ? '64px' : '210px'" class="sidebar-container">
    <div class="logo-container">
      <img src="@/assets/images/logo.svg" alt="logo" class="logo" />
      <span v-show="!isCollapse" class="title">KBA</span>
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
    <div class="collapse-btn" @click="appStore.toggleSidebar">
      <el-icon>
        <Expand v-if="isCollapse" />
        <Fold v-else />
      </el-icon>
    </div>
  </el-aside>
</template>

<style lang="scss" scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #304156;
  z-index: 1001;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #263445;

  .logo {
    width: 32px;
    height: 32px;
  }

  .title {
    margin-left: 10px;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
  }
}

.el-menu {
  border-right: none;
}

.collapse-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #bfcbd9;
  background-color: #263445;

  &:hover {
    color: #409EFF;
  }
}
</style>