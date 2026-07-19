<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auditApi } from '@/api/system'
import type { AuditLog } from '@/api/system'
import { Search, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const logs = ref<AuditLog[]>([])
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  userId: '',
  action: '',
  startTime: '',
  endTime: '',
})

async function loadLogs() {
  loading.value = true
  try {
    const result = await auditApi.getLogs(queryParams.value)
    logs.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载审计日志失败', error)
  } finally {
    loading.value = false
  }
}

function getActionType(action: string) {
  const map: Record<string, string> = {
    login: 'primary',
    logout: 'info',
    create: 'success',
    update: 'warning',
    delete: 'danger',
  }
  return map[action] || 'info'
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <div class="governance-audit">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>审计日志</span>
          <el-button :icon="Download">导出日志</el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="queryParams.userId" placeholder="用户ID" style="width: 150px" clearable />
        <el-select v-model="queryParams.action" placeholder="操作类型" style="width: 120px" clearable>
          <el-option label="登录" value="login" />
          <el-option label="登出" value="logout" />
          <el-option label="创建" value="create" />
          <el-option label="更新" value="update" />
          <el-option label="删除" value="delete" />
        </el-select>
        <el-date-picker v-model="queryParams.startTime" type="datetime" placeholder="开始时间" style="width: 180px" />
        <el-date-picker v-model="queryParams.endTime" type="datetime" placeholder="结束时间" style="width: 180px" />
        <el-button type="primary" :icon="Search" @click="loadLogs">搜索</el-button>
      </div>

      <el-table :data="logs" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resource" label="资源" width="150" />
        <el-table-column prop="detail" label="详情" min-width="200" />
        <el-table-column prop="ip" label="IP地址" width="130" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180" />
      </el-table>

      <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total" background layout="total, sizes, prev, pager, next" @change="loadLogs" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.governance-audit {
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .search-bar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
  .el-pagination { margin-top: 20px; justify-content: flex-end; }
}
</style>