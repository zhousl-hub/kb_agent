<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { monitorApi } from '@/api/system'
import { Top, Bottom } from '@element-plus/icons-vue'

const loading = ref(false)
const feedbacks = ref<any[]>([])
const total = ref(0)
const queryParams = ref<{ pageNum: number; pageSize: number; rating: 'positive' | 'negative' | '' }>({ pageNum: 1, pageSize: 10, rating: '' })

async function loadFeedbacks() {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      ...(queryParams.value.rating ? { rating: queryParams.value.rating } : {}),
    }
    const result = await monitorApi.getFeedbackList(params)
    feedbacks.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载反馈列表失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFeedbacks()
})
</script>

<template>
  <div class="monitor-feedback">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户反馈闭环</span>
        </div>
      </template>

      <div class="filter-bar">
        <el-radio-group v-model="queryParams.rating" @change="loadFeedbacks">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="positive"><el-icon><Top /></el-icon> 正面</el-radio-button>
          <el-radio-button label="negative"><el-icon><Bottom /></el-icon> 负面</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="feedbacks" v-loading="loading" stripe>
        <el-table-column prop="query" label="用户问题" min-width="200" />
        <el-table-column prop="answer" label="系统回答" min-width="250" />
        <el-table-column prop="rating" label="评价" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.rating === 'positive'" color="#67C23A"><Top /></el-icon>
            <el-icon v-else color="#F56C6C"><Bottom /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="用户备注" width="200" />
        <el-table-column prop="createdAt" label="时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button text type="primary">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" background layout="total, prev, pager, next" @change="loadFeedbacks" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.monitor-feedback {
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .filter-bar { margin-bottom: 20px; }
  .el-pagination { margin-top: 20px; justify-content: flex-end; }
}
</style>