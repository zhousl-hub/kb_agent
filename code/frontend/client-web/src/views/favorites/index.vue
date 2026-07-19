<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Star, Delete, Document } from '@element-plus/icons-vue'
import { favoritesApi, type FavoriteItem } from '@/api/favorites'

const router = useRouter()
const loading = ref(false)
const favorites = ref<FavoriteItem[]>([])
const searchValue = ref('')

async function fetchFavorites() {
  loading.value = true
  try {
    favorites.value = await favoritesApi.getList(searchValue.value)
  } catch {
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  fetchFavorites()
}

function viewDetail(item: FavoriteItem) {
  router.push(`/knowledge/${item.knowledgeId}`)
}

async function removeFavorite(item: FavoriteItem) {
  try {
    await ElMessageBox.confirm(`确定要取消收藏「${item.knowledgeTitle}」吗？`, '取消收藏', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await favoritesApi.remove(item.id)
    ElMessage.success('已取消收藏')
    fetchFavorites()
  } catch {
    // User cancelled or delete failed
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

onMounted(() => {
  fetchFavorites()
})
</script>

<template>
  <div class="favorites-page">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchValue"
          placeholder="搜索收藏内容"
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
    </div>

    <div v-loading="loading" class="content">
      <div v-if="favorites.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无收藏内容">
          <el-button type="primary" @click="router.push('/knowledge')">
            去知识库看看
          </el-button>
        </el-empty>
      </div>

      <div v-else class="favorite-list">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="favorite-item card card-hover"
        >
          <div class="item-main" @click="viewDetail(item)">
            <div class="item-icon">
              <el-icon class="star-icon"><Star /></el-icon>
            </div>
            <div class="item-content">
              <h4 class="item-title">{{ item.knowledgeTitle }}</h4>
              <p class="item-summary">{{ item.summary }}</p>
              <div class="item-meta">
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ item.source || '未知来源' }}
                </span>
                <span class="meta-item">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <el-button type="danger" text @click="removeFavorite(item)">
              <el-icon><Delete /></el-icon>
              取消收藏
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
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

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-item {
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
}

.star-icon {
  font-size: 24px;
  color: #f59e0b;
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

.item-summary {
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
  gap: 16px;
  font-size: 12px;
  color: #94A3B8;
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