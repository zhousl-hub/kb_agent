<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/knowledge'
import type { CreateKnowledgeSpaceParams } from '@/types'

const router = useRouter()

const form = ref<CreateKnowledgeSpaceParams>({
  spaceName: '',
  spaceCode: '',
  description: '',
  embeddingModel: 'text-embedding-ada-002'
})

const loading = ref(false)

const embeddingModels = [
  { value: 'text-embedding-ada-002', label: 'OpenAI Ada-002', desc: 'OpenAI最新嵌入模型，效果最佳' },
  { value: 'text-embedding-3-small', label: 'OpenAI Embedding-3 Small', desc: '性价比高，适合中小规模' },
  { value: 'text-embedding-3-large', label: 'OpenAI Embedding-3 Large', desc: '大规模高精度场景' },
  { value: 'bge-large-zh', label: 'BGE Large 中文', desc: '国产开源模型，中文效果优秀' },
  { value: 'bge-m3', label: 'BGE M3', desc: '多语言支持，适合跨国业务' }
]

const canSubmit = computed(() => {
  return form.value.spaceName.trim() && form.value.spaceCode.trim() && form.value.embeddingModel
})

async function handleSubmit() {
  if (!canSubmit.value) {
    ElMessage.warning('请填写知识库名称和编码')
    return
  }
  
  loading.value = true
  try {
    const space = await knowledgeApi.create(form.value)
    ElMessage.success('创建成功')
    router.push(`/knowledge/${space.id}`)
  } catch {
    ElMessage.error('创建失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-page">
    <div class="page-header">
      <el-button text @click="router.push('/knowledge')">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
      <h2 class="page-title">新建知识库</h2>
    </div>

    <div class="form-container card">
      <el-form :model="form" label-width="100px" label-position="left">
        <el-form-item label="知识库名称" required>
          <el-input
            v-model="form.spaceName"
            placeholder="请输入知识库名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="知识库编码" required>
          <el-input
            v-model="form.spaceCode"
            placeholder="请输入知识库编码（唯一标识）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入知识库描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Embedding模型" required>
          <el-select v-model="form.embeddingModel" placeholder="请选择Embedding模型" style="width: 100%">
            <el-option
              v-for="model in embeddingModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            >
              <div class="model-option">
                <span class="model-label">{{ model.label }}</span>
                <span class="model-desc">{{ model.desc }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button @click="router.push('/knowledge')">取消</el-button>
            <el-button type="primary" :loading="loading" :disabled="!canSubmit" @click="handleSubmit">
              创建知识库
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.form-container {
  max-width: 800px;
  padding: 32px;
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}

.type-card {
  padding: 16px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-card:hover {
  border-color: #00CFFD;
}

.type-card.active {
  border-color: #00CFFD;
  background: rgba(0, 207, 253, 0.05);
}

.type-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 12px;
  color: #64748B;
}

.model-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.model-label {
  font-weight: 500;
}

.model-desc {
  font-size: 12px;
  color: #94A3B8;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  width: 100%;
  margin-top: 16px;
}
</style>