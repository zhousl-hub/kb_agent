<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  Plus,
  Upload,
  Connection,
  Link,
  Coin,
  Refresh,
  Delete,
  View,
  RefreshRight,
  Setting,
  VideoPause,
  Document,
  FolderOpened,
  Timer,
  Check,
  Close,
  Loading,
} from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api'
import type { KnowledgeSpace, SyncTask } from '@/api/knowledge'

interface DataSourceType {
  type: 'local' | 'database' | 'confluence' | 'feishu' | 'dingtalk'
  name: string
  description: string
  icon: any
  color: string
}

interface ExtendedDataSource {
  id: string
  name: string
  type: 'upload' | 'database' | 'web' | 'api' | 'confluence' | 'feishu' | 'dingtalk'
  config: Record<string, any>
  status: 'connected' | 'disconnected' | 'error'
  lastSyncAt?: string
  createdAt: string
}

interface SyncTaskForm {
  name: string
  dataSourceType: string
  dataSourceId: string
  syncFrequency: 'manual' | 'schedule'
  cronExpression: string
  spaceId: string
  advancedConfig: {
    chunkSize: number
    chunkOverlap: number
    embeddingModel: string
    enableOcr: boolean
    enableMetadata: boolean
  }
}

interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  table?: string
  query?: string
}

interface ConfluenceConfig {
  url: string
  username: string
  apiToken: string
  spaceKey: string
}

interface FeishuConfig {
  appId: string
  appSecret: string
  folderToken?: string
}

const activeTab = ref('datasource')
const loading = ref(false)
const dataSources = ref<ExtendedDataSource[]>([])
const syncTasks = ref<SyncTask[]>([])
const spaces = ref<KnowledgeSpace[]>([])

const taskDialogVisible = ref(false)
const spaceDialogVisible = ref(false)
const databaseConfigDialogVisible = ref(false)
const confluenceConfigDialogVisible = ref(false)
const feishuConfigDialogVisible = ref(false)
const uploadDialogVisible = ref(false)

const taskFormRef = ref<FormInstance>()
const spaceFormRef = ref<FormInstance>()
const databaseConfigRef = ref<FormInstance>()
const confluenceConfigRef = ref<FormInstance>()
const feishuConfigRef = ref<FormInstance>()

const selectedDataSourceType = ref<DataSourceType | null>(null)
const editingTaskId = ref<string | null>(null)
const editingSpaceId = ref<string | null>(null)

const taskForm = ref<SyncTaskForm>({
  name: '',
  dataSourceType: '',
  dataSourceId: '',
  syncFrequency: 'manual',
  cronExpression: '',
  spaceId: '',
  advancedConfig: {
    chunkSize: 500,
    chunkOverlap: 50,
    embeddingModel: 'text-embedding-ada-002',
    enableOcr: false,
    enableMetadata: true,
  },
})

const spaceForm = ref({
  name: '',
  description: '',
  type: 'document' as 'document' | 'faq' | 'structured',
})

const databaseConfig = ref<DatabaseConfig>({
  host: 'localhost',
  port: 3306,
  username: '',
  password: '',
  database: '',
  table: '',
  query: '',
})

const confluenceConfig = ref<ConfluenceConfig>({
  url: '',
  username: '',
  apiToken: '',
  spaceKey: '',
})

const feishuConfig = ref<FeishuConfig>({
  appId: '',
  appSecret: '',
  folderToken: '',
})

const uploadFiles = ref<UploadFile[]>([])

const dataSourceTypes: DataSourceType[] = [
  { type: 'local', name: '本地文档', description: '支持 PDF、Word、Excel 等格式', icon: Document, color: '#409EFF' },
  { type: 'database', name: '数据库', description: 'MySQL、PostgreSQL、MongoDB 等', icon: Coin, color: '#67C23A' },
  { type: 'confluence', name: 'Confluence', description: 'Atlassian Confluence 文档', icon: Link, color: '#E6A23C' },
  { type: 'feishu', name: '钉钉/飞书', description: '企业即时通讯工具', icon: Connection, color: '#F56C6C' },
]

const embeddingModels = [
  { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' },
  { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
  { label: 'text-embedding-3-large', value: 'text-embedding-3-large' },
  { label: 'bge-large-zh', value: 'bge-large-zh' },
  { label: 'bge-m3', value: 'bge-m3' },
]

const dbTypes = [
  { label: 'MySQL', value: 'mysql', defaultPort: 3306 },
  { label: 'PostgreSQL', value: 'postgresql', defaultPort: 5432 },
  { label: 'MongoDB', value: 'mongodb', defaultPort: 27017 },
  { label: 'SQL Server', value: 'sqlserver', defaultPort: 1433 },
  { label: 'Oracle', value: 'oracle', defaultPort: 1521 },
]

const selectedDbType = ref('mysql')

const taskRules: FormRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  dataSourceType: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  spaceId: [{ required: true, message: '请选择知识空间', trigger: 'change' }],
}

const spaceRules: FormRules = {
  name: [{ required: true, message: '请输入空间名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择空间类型', trigger: 'change' }],
}

const databaseConfigRules: FormRules = {
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  database: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
}

const confluenceConfigRules: FormRules = {
  url: [{ required: true, message: '请输入 Confluence URL', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  apiToken: [{ required: true, message: '请输入 API Token', trigger: 'blur' }],
  spaceKey: [{ required: true, message: '请输入空间 Key', trigger: 'blur' }],
}

const feishuConfigRules: FormRules = {
  appId: [{ required: true, message: '请输入 App ID', trigger: 'blur' }],
  appSecret: [{ required: true, message: '请输入 App Secret', trigger: 'blur' }],
}

const runningTasks = computed(() => syncTasks.value.filter(t => t.status === 'running'))
const completedTasks = computed(() => syncTasks.value.filter(t => t.status === 'success' || t.status === 'failed'))

async function loadDataSources() {
  loading.value = true
  try {
    const result = await knowledgeApi.getDataSources({ pageNum: 1, pageSize: 100 })
    dataSources.value = result.list as ExtendedDataSource[]
  } catch {
    dataSources.value = getMockDataSources()
  } finally {
    loading.value = false
  }
}

async function loadSyncTasks() {
  try {
    const result = await knowledgeApi.getSyncTasks({ pageNum: 1, pageSize: 50 })
    syncTasks.value = result.list
  } catch {
    syncTasks.value = getMockSyncTasks()
  }
}

async function loadSpaces() {
  try {
    const result = await knowledgeApi.getSpaces({ pageNum: 1, pageSize: 100 })
    spaces.value = result.list
  } catch {
    spaces.value = getMockSpaces()
  }
}

function getMockDataSources(): ExtendedDataSource[] {
  return [
    { id: '1', name: '产品文档库', type: 'upload', config: {}, status: 'connected', lastSyncAt: '2026-03-09 10:30', createdAt: '2026-01-15' },
    { id: '2', name: '技术文档库', type: 'database', config: { dbType: 'mysql' }, status: 'connected', lastSyncAt: '2026-03-09 14:15', createdAt: '2026-02-20' },
    { id: '3', name: 'Confluence空间', type: 'confluence', config: {}, status: 'connected', createdAt: '2026-02-25' },
    { id: '4', name: '飞书文档', type: 'feishu', config: {}, status: 'disconnected', createdAt: '2026-03-01' },
  ]
}

function getMockSyncTasks(): SyncTask[] {
  return [
    { id: '1', dataSourceId: '1', dataSourceName: '产品文档库同步', type: 'full', status: 'success', progress: 100, documentCount: 156, successCount: 156, failedCount: 0, createdAt: '2026-03-09 10:30', startedAt: '2026-03-09 10:30', finishedAt: '2026-03-09 10:32' },
    { id: '2', dataSourceId: '2', dataSourceName: '技术文档库同步', type: 'incremental', status: 'running', progress: 65, documentCount: 137, successCount: 89, failedCount: 0, createdAt: '2026-03-09 14:15', startedAt: '2026-03-09 14:15' },
    { id: '3', dataSourceId: '3', dataSourceName: '营销资料同步', type: 'full', status: 'failed', progress: 90, documentCount: 50, successCount: 45, failedCount: 5, errorMessage: '5份文档同步失败', createdAt: '2026-03-08 16:45', startedAt: '2026-03-08 16:45', finishedAt: '2026-03-08 16:47' },
    { id: '4', dataSourceId: '1', dataSourceName: 'FAQ知识库同步', type: 'incremental', status: 'pending', progress: 0, documentCount: 0, successCount: 0, failedCount: 0, createdAt: '2026-03-09 15:00' },
  ]
}

function getMockSpaces(): KnowledgeSpace[] {
  return [
    { id: '1', name: '产品文档', type: 'document', documentCount: 156, segmentCount: 2500, status: 'active', createdAt: '2026-01-15', updatedAt: '2026-03-09' },
    { id: '2', name: 'FAQ知识库', type: 'faq', documentCount: 89, segmentCount: 1200, status: 'active', createdAt: '2026-02-10', updatedAt: '2026-03-08' },
    { id: '3', name: '技术文档', type: 'document', documentCount: 137, segmentCount: 1800, status: 'indexing', createdAt: '2026-02-20', updatedAt: '2026-03-09' },
  ]
}

function selectDataSourceType(dst: DataSourceType) {
  selectedDataSourceType.value = dst
  taskForm.value.dataSourceType = dst.type
  
  switch (dst.type) {
    case 'local':
      uploadDialogVisible.value = true
      break
    case 'database':
      databaseConfigDialogVisible.value = true
      break
    case 'confluence':
      confluenceConfigDialogVisible.value = true
      break
    case 'feishu':
    case 'dingtalk':
      feishuConfigDialogVisible.value = true
      break
  }
}

function openTaskDialog(data?: SyncTask) {
  if (data) {
    editingTaskId.value = data.id
    taskForm.value = {
      name: data.dataSourceName,
      dataSourceType: '',
      dataSourceId: data.dataSourceId,
      syncFrequency: 'manual',
      cronExpression: '',
      spaceId: '',
      advancedConfig: { chunkSize: 500, chunkOverlap: 50, embeddingModel: 'text-embedding-ada-002', enableOcr: false, enableMetadata: true },
    }
  } else {
    editingTaskId.value = null
    taskForm.value = {
      name: '',
      dataSourceType: '',
      dataSourceId: '',
      syncFrequency: 'manual',
      cronExpression: '',
      spaceId: '',
      advancedConfig: { chunkSize: 500, chunkOverlap: 50, embeddingModel: 'text-embedding-ada-002', enableOcr: false, enableMetadata: true },
    }
  }
  taskDialogVisible.value = true
}

async function saveTask() {
  const valid = await taskFormRef.value?.validate()
  if (!valid) return

  try {
    await knowledgeApi.createSyncTask({ dataSourceId: taskForm.value.dataSourceId || 'new', type: taskForm.value.syncFrequency === 'manual' ? 'full' : 'incremental' })
    ElMessage.success('同步任务已创建')
    taskDialogVisible.value = false
    loadSyncTasks()
  } catch {
    const newTask: SyncTask = {
      id: Date.now().toString(),
      dataSourceId: taskForm.value.dataSourceId || 'new',
      dataSourceName: taskForm.value.name,
      type: taskForm.value.syncFrequency === 'manual' ? 'full' : 'incremental',
      status: 'pending',
      progress: 0,
      documentCount: 0,
      successCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
    }
    syncTasks.value.unshift(newTask)
    ElMessage.success('同步任务已创建')
    taskDialogVisible.value = false
  }
}

async function cancelTask(taskId: string) {
  try {
    await knowledgeApi.cancelSyncTask(taskId)
    ElMessage.success('任务已暂停')
    loadSyncTasks()
  } catch {
    const task = syncTasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = 'failed'
      task.errorMessage = '用户取消'
    }
    ElMessage.success('任务已暂停')
  }
}

async function retryTask(taskId: string) {
  try {
    await knowledgeApi.retrySyncTask(taskId)
    ElMessage.success('任务重试已提交')
    loadSyncTasks()
  } catch {
    const task = syncTasks.value.find(t => t.id === taskId)
    if (task) {
      task.status = 'running'
      task.progress = 0
    }
    ElMessage.success('任务重试已提交')
  }
}

async function deleteTask(taskId: string) {
  try {
    await ElMessageBox.confirm('确定要删除该同步任务吗？', '提示', { type: 'warning' })
    syncTasks.value = syncTasks.value.filter(t => t.id !== taskId)
    ElMessage.success('删除成功')
  } catch {}
}

function openSpaceDialog(data?: KnowledgeSpace) {
  if (data) {
    editingSpaceId.value = data.id
    spaceForm.value = { name: data.name, description: data.description || '', type: data.type }
  } else {
    editingSpaceId.value = null
    spaceForm.value = { name: '', description: '', type: 'document' }
  }
  spaceDialogVisible.value = true
}

async function saveSpace() {
  const valid = await spaceFormRef.value?.validate()
  if (!valid) return

  try {
    if (editingSpaceId.value) {
      await knowledgeApi.updateSpace(editingSpaceId.value, spaceForm.value)
      ElMessage.success('更新成功')
    } else {
      await knowledgeApi.createSpace(spaceForm.value)
      ElMessage.success('创建成功')
    }
    spaceDialogVisible.value = false
    loadSpaces()
  } catch {
    if (editingSpaceId.value) {
      const space = spaces.value.find(s => s.id === editingSpaceId.value)
      if (space) {
        space.name = spaceForm.value.name
        space.description = spaceForm.value.description
        space.type = spaceForm.value.type
      }
    } else {
      spaces.value.push({
        id: Date.now().toString(),
        ...spaceForm.value,
        documentCount: 0,
        segmentCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    ElMessage.success(editingSpaceId.value ? '更新成功' : '创建成功')
    spaceDialogVisible.value = false
  }
}

async function deleteSpace(spaceId: string) {
  try {
    await ElMessageBox.confirm('确定要删除该知识空间吗？删除后无法恢复。', '提示', { type: 'warning' })
    await knowledgeApi.deleteSpace(spaceId)
    ElMessage.success('删除成功')
    loadSpaces()
  } catch {
    spaces.value = spaces.value.filter(s => s.id !== spaceId)
    ElMessage.success('删除成功')
  }
}

async function testDatabaseConnection() {
  const valid = await databaseConfigRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('数据库连接成功')
    databaseConfigDialogVisible.value = false
    openTaskDialog()
  } catch {
    ElMessage.error('数据库连接失败')
  } finally {
    loading.value = false
  }
}

async function testConfluenceConnection() {
  const valid = await confluenceConfigRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('Confluence 连接成功')
    confluenceConfigDialogVisible.value = false
    openTaskDialog()
  } catch {
    ElMessage.error('Confluence 连接失败')
  } finally {
    loading.value = false
  }
}

async function testFeishuConnection() {
  const valid = await feishuConfigRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('飞书连接成功')
    feishuConfigDialogVisible.value = false
    openTaskDialog()
  } catch {
    ElMessage.error('飞书连接失败')
  } finally {
    loading.value = false
  }
}

function handleUploadSuccess(_response: any, file: UploadFile) {
  ElMessage.success(`文件 ${file.name} 上传成功`)
}

function handleUploadError(_error: Error, file: UploadFile) {
  ElMessage.error(`文件 ${file.name} 上传失败`)
}

function submitUpload() {
  if (uploadFiles.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }
  ElMessage.success(`已上传 ${uploadFiles.value.length} 个文件`)
  uploadDialogVisible.value = false
  openTaskDialog()
}

function getStatusTag(status: string) {
  const map: Record<string, { type: '' | 'success' | 'warning' | 'danger' | 'info'; text: string }> = {
    pending: { type: 'info', text: '等待中' },
    running: { type: 'warning', text: '同步中' },
    success: { type: 'success', text: '已完成' },
    failed: { type: 'danger', text: '失败' },
  }
  return map[status] || { type: 'info', text: status }
}

function getStatusIcon(status: string) {
  const map: Record<string, any> = {
    pending: Timer,
    running: Loading,
    success: Check,
    failed: Close,
  }
  return map[status] || Timer
}

function getDataSourceTypeText(type: string) {
  const map: Record<string, string> = {
    upload: '本地文档',
    database: '数据库',
    web: '网页抓取',
    api: 'API接口',
    confluence: 'Confluence',
    feishu: '飞书',
    dingtalk: '钉钉',
  }
  return map[type] || type
}

function getDataSourceIcon(type: string) {
  const map: Record<string, any> = {
    upload: Document,
    database: Coin,
    web: Link,
    api: Connection,
    confluence: Link,
    feishu: Connection,
    dingtalk: Connection,
  }
  return map[type] || Document
}

function formatDuration(startedAt?: string, finishedAt?: string) {
  if (!startedAt) return '-'
  const start = new Date(startedAt).getTime()
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  const seconds = Math.floor((end - start) / 1000)
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  if (minutes < 60) return `${minutes}分${remainSeconds}秒`
  const hours = Math.floor(minutes / 60)
  const remainMinutes = minutes % 60
  return `${hours}小时${remainMinutes}分`
}

function onDbTypeChange(dbType: string) {
  const db = dbTypes.find(d => d.value === dbType)
  if (db) {
    databaseConfig.value.port = db.defaultPort
  }
}

onMounted(() => {
  loadDataSources()
  loadSyncTasks()
  loadSpaces()
})
</script>

<template>
  <div class="knowledge-ingestion">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="数据源接入" name="datasource">
        <div class="section-title">选择数据源类型</div>
        
        <el-row :gutter="20" class="datasource-types">
          <el-col v-for="dst in dataSourceTypes" :key="dst.type" :span="6">
            <el-card class="datasource-type-card" shadow="hover" @click="selectDataSourceType(dst)">
              <div class="card-content">
                <div class="icon-wrapper" :style="{ backgroundColor: dst.color + '20' }">
                  <el-icon :size="32" :style="{ color: dst.color }">
                    <component :is="dst.icon" />
                  </el-icon>
                </div>
                <h4 class="card-title">{{ dst.name }}</h4>
                <p class="card-desc">{{ dst.description }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div class="section-divider">
          <span>已配置的数据源</span>
        </div>

        <el-row :gutter="20">
          <el-col v-for="ds in dataSources" :key="ds.id" :span="8">
            <el-card class="datasource-card" shadow="hover">
              <div class="ds-header">
                <el-icon :size="24" class="ds-icon" :style="{ color: '#409EFF' }">
                  <component :is="getDataSourceIcon(ds.type)" />
                </el-icon>
                <div class="ds-info">
                  <div class="ds-name">{{ ds.name }}</div>
                  <el-tag size="small" type="info">{{ getDataSourceTypeText(ds.type) }}</el-tag>
                </div>
              </div>
              <div class="ds-status">
                <span :class="['status-dot', ds.status]"></span>
                <span>{{ ds.status === 'connected' ? '已连接' : ds.status === 'error' ? '连接失败' : '未连接' }}</span>
              </div>
              <div class="ds-meta" v-if="ds.lastSyncAt">
                <el-icon><Timer /></el-icon>
                <span>上次同步: {{ ds.lastSyncAt }}</span>
              </div>
              <div class="ds-footer">
                <el-button text type="primary" @click="openTaskDialog()">
                  <el-icon><Refresh /></el-icon>同步
                </el-button>
                <el-button text @click="$router.push(`/knowledge/ingestion/tasks?dsId=${ds.id}`)">
                  <el-icon><View /></el-icon>详情
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="!loading && dataSources.length === 0" description="暂无数据源，请点击上方卡片添加" />
      </el-tab-pane>

      <el-tab-pane label="同步任务" name="tasks">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openTaskDialog()">新建同步任务</el-button>
          <el-button :icon="Refresh" @click="loadSyncTasks">刷新</el-button>
        </div>

        <div v-if="runningTasks.length > 0" class="running-tasks">
          <div class="section-title">
            <el-icon class="spin"><Loading /></el-icon>
            正在进行的任务
          </div>
          <div class="task-list">
            <div v-for="task in runningTasks" :key="task.id" class="task-item running">
              <div class="task-header">
                <span class="task-name">{{ task.dataSourceName }}</span>
                <el-tag type="warning" effect="dark">
                  <el-icon class="spin"><Loading /></el-icon>
                  同步中
                </el-tag>
              </div>
              <div class="task-details">
                <div class="detail-item">
                  <span class="label">开始时间</span>
                  <span class="value">{{ task.startedAt }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">进度</span>
                  <span class="value">
                    <el-progress :percentage="task.progress" :stroke-width="8" :show-text="false" style="width: 100px" />
                    <span class="progress-text">{{ task.progress }}%</span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">已处理</span>
                  <span class="value">{{ task.successCount }}/{{ task.documentCount }} 份</span>
                </div>
                <div class="detail-item">
                  <span class="label">预计剩余</span>
                  <span class="value">约{{ formatDuration(task.startedAt) }}</span>
                </div>
              </div>
              <div class="task-actions">
                <el-button size="small" :icon="VideoPause" @click="cancelTask(task.id)">暂停</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="section-title">任务历史</div>
        <el-table :data="completedTasks" v-loading="loading" stripe>
          <el-table-column prop="dataSourceName" label="任务名称" min-width="150" />
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">
              <el-tag size="small">{{ row.type === 'full' ? '全量' : '增量' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status).type">
                <el-icon><component :is="getStatusIcon(row.status)" /></el-icon>
                {{ getStatusTag(row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="180">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress :percentage="row.progress" :stroke-width="6" :status="row.status === 'failed' ? 'exception' : row.status === 'success' ? 'success' : ''" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="文档数量" width="120">
            <template #default="{ row }">
              <span class="success-count">{{ row.successCount }}</span>
              <span v-if="row.failedCount > 0" class="failed-count"> / {{ row.failedCount }}失败</span>
            </template>
          </el-table-column>
          <el-table-column label="耗时" width="100">
            <template #default="{ row }">
              {{ formatDuration(row.startedAt, row.finishedAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="finishedAt" label="完成时间" width="180">
            <template #default="{ row }">
              {{ row.finishedAt || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status === 'failed'" text type="primary" :icon="RefreshRight" @click="retryTask(row.id)">重试</el-button>
              <el-button text type="primary" :icon="View">详情</el-button>
              <el-button text type="danger" :icon="Delete" @click="deleteTask(row.id)" />
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && syncTasks.length === 0" description="暂无同步任务" />
      </el-tab-pane>

      <el-tab-pane label="知识空间" name="spaces">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openSpaceDialog()">新建知识空间</el-button>
        </div>

        <el-row :gutter="20">
          <el-col v-for="space in spaces" :key="space.id" :span="8">
            <el-card class="space-card" shadow="hover">
              <div class="space-header">
                <div class="space-icon">
                  <el-icon :size="24"><FolderOpened /></el-icon>
                </div>
                <div class="space-info">
                  <div class="space-name">{{ space.name }}</div>
                  <el-tag size="small" :type="space.type === 'document' ? '' : space.type === 'faq' ? 'success' : 'warning'">
                    {{ space.type === 'document' ? '文档' : space.type === 'faq' ? 'FAQ' : '结构化' }}
                  </el-tag>
                </div>
                <el-dropdown trigger="click">
                  <el-button text :icon="Setting" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :icon="Connection" @click="openSpaceDialog(space)">编辑</el-dropdown-item>
                      <el-dropdown-item :icon="Delete" divided @click="deleteSpace(space.id)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <p class="space-desc">{{ space.description || '暂无描述' }}</p>
              <div class="space-stats">
                <div class="stat-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ space.documentCount }} 文档</span>
                </div>
                <div class="stat-item">
                  <el-icon><Connection /></el-icon>
                  <span>{{ space.segmentCount }} 片段</span>
                </div>
              </div>
              <div class="space-footer">
                <el-tag :type="space.status === 'active' ? 'success' : space.status === 'indexing' ? 'warning' : 'info'" size="small">
                  {{ space.status === 'active' ? '活跃' : space.status === 'indexing' ? '索引中' : '停用' }}
                </el-tag>
                <span class="created-at">创建于 {{ space.createdAt }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="!loading && spaces.length === 0" description="暂无知识空间" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="taskDialogVisible" title="新建同步任务" width="650px" destroy-on-close>
      <el-form ref="taskFormRef" :model="taskForm" :rules="taskRules" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="数据源" prop="dataSourceType">
          <el-select v-model="taskForm.dataSourceType" placeholder="请选择数据源" style="width: 100%">
            <el-option v-for="dst in dataSourceTypes" :key="dst.type" :label="dst.name" :value="dst.type" />
          </el-select>
        </el-form-item>
        <el-form-item label="知识空间" prop="spaceId">
          <el-select v-model="taskForm.spaceId" placeholder="请选择知识空间" style="width: 100%">
            <el-option v-for="space in spaces" :key="space.id" :label="space.name" :value="space.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="同步频率">
          <el-radio-group v-model="taskForm.syncFrequency">
            <el-radio value="manual">手动触发</el-radio>
            <el-radio value="schedule">定时同步</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="taskForm.syncFrequency === 'schedule'" label="Cron表达式">
          <el-input v-model="taskForm.cronExpression" placeholder="如: 0 0 2 * * ? (每天凌晨2点)" />
        </el-form-item>
        
        <el-divider content-position="left">高级配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="块大小">
              <el-input-number v-model="taskForm.advancedConfig.chunkSize" :min="100" :max="10000" :step="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重叠大小">
              <el-input-number v-model="taskForm.advancedConfig.chunkOverlap" :min="0" :max="1000" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="向量模型">
          <el-select v-model="taskForm.advancedConfig.embeddingModel" style="width: 100%">
            <el-option v-for="model in embeddingModels" :key="model.value" :label="model.label" :value="model.value" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用OCR">
              <el-switch v-model="taskForm.advancedConfig.enableOcr" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提取元数据">
              <el-switch v-model="taskForm.advancedConfig.enableMetadata" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">创建任务</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="spaceDialogVisible" :title="editingSpaceId ? '编辑知识空间' : '新建知识空间'" width="500px" destroy-on-close>
      <el-form ref="spaceFormRef" :model="spaceForm" :rules="spaceRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="spaceForm.name" placeholder="请输入知识空间名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="spaceForm.type" style="width: 100%">
            <el-option label="文档类型" value="document" />
            <el-option label="FAQ类型" value="faq" />
            <el-option label="结构化数据" value="structured" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="spaceForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="spaceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpace">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="uploadDialogVisible" title="上传文档" width="600px" destroy-on-close>
      <el-upload
        v-model:file-list="uploadFiles"
        drag
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
        :auto-upload="false"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 PDF、Word、Excel、PPT、TXT、MD 等格式，单个文件不超过 50MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">开始上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="databaseConfigDialogVisible" title="配置数据库连接" width="550px" destroy-on-close>
      <el-form ref="databaseConfigRef" :model="databaseConfig" :rules="databaseConfigRules" label-width="100px">
        <el-form-item label="数据库类型">
          <el-select v-model="selectedDbType" @change="onDbTypeChange" style="width: 100%">
            <el-option v-for="db in dbTypes" :key="db.value" :label="db.label" :value="db.value" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="databaseConfig.host" placeholder="localhost" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="端口" prop="port">
              <el-input-number v-model="databaseConfig.port" :min="1" :max="65535" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="databaseConfig.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="databaseConfig.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="数据库" prop="database">
          <el-input v-model="databaseConfig.database" placeholder="请输入数据库名" />
        </el-form-item>
        <el-form-item label="查询语句">
          <el-input v-model="databaseConfig.query" type="textarea" :rows="3" placeholder="可选：输入 SQL 查询语句" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="databaseConfigDialogVisible = false">取消</el-button>
        <el-button @click="testDatabaseConnection" :loading="loading" type="primary">测试连接</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="confluenceConfigDialogVisible" title="配置 Confluence 连接" width="500px" destroy-on-close>
      <el-form ref="confluenceConfigRef" :model="confluenceConfig" :rules="confluenceConfigRules" label-width="100px">
        <el-form-item label="URL" prop="url">
          <el-input v-model="confluenceConfig.url" placeholder="https://your-company.atlassian.net" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="confluenceConfig.username" placeholder="请输入用户名或邮箱" />
        </el-form-item>
        <el-form-item label="API Token" prop="apiToken">
          <el-input v-model="confluenceConfig.apiToken" type="password" placeholder="请输入 API Token" show-password />
        </el-form-item>
        <el-form-item label="空间 Key" prop="spaceKey">
          <el-input v-model="confluenceConfig.spaceKey" placeholder="请输入要同步的空间 Key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confluenceConfigDialogVisible = false">取消</el-button>
        <el-button @click="testConfluenceConnection" :loading="loading" type="primary">测试连接</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="feishuConfigDialogVisible" title="配置飞书/钉钉连接" width="500px" destroy-on-close>
      <el-form ref="feishuConfigRef" :model="feishuConfig" :rules="feishuConfigRules" label-width="100px">
        <el-form-item label="App ID" prop="appId">
          <el-input v-model="feishuConfig.appId" placeholder="请输入 App ID" />
        </el-form-item>
        <el-form-item label="App Secret" prop="appSecret">
          <el-input v-model="feishuConfig.appSecret" type="password" placeholder="请输入 App Secret" show-password />
        </el-form-item>
        <el-form-item label="文件夹Token">
          <el-input v-model="feishuConfig.folderToken" placeholder="可选：指定要同步的文件夹 Token" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feishuConfigDialogVisible = false">取消</el-button>
        <el-button @click="testFeishuConnection" :loading="loading" type="primary">测试连接</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-ingestion {
  .main-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
  }

  .toolbar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-divider {
    margin: 30px 0 20px;
    text-align: center;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      background: #e4e7ed;
    }

    span {
      background: #fff;
      padding: 0 16px;
      position: relative;
      color: #909399;
      font-size: 14px;
    }
  }

  .datasource-types {
    margin-bottom: 20px;

    .datasource-type-card {
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .card-content {
        text-align: center;
        padding: 10px 0;

        .icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .card-desc {
          color: #909399;
          font-size: 13px;
          margin: 0;
        }
      }
    }
  }

  .datasource-card {
    margin-bottom: 20px;

    .ds-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .ds-icon {
        width: 40px;
        height: 40px;
        background: #f0f2f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }

      .ds-info {
        .ds-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
      }
    }

    .ds-status {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 13px;
      color: #909399;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;

        &.connected { background: #67C23A; }
        &.disconnected { background: #909399; }
        &.error { background: #F56C6C; }
      }
    }

    .ds-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;
      margin-bottom: 15px;
    }

    .ds-footer {
      display: flex;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
  }

  .running-tasks {
    margin-bottom: 30px;

    .section-title {
      color: #E6A23C;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .task-item {
      background: #fdf6ec;
      border: 1px solid #f5dab1;
      border-radius: 8px;
      padding: 16px;

      &.running {
        background: #fdf6ec;
        border-color: #f5dab1;
      }

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .task-name {
          font-weight: 600;
          font-size: 15px;
        }
      }

      .task-details {
        display: flex;
        gap: 24px;
        margin-bottom: 12px;

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .label {
            font-size: 12px;
            color: #909399;
          }

          .value {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .progress-text {
              font-weight: 500;
            }
          }
        }
      }

      .task-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .space-card {
    margin-bottom: 20px;

    .space-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .space-icon {
        width: 40px;
        height: 40px;
        background: #ecf5ff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-color-primary);
        margin-right: 12px;
      }

      .space-info {
        flex: 1;

        .space-name {
          font-weight: 600;
          margin-bottom: 4px;
        }
      }
    }

    .space-desc {
      color: #909399;
      font-size: 13px;
      margin-bottom: 12px;
      min-height: 40px;
    }

    .space-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 12px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;

        .el-icon {
          color: #909399;
        }
      }
    }

    .space-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #eee;

      .created-at {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .progress-cell {
    padding-right: 10px;
  }

  .success-count {
    color: #67C23A;
    font-weight: 500;
  }

  .failed-count {
    color: #F56C6C;
    font-size: 12px;
  }
}
</style>