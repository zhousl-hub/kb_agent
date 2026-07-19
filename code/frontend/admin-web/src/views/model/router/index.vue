<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { modelApi } from '@/api'
import type { ModelRouter } from '@/api/dify'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const routers = ref<ModelRouter[]>([])

async function loadRouters() {
  loading.value = true
  try {
    const result = await modelApi.getRouters({ pageNum: 1, pageSize: 100 })
    routers.value = result.list
  } catch (error) {
    console.error('加载路由策略失败', error)
  } finally {
    loading.value = false
  }
}

function getStrategyText(strategy: string) {
  const map: Record<string, string> = {
    quality: '质量优先',
    cost: '成本优先',
    latency: '延迟优先',
    custom: '自定义',
  }
  return map[strategy] || strategy
}

onMounted(() => {
  loadRouters()
})
</script>

<template>
  <div class="model-router">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>模型路由策略</span>
          <el-button type="primary" :icon="Plus">新建策略</el-button>
        </div>
      </template>

      <el-table :data="routers" v-loading="loading" stripe>
        <el-table-column prop="name" label="策略名称" width="150" />
        <el-table-column prop="appName" label="关联应用" width="150">
          <template #default="{ row }">
            {{ row.appName || '全局策略' }}
          </template>
        </el-table-column>
        <el-table-column prop="primaryModelName" label="主模型" width="150" />
        <el-table-column prop="fallbackModelName" label="备选模型" width="150">
          <template #default="{ row }">
            {{ row.fallbackModelName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="strategy" label="策略类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getStrategyText(row.strategy) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button text type="primary" :icon="Edit">编辑</el-button>
            <el-button text type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.model-router {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>