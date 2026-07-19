<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Upload, Delete, Document, ChatDotRound } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeSpace, Document as DocType } from '@/types'

const route = useRoute()
const router = useRouter()
const spaceId = route.params.id as string

const loading = ref(false)
const space = ref<KnowledgeSpace | null>(null)
const documents = ref<DocType[]>([])
const docLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const uploadLoading = ref(false)
const uploadRef = ref()

async function fetchSpace() {
  loading.value = true
  try {
    space.value = await knowledgeApi.getById(spaceId)
  } catch {
    ElMessage.error('获取知识库信息失败')
    router.push('/knowledge')
  } finally {
    loading.value = false
  }
}

async function fetchDocuments() {
  docLoading.value = true
  try {
    const data = await knowledgeApi.getDocuments(spaceId, currentPage.value, pageSize.value)
    documents.value = data.items
    total.value = data.total
  } catch {
    ElMessage.error('获取文档列表失败')
  } finally {
    docLoading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchDocuments()
}

async function handleUpload(options: { file: File }) {
  const file = options.file
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|md|txt|xlsx|xls)$/i)) {
    ElMessage.error('不支持的文件格式')
    return
  }

  uploadLoading.value = true
  try {
    await knowledgeApi.uploadDocument(spaceId, file)
    ElMessage.success('上传成功，正在处理中...')
    fetchDocuments()
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploadLoading.value = false
    uploadRef.value?.clearFiles()
  }
}

async function deleteDocument(doc: DocType) {
  try {
    await ElMessageBox.confirm(`确定要删除文档「${doc.docName}」吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await knowledgeApi.deleteDocument(spaceId, doc.id)
    ElMessage.success('删除成功')
    fetchDocuments()
  } catch {
    // User cancelled or delete failed
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '处理失败'
  }
  return statusMap[status] || status
}

function getStatusType(status: string): '' | 'success' | 'warning' | 'danger' | 'info' {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return typeMap[status] || ''
}

function startChat() {
  router.push(`/assistants?kb=${spaceId}`)
}

onMounted(() => {
  fetchSpace()
  fetchDocuments()
})
</script>

<template>
  <div class="detail-page">
    <div class="page-header">
      <el-button text @click="router.push('/knowledge')">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <div v-if="space" class="content">
      <div class="space-info card">
        <div class="info-header">
          <div class="info-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="info-content">
            <h2 class="space-name">{{ space.spaceName }}</h2>
            <p class="space-desc">{{ space.description || '暂无描述' }}</p>
            <div class="space-meta">
              <el-tag size="small" :type="space.status === 1 ? 'success' : 'info'">{{ space.status === 1 ? '正常' : '禁用' }}</el-tag>
              <el-tag size="small" type="info">{{ space.embeddingModel }}</el-tag>
              <span class="doc-count">{{ space.documentCount }} 篇文档</span>
            </div>
          </div>
          <el-button type="primary" @click="startChat">
            <el-icon><ChatDotRound /></el-icon>
            开始对话
          </el-button>
        </div>
      </div>

      <div class="documents-section card">
        <div class="section-header">
          <h3 class="section-title">文档列表</h3>
          <el-upload
            ref="uploadRef"
            :show-file-list="false"
            :before-upload="() => false"
            :on-change="handleUpload"
            accept=".pdf,.doc,.docx,.md,.txt,.xlsx,.xls"
          >
            <el-button type="primary" :loading="uploadLoading" :icon="Upload">
              上传文档
            </el-button>
          </el-upload>
        </div>

        <div v-loading="docLoading" class="document-list">
          <el-empty v-if="documents.length === 0 && !docLoading" description="暂无文档，请上传" />

          <el-table v-else :data="documents" stripe>
            <el-table-column label="文件名" prop="docName" min-width="200">
              <template #default="{ row }">
                <div class="doc-name">
                  <el-icon class="doc-icon"><Document /></el-icon>
                  <span>{{ row.docName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="100">
              <template #default="{ row }">
                {{ formatFileSize(row.fileSize) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.processStatus)" size="small">
                  {{ getStatusText(row.processStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分片数" prop="segmentCount" width="80" />
            <el-table-column label="上传时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString('zh-CN') }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" text :icon="Delete" @click="deleteDocument(row)" />
              </template>
            </el-table-column>
          </el-table>

          <div v-if="total > pageSize" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              background
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.space-info {
  padding: 24px;
}

.info-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.info-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #00CFFD 0%, #00B8E6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #070D19;
  font-size: 32px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.space-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.space-desc {
  color: #64748B;
  margin: 0 0 12px 0;
}

.space-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-count {
  font-size: 14px;
  color: #00CFFD;
  font-weight: 500;
}

.documents-section {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.document-list {
  min-height: 300px;
}

.doc-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-icon {
  color: #00CFFD;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
</style>