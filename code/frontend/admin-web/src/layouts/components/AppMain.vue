<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const key = computed(() => route.path)
</script>

<template>
  <el-main class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="[]">
          <component :is="Component" :key="key" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>

<script lang="ts">
export default {
  name: 'AppMain',
}
</script>

<style lang="scss" scoped>
.app-main {
  padding: 15px;
  background-color: #f0f2f5;
  overflow-y: auto;
  height: calc(100vh - 84px);
}
</style>