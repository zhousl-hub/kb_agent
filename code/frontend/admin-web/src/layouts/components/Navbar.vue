<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Fold,
  Expand,
  Search,
  Bell,
  QuestionFilled,
  User,
  SwitchButton,
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const appStore = useAppStore()
const router = useRouter()

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      handleLogout()
      break
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('退出成功')
  }).catch(() => {})
}
</script>

<template>
  <div class="navbar">
    <div class="left-menu">
      <el-icon class="hamburger" @click="appStore.toggleSidebar">
        <component :is="appStore.sidebarCollapsed ? Expand : Fold" />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>工作台</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="right-menu">
      <el-tooltip content="搜索" placement="bottom">
        <el-icon class="icon-btn"><Search /></el-icon>
      </el-tooltip>
      <el-tooltip content="通知" placement="bottom">
        <el-badge :value="3" class="badge-item">
          <el-icon class="icon-btn"><Bell /></el-icon>
        </el-badge>
      </el-tooltip>
      <el-tooltip content="帮助" placement="bottom">
        <el-icon class="icon-btn"><QuestionFilled /></el-icon>
      </el-tooltip>
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.userInfo?.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ userStore.username || '管理员' }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.left-menu {
  display: flex;
  align-items: center;

  .hamburger {
    font-size: 20px;
    cursor: pointer;
    margin-right: 15px;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.right-menu {
  display: flex;
  align-items: center;

  .icon-btn {
    font-size: 18px;
    cursor: pointer;
    margin-right: 15px;
    color: #5a5e66;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .badge-item {
    margin-right: 15px;
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;

    .username {
      margin-left: 8px;
      font-size: 14px;
    }
  }
}
</style>