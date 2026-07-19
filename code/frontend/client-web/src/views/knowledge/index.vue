<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ChatDotRound, Delete, Document, Edit } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/knowledge'
import type { KnowledgeSpace } from '@/types'

const router = useRouter()
const loading = ref(false)
const knowledgeBases = ref<KnowledgeSpace[]>([])
const searchValue = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const editDialogVisible = ref(false)
const editingKb = ref<KnowledgeSpace | null>(null)
const editForm = ref({ name: '', description: '' })
const editLoading = ref(false)

async function fetchKnowledgeBases() {
  loading.value = true
  try {
    const data = await knowledgeApi.getSpaces(currentPage.value, pageSize.value)
    knowledgeBases.value = data.items || []
    total.value = data.total
  } catch {
    ElMessage.error('获取知识库失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchKnowledgeBases()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchKnowledgeBases()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchKnowledgeBases()
}

function startChat(kbId: string) {
  router.push(`/assistants?kb=${kbId}`)
}

function viewDetail(kbId: string) {
  router.push(`/knowledge/${kbId}`)
}

function openEditDialog(kb: KnowledgeSpace) {
  editingKb.value = kb
  editForm.value = { name: kb.spaceName, description: kb.description }
  editDialogVisible.value = true
}

async function handleEdit() {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入知识库名称')
    return
  }
  if (!editingKb.value) return
  
  editLoading.value = true
  try {
    await knowledgeApi.update(editingKb.value.id, editForm.value)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    fetchKnowledgeBases()
  } catch {
    ElMessage.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

async function deleteKb(kb: KnowledgeSpace) {
  try {
    await ElMessageBox.confirm(`确定要删除知识库「${kb.spaceName}」吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await knowledgeApi.delete(kb.id)
    ElMessage.success('删除成功')
    fetchKnowledgeBases()
  } catch {
    // User cancelled or delete failed
  }
}

onMounted(() => {
  fetchKnowledgeBases()
})
</script>

<template>
  <div class="knowledge-page">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchValue"
          placeholder="搜索知识库"
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
      <el-button type="primary" :icon="Plus" @click="router.push('/knowledge/create')">
        新建知识库
      </el-button>
    </div>

    <div v-loading="loading" class="content">
      <div v-if="knowledgeBases.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无知识库">
          <el-button type="primary" @click="router.push('/knowledge/create')">
            创建知识库
          </el-button>
        </el-empty>
      </div>

      <div v-else class="kb-grid">
        <div
          v-for="kb in knowledgeBases"
          :key="kb.id"
          class="kb-card card card-hover"
        >
          <div class="kb-header">
            <div class="kb-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="kb-title">{{ kb.spaceName }}</div>
          </div>
          <p class="kb-description">{{ kb.description || '暂无描述' }}</p>
          <div class="kb-meta">
            <span class="doc-count">{{ kb.documentCount }} 篇文档</span>
            <el-tag size="small" :type="kb.status === 1 ? 'success' : 'info'">{{ kb.status === 1 ? '正常' : '禁用' }}</el-tag>
          </div>
          <div class="kb-actions">
            <el-button type="primary" text @click="startChat(kb.id)">
              <el-icon><ChatDotRound /></el-icon>
              开始对话
            </el-button>
            <el-button text @click="viewDetail(kb.id)">
              查看详情
            </el-button>
            <el-button text @click="openEditDialog(kb)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" text @click="deleteKb(kb)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="total > pageSize" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑知识库"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="editForm.name" placeholder="请输入知识库名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入知识库描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.knowledge-page {
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

.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.kb-card {
  padding: 24px;
}

.kb-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.kb-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #00CFFD 0%, #00B8E6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #070D19;
  font-size: 24px;
  margin-right: 16px;
}

.kb-title {
  font-size: 18px;
  font-weight: 600;
}

.kb-description {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kb-meta {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.doc-count {
  font-size: 14px;
  color: #00CFFD;
  font-weight: 500;
}

.kb-type {
  font-size: 12px;
  color: #94A3B8;
  background: #F1F5F9;
  padding: 2px 8px;
  border-radius: 4px;
}

.kb-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}
</style>