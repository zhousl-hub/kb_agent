<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { difyApi } from '@/api'
import type { DifyApp } from '@/api/dify'
import { Plus, Setting, Link, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const apps = ref<DifyApp[]>([])
const bindDialogVisible = ref(false)
const selectedApp = ref<DifyApp | null>(null)
const selectedSpaces = ref<string[]>([])
const knowledgeSpaces = ref([
  { id: '1', name: '产品文档' },
  { id: '2', name: 'FAQ知识库' },
  { id: '3', name: '技术文档' },
])

async function loadApps() {
  loading.value = true
  try {
    const result = await difyApi.getApps({ pageNum: 1, pageSize: 100 })
    apps.value = result.list
  } catch (error) {
    console.error('加载应用列表失败', error)
  } finally {
    loading.value = false
  }
}

function openBindDialog(app: DifyApp) {
  selectedApp.value = app
  selectedSpaces.value = app.knowledgeSpaceIds
  bindDialogVisible.value = true
}

async function handleBind() {
  if (!selectedApp.value) return
  try {
    await difyApi.bindKnowledgeSpaces(selectedApp.value.id, selectedSpaces.value)
    bindDialogVisible.value = false
    loadApps()
  } catch (error) {
    console.error('绑定知识空间失败', error)
  }
}

onMounted(() => {
  loadApps()
})
</script>

<template>
  <div class="dify-app">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Dify 应用管理</span>
          <el-button type="primary" :icon="Plus">新建应用</el-button>
        </div>
      </template>

      <el-table :data="apps" v-loading="loading" stripe>
        <el-table-column prop="name" label="应用名称" min-width="150" />
        <el-table-column prop="appId" label="App ID" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="knowledgeSpaceNames" label="绑定知识空间" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="name in row.knowledgeSpaceNames" :key="name" size="small" class="space-tag">
              {{ name }}
            </el-tag>
            <span v-if="!row.knowledgeSpaceNames?.length" class="text-gray">未绑定</span>
          </template>
        </el-table-column>
        <el-table-column prop="modelName" label="模型" width="120" />
        <el-table-column prop="callCount" label="调用次数" width="100" />
        <el-table-column prop="lastCallAt" label="最近调用" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Link" @click="openBindDialog(row)">绑定知识空间</el-button>
            <el-button text :icon="Setting">配置</el-button>
            <el-button text type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="bindDialogVisible" title="绑定知识空间" width="500px">
      <p class="dialog-tip">选择要绑定到此应用的知识空间，可多选</p>
      <el-checkbox-group v-model="selectedSpaces" class="space-checkbox-group">
        <el-checkbox v-for="space in knowledgeSpaces" :key="space.id" :label="space.id">
          {{ space.name }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBind">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dify-app {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .space-tag {
    margin-right: 5px;
  }

  .text-gray {
    color: #909399;
    font-size: 13px;
  }

  .dialog-tip {
    margin-bottom: 15px;
    color: #909399;
  }

  .space-checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>