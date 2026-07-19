<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref('home')

const tabs = [
  { name: 'home', icon: 'home-o', text: '首页' },
  { name: 'chat', icon: 'chat-o', text: '对话' },
  { name: 'knowledge', icon: 'description', text: '知识库' },
  { name: 'profile', icon: 'user-o', text: '我的' },
]

function getActiveFromPath() {
  const path = route.path.split('/')[1]
  return path || 'home'
}

active.value = getActiveFromPath()
</script>

<template>
  <div class="tab-bar-layout">
    <div class="content">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Home', 'Knowledge']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <van-tabbar v-model="active" route>
      <van-tabbar-item
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :to="`/${tab.name}`"
      >
        {{ tab.text }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.tab-bar-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
}
</style>