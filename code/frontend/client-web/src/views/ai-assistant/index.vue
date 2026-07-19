<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { post } from '@/api/request'

interface AiApp {
  id: string
  name: string
  icon: string
  description: string
}

const router = useRouter()
const apps = ref<AiApp[]>([])
const loading = ref(false)

const defaultApps: AiApp[] = [
  { id: 'customer-service', name: '智能客服', icon: 'service-o', description: '解答常见问题，提供客户支持' },
  { id: 'sales-assistant', name: '销售助手', icon: 'balance-list-o', description: '辅助销售沟通，提升转化率' },
  { id: 'rd-assistant', name: '研发助手', icon: 'cluster-o', description: '技术问题解答，代码辅助' },
  { id: 'ops-assistant', name: '运营助手', icon: 'chart-trending-o', description: '数据分析，运营建议' }
]

onMounted(async () => {
  await loadApps()
})

async function loadApps() {
  loading.value = true
  try {
    const data = await post<AiApp[]>('/ai-apps/list', {})
    apps.value = data.length > 0 ? data : defaultApps
  } catch {
    apps.value = defaultApps
  } finally {
    loading.value = false
  }
}

async function selectApp(app: AiApp) {
  try {
    const session = await post<{ id: string; appId: string }>('/chat/sessions/create', {
      appId: app.id,
      title: app.name
    })
    router.push({
      path: `/chat/${session.id}`,
      query: { app: app.id, title: app.name }
    })
  } catch {
    showToast('创建会话失败')
  }
}
</script>

<template>
  <div class="ai-assistant-page">
    <van-nav-bar title="AI助手" left-arrow @click-left="$router.back()" />

    <div v-if="loading" class="loading-state">
      <van-loading size="24px">加载中...</van-loading>
    </div>

    <div v-else class="app-selector">
      <h3 class="section-title">选择AI应用</h3>
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item
          v-for="app in apps"
          :key="app.id"
          @click="selectApp(app)"
        >
          <template #icon>
            <van-icon :name="app.icon" size="32" color="#1989fa" />
          </template>
          <template #text>
            <div class="app-name">{{ app.name }}</div>
            <div class="app-desc">{{ app.description }}</div>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<style scoped>
.ai-assistant-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.app-selector {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 16px;
}

.app-name {
  margin-top: 8px;
  font-size: 14px;
  color: #323233;
}

.app-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #969799;
  line-height: 1.4;
}

:deep(.van-grid-item__content) {
  padding: 16px 8px;
}
</style>