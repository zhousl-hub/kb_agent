<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, ChatDotRound } from '@element-plus/icons-vue'
import { historyApi, type HistoryItem } from '@/api/history'

const router = useRouter()
const loading = ref(false)
const histories = ref<HistoryItem[]>([])
const searchValue = ref('')

async function fetchHistories() {
  loading.value = true
  try {
    histories.value = await historyApi.getList(searchValue.value)
  } catch {
    ElMessage.error('获取历史记录失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  fetchHistories()
}

function continueChat(item: HistoryItem) {
  router.push(`/assistants?id=${item.id}`)
}

async function deleteHistory(item: HistoryItem) {
  try {
    await ElMessageBox.confirm(`确定要删除对话「${item.title || '未命名对话'}」吗？`, '删除对话', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await historyApi.delete(item.id)
    ElMessage.success('删除成功')
    fetchHistories()
  } catch {
    // User cancelled or delete failed
  }
}

async function clearAllHistory() {
  try {
    await ElMessageBox.confirm('确定要清空所有历史记录吗？此操作不可恢复。', '清空历史', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await historyApi.clearAll()
    ElMessage.success('已清空历史记录')
    histories.value = []
  } catch {
    // User cancelled or delete failed
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

onMounted(() => {
  fetchHistories()
})
</script>

<template>
  <div class="history-page">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchValue"
          placeholder="搜索历史对话"
          :prefix-icon="Search"
          clearable
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #append>
            <el-button @click="onSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <el-button v-if="histories.length > 0" type="danger" plain @click="clearAllHistory">
        <el-icon><Delete /></el-icon>
        清空历史
      </el-button>
    </div>

    <div v-loading="loading" class="content">
      <div v-if="histories.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无历史记录">
          <el-button type="primary" @click="router.push('/assistants')">
            开始新对话
          </el-button>
        </el-empty>
      </div>

      <div v-else class="history-list">
        <div
          v-for="item in histories"
          :key="item.id"
          class="history-item card card-hover"
        >
          <div class="item-main" @click="continueChat(item)">
            <div class="item-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="item-content">
              <h4 class="item-title">{{ item.title || '未命名对话' }}</h4>
              <p class="item-preview">{{ item.preview }}</p>
              <div class="item-meta">
                <span v-if="item.knowledgeBaseName" class="kb-tag">
                  {{ item.knowledgeBaseName }}
                </span>
                <span class="meta-item">{{ formatDate(item.updatedAt) }}</span>
                <span class="meta-item">{{ item.messageCount }} 条消息</span>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <el-button type="primary" text @click="continueChat(item)">
              继续
            </el-button>
            <el-button type="danger" text @click="deleteHistory(item)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  width: 400px;
}

.content {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.item-main {
  display: flex;
  flex: 1;
  cursor: pointer;
}

.item-icon {
  margin-right: 16px;
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
  font-size: 24px;
  color: #00CFFD;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.item-preview {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #94A3B8;
}

.kb-tag {
  background: rgba(0, 207, 253, 0.1);
  color: #00CFFD;
  padding: 2px 8px;
  border-radius: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-actions {
  display: flex;
  align-items: center;
  margin-left: 16px;
}
</style>