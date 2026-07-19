<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'

const appStore = useAppStore()

const mainStyle = computed(() => ({
  marginLeft: appStore.sidebarCollapsed ? '64px' : '210px',
}))
</script>

<template>
  <el-container class="admin-layout">
    <Sidebar />
    <el-container :style="mainStyle" class="main-container">
      <el-header class="header-container">
        <Navbar />
        <TagsView />
      </el-header>
      <AppMain />
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.admin-layout {
  width: 100%;
  height: 100%;
}

.main-container {
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  flex-direction: column;
}

.header-container {
  height: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}
</style>