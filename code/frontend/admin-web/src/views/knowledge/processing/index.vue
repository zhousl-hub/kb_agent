<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Setting,
  Document,
  Collection,
  PriceTag,
  View,
  Refresh,
  Cpu,
  DataAnalysis,
} from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api'
import type { SplitStrategy, MetadataRule, KnowledgeTag, KnowledgeSpace } from '@/api/knowledge'

const activeTab = ref('split')
const loading = ref(false)
const selectedStrategyId = ref<string | null>(null)

const splitStrategies = ref<SplitStrategy[]>([])
const metadataRules = ref<MetadataRule[]>([])
const tags = ref<KnowledgeTag[]>([])
const spaces = ref<KnowledgeSpace[]>([])

const splitDialogVisible = ref(false)
const metadataDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const previewDialogVisible = ref(false)

const splitFormRef = ref<FormInstance>()
const metadataFormRef = ref<FormInstance>()
const tagFormRef = ref<FormInstance>()

const splitForm = ref<Partial<SplitStrategy>>({
  name: '',
  description: '',
  type: 'fixed',
  enabled: true,
  config: {
    chunkSize: 500,
    chunkOverlap: 50,
    separator: '\n\n',
    preserveParagraph: true,
    semanticModel: 'text-embedding-ada-002',
    customScript: '',
  },
})

const metadataForm = ref<Partial<MetadataRule>>({
  name: '',
  field: '',
  label: '',
  type: 'regex',
  pattern: '',
  auto: true,
  required: false,
})

const tagForm = ref<Partial<KnowledgeTag>>({
  name: '',
  type: '',
  color: '#409EFF',
  description: '',
  spaceIds: [],
})

const previewText = ref('')
const previewChunks = ref<string[]>([])
const previewLoading = ref(false)

const embeddingModels = [
  { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002', dimension: 1536 },
  { label: 'text-embedding-3-small', value: 'text-embedding-3-small', dimension: 1536 },
  { label: 'text-embedding-3-large', value: 'text-embedding-3-large', dimension: 3072 },
  { label: 'bge-large-zh', value: 'bge-large-zh', dimension: 1024 },
  { label: 'bge-m3', value: 'bge-m3', dimension: 1024 },
  { label: 'glm-4-embedding', value: 'glm-4-embedding', dimension: 1024 },
]

const splitRules: FormRules = {
  name: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择分片方式', trigger: 'change' }],
}

const metadataRules_: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  field: [{ required: true, message: '请输入字段名', trigger: 'blur' }],
  label: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择提取方式', trigger: 'change' }],
}

const tagRules: FormRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择标签类型', trigger: 'change' }],
}

const tagTypes = [
  { label: '分类标签', value: 'category' },
  { label: '业务标签', value: 'business' },
  { label: '技术标签', value: 'tech' },
  { label: '状态标签', value: 'status' },
  { label: '其他', value: 'other' },
]

const presetColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#00D4AA', '#9B59B6', '#3498DB', '#1ABC9C', '#E74C3C',
]

const splitTypeOptions = [
  { label: '固定长度分片', value: 'fixed', description: '按固定字符数切分文档' },
  { label: '语义分片', value: 'semantic', description: '基于语义边界智能切分' },
  { label: '自定义分片', value: 'custom', description: '使用自定义脚本切分' },
]

const metadataTypeOptions = [
  { label: '正则表达式', value: 'regex' },
  { label: 'XPath提取', value: 'xpath' },
  { label: 'LLM提取', value: 'llm' },
  { label: '内置字段', value: 'builtin' },
]

const editingId = ref<string | null>(null)

const selectedStrategy = computed(() => {
  if (!selectedStrategyId.value) return null
  return splitStrategies.value.find(s => s.id === selectedStrategyId.value) || null
})

const selectedEmbeddingDimension = computed(() => {
  const model = embeddingModels.find(m => m.value === splitForm.value.config?.semanticModel)
  return model?.dimension || 1536
})

watch(selectedStrategyId, (id) => {
  if (id) {
    const strategy = splitStrategies.value.find(s => s.id === id)
    if (strategy) {
      splitForm.value = JSON.parse(JSON.stringify(strategy))
    }
  }
})

async function loadSplitStrategies() {
  loading.value = true
  try {
    const result = await knowledgeApi.getSplitStrategies({ pageNum: 1, pageSize: 100 })
    splitStrategies.value = result.list
    if (result.list.length > 0 && !selectedStrategyId.value) {
      selectedStrategyId.value = result.list[0].id
    }
  } catch {
    splitStrategies.value = getMockSplitStrategies()
    if (splitStrategies.value.length > 0) {
      selectedStrategyId.value = splitStrategies.value[0].id
    }
  } finally {
    loading.value = false
  }
}

async function loadMetadataRules() {
  try {
    const result = await knowledgeApi.getMetadataRules({ pageNum: 1, pageSize: 100 })
    metadataRules.value = result.list
  } catch {
    metadataRules.value = getMockMetadataRules()
  }
}

async function loadTags() {
  try {
    const result = await knowledgeApi.getTags({ pageNum: 1, pageSize: 100 })
    tags.value = result.list
  } catch {
    tags.value = getMockTags()
  }
}

async function loadSpaces() {
  try {
    const result = await knowledgeApi.getSpaces({ pageNum: 1, pageSize: 100 })
    spaces.value = result.list
  } catch {
    spaces.value = [
      { id: '1', name: '产品文档', type: 'document', documentCount: 120, segmentCount: 1500, status: 'active', createdAt: '', updatedAt: '' },
      { id: '2', name: 'FAQ知识库', type: 'faq', documentCount: 50, segmentCount: 800, status: 'active', createdAt: '', updatedAt: '' },
      { id: '3', name: '技术文档', type: 'document', documentCount: 80, segmentCount: 1200, status: 'active', createdAt: '', updatedAt: '' },
    ]
  }
}

function getMockSplitStrategies(): SplitStrategy[] {
  return [
    { id: '1', name: '默认固定分片', description: '按固定字符数切分文档，适用于大多数场景', type: 'fixed', enabled: true, config: { chunkSize: 500, chunkOverlap: 50 }, createdAt: '', updatedAt: '' },
    { id: '2', name: '智能语义分片', description: '基于语义边界智能切分，保持内容完整性', type: 'semantic', enabled: true, config: { semanticModel: 'text-embedding-ada-002' }, createdAt: '', updatedAt: '' },
    { id: '3', name: '段落分片', description: '按段落边界切分文档，适合长文档', type: 'fixed', enabled: false, config: { chunkSize: 800, separator: '\n\n', preserveParagraph: true }, createdAt: '', updatedAt: '' },
    { id: '4', name: '大块分片', description: '较大的分片尺寸，适合技术文档', type: 'fixed', enabled: true, config: { chunkSize: 1000, chunkOverlap: 100 }, createdAt: '', updatedAt: '' },
  ]
}

function getMockMetadataRules(): MetadataRule[] {
  return [
    { id: '1', name: '文档来源', field: 'source', label: '来源', type: 'builtin', auto: true, required: true, createdAt: '', updatedAt: '' },
    { id: '2', name: '作者信息', field: 'author', label: '作者', type: 'regex', pattern: '作者[：:]\\s*(.+)', auto: true, required: false, createdAt: '', updatedAt: '' },
    { id: '3', name: '部门信息', field: 'department', label: '部门', type: 'regex', pattern: '部门[：:]\\s*(.+)', auto: true, required: false, createdAt: '', updatedAt: '' },
    { id: '4', name: '密级标识', field: 'securityLevel', label: '密级', type: 'llm', llmPrompt: '提取文档密级信息', auto: false, required: false, createdAt: '', updatedAt: '' },
    { id: '5', name: '文档标题', field: 'title', label: '标题', type: 'xpath', xpath: '//h1', auto: true, required: true, createdAt: '', updatedAt: '' },
  ]
}

function getMockTags(): KnowledgeTag[] {
  return [
    { id: '1', name: '产品手册', type: 'category', color: '#409EFF', documentCount: 45, spaceIds: ['1'], createdAt: '', updatedAt: '' },
    { id: '2', name: 'API文档', type: 'tech', color: '#67C23A', documentCount: 32, spaceIds: ['3'], createdAt: '', updatedAt: '' },
    { id: '3', name: '常见问题', type: 'business', color: '#E6A23C', documentCount: 28, spaceIds: ['2'], createdAt: '', updatedAt: '' },
    { id: '4', name: '内部资料', type: 'status', color: '#F56C6C', documentCount: 15, spaceIds: ['1', '3'], createdAt: '', updatedAt: '' },
  ]
}

function selectStrategy(id: string) {
  selectedStrategyId.value = id
}

function openSplitDialog(data?: SplitStrategy) {
  if (data) {
    editingId.value = data.id
    splitForm.value = JSON.parse(JSON.stringify(data))
  } else {
    editingId.value = null
    splitForm.value = {
      name: '',
      description: '',
      type: 'fixed',
      enabled: true,
      config: { chunkSize: 500, chunkOverlap: 50, separator: '\n\n', preserveParagraph: true, semanticModel: 'text-embedding-ada-002', customScript: '' },
    }
  }
  splitDialogVisible.value = true
}

async function saveSplitStrategy() {
  const valid = await splitFormRef.value?.validate()
  if (!valid) return

  try {
    if (editingId.value) {
      await knowledgeApi.updateSplitStrategy(editingId.value, splitForm.value)
      ElMessage.success('更新成功')
    } else {
      await knowledgeApi.createSplitStrategy(splitForm.value)
      ElMessage.success('创建成功')
    }
    splitDialogVisible.value = false
    loadSplitStrategies()
  } catch {
    const index = splitStrategies.value.findIndex(s => s.id === editingId.value)
    if (index > -1) {
      splitStrategies.value[index] = { ...splitStrategies.value[index], ...splitForm.value } as SplitStrategy
    } else {
      const newStrategy = { ...splitForm.value, id: Date.now().toString(), createdAt: '', updatedAt: '' } as SplitStrategy
      splitStrategies.value.push(newStrategy)
      selectedStrategyId.value = newStrategy.id
    }
    ElMessage.success(editingId.value ? '更新成功' : '创建成功')
    splitDialogVisible.value = false
  }
}

async function deleteSplitStrategy(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除该分片策略吗？', '提示', { type: 'warning' })
    await knowledgeApi.deleteSplitStrategy(id)
    ElMessage.success('删除成功')
    if (selectedStrategyId.value === id) {
      selectedStrategyId.value = splitStrategies.value[0]?.id || null
    }
    loadSplitStrategies()
  } catch {
    if (id) {
      splitStrategies.value = splitStrategies.value.filter(s => s.id !== id)
      if (selectedStrategyId.value === id) {
        selectedStrategyId.value = splitStrategies.value[0]?.id || null
      }
      ElMessage.success('删除成功')
    }
  }
}

function openPreviewDialog() {
  previewText.value = ''
  previewChunks.value = []
  previewDialogVisible.value = true
}

async function handlePreview() {
  if (!previewText.value.trim()) {
    ElMessage.warning('请输入预览文本')
    return
  }
  
  previewLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    const chunkSize = splitForm.value.config?.chunkSize || 500
    const overlap = splitForm.value.config?.chunkOverlap || 50
    const text = previewText.value
    const chunks: string[] = []
    let start = 0
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      chunks.push(text.slice(start, end))
      start = end - overlap
      if (start >= text.length - overlap) break
    }
    previewChunks.value = chunks
  } finally {
    previewLoading.value = false
  }
}

function openMetadataDialog(data?: MetadataRule) {
  if (data) {
    editingId.value = data.id
    metadataForm.value = JSON.parse(JSON.stringify(data))
  } else {
    editingId.value = null
    metadataForm.value = { name: '', field: '', label: '', type: 'regex', pattern: '', auto: true, required: false }
  }
  metadataDialogVisible.value = true
}

async function saveMetadataRule() {
  const valid = await metadataFormRef.value?.validate()
  if (!valid) return

  try {
    if (editingId.value) {
      await knowledgeApi.updateMetadataRule(editingId.value, metadataForm.value)
      ElMessage.success('更新成功')
    } else {
      await knowledgeApi.createMetadataRule(metadataForm.value)
      ElMessage.success('创建成功')
    }
    metadataDialogVisible.value = false
    loadMetadataRules()
  } catch {
    const index = metadataRules.value.findIndex(r => r.id === editingId.value)
    if (index > -1) {
      metadataRules.value[index] = { ...metadataRules.value[index], ...metadataForm.value } as MetadataRule
    } else {
      metadataRules.value.push({ ...metadataForm.value, id: Date.now().toString(), createdAt: '', updatedAt: '' } as MetadataRule)
    }
    ElMessage.success(editingId.value ? '更新成功' : '创建成功')
    metadataDialogVisible.value = false
  }
}

async function deleteMetadataRule(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除该元数据规则吗？', '提示', { type: 'warning' })
    await knowledgeApi.deleteMetadataRule(id)
    ElMessage.success('删除成功')
    loadMetadataRules()
  } catch {
    if (id) {
      metadataRules.value = metadataRules.value.filter(r => r.id !== id)
      ElMessage.success('删除成功')
    }
  }
}

function openTagDialog(data?: KnowledgeTag) {
  if (data) {
    editingId.value = data.id
    tagForm.value = JSON.parse(JSON.stringify(data))
  } else {
    editingId.value = null
    tagForm.value = { name: '', type: '', color: '#409EFF', description: '', spaceIds: [] }
  }
  tagDialogVisible.value = true
}

async function saveTag() {
  const valid = await tagFormRef.value?.validate()
  if (!valid) return

  try {
    if (editingId.value) {
      await knowledgeApi.updateTag(editingId.value, tagForm.value)
      ElMessage.success('更新成功')
    } else {
      await knowledgeApi.createTag(tagForm.value)
      ElMessage.success('创建成功')
    }
    tagDialogVisible.value = false
    loadTags()
  } catch {
    const index = tags.value.findIndex(t => t.id === editingId.value)
    if (index > -1) {
      tags.value[index] = { ...tags.value[index], ...tagForm.value } as KnowledgeTag
    } else {
      tags.value.push({ ...tagForm.value, id: Date.now().toString(), documentCount: 0, createdAt: '', updatedAt: '' } as KnowledgeTag)
    }
    ElMessage.success(editingId.value ? '更新成功' : '创建成功')
    tagDialogVisible.value = false
  }
}

async function deleteTag(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除该标签吗？', '提示', { type: 'warning' })
    await knowledgeApi.deleteTag(id)
    ElMessage.success('删除成功')
    loadTags()
  } catch {
    if (id) {
      tags.value = tags.value.filter(t => t.id !== id)
      ElMessage.success('删除成功')
    }
  }
}

function getSplitTypeText(type: string) {
  const map: Record<string, string> = { fixed: '固定长度', semantic: '语义分片', custom: '自定义' }
  return map[type] || type
}

function getSplitTypeTag(type: string) {
  const map: Record<string, string> = { fixed: '', semantic: 'success', custom: 'warning' }
  return map[type] || ''
}

function getMetadataTypeText(type: string) {
  const map: Record<string, string> = { regex: '正则表达式', xpath: 'XPath', llm: 'LLM提取', builtin: '内置字段' }
  return map[type] || type
}

function getTagTypeText(type: string) {
  const map: Record<string, string> = { category: '分类', business: '业务', tech: '技术', status: '状态', other: '其他' }
  return map[type] || type
}

function getSpaceNames(spaceIds: string[]) {
  return spaceIds.map(id => spaces.value.find(s => s.id === id)?.name || id).join('、')
}

onMounted(() => {
  loadSplitStrategies()
  loadMetadataRules()
  loadTags()
  loadSpaces()
})
</script>

<template>
  <div class="knowledge-processing">
    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="分片策略" name="split">
        <div class="split-layout">
          <div class="strategy-list-panel">
            <div class="panel-header">
              <span class="panel-title">策略列表</span>
              <el-button type="primary" :icon="Plus" size="small" @click="openSplitDialog()">新建</el-button>
            </div>
            
            <div class="strategy-list" v-loading="loading">
              <div
                v-for="strategy in splitStrategies"
                :key="strategy.id"
                :class="['strategy-item', { active: selectedStrategyId === strategy.id }]"
                @click="selectStrategy(strategy.id)"
              >
                <div class="strategy-item-header">
                  <div class="strategy-item-name">
                    <el-icon class="strategy-icon"><Setting /></el-icon>
                    {{ strategy.name }}
                  </div>
                  <el-switch v-model="strategy.enabled" size="small" @click.stop />
                </div>
                <div class="strategy-item-meta">
                  <el-tag :type="getSplitTypeTag(strategy.type)" size="small">{{ getSplitTypeText(strategy.type) }}</el-tag>
                  <span v-if="strategy.type === 'fixed'" class="meta-text">{{ strategy.config?.chunkSize }}字符</span>
                </div>
              </div>
              
              <el-empty v-if="!loading && splitStrategies.length === 0" description="暂无策略" :image-size="80" />
            </div>
          </div>

          <div class="strategy-config-panel">
            <template v-if="selectedStrategy">
              <div class="panel-header">
                <span class="panel-title">策略配置</span>
                <div class="panel-actions">
                  <el-button :icon="View" @click="openPreviewDialog">预览效果</el-button>
                  <el-button :icon="Edit" type="primary" @click="openSplitDialog(selectedStrategy)">编辑</el-button>
                  <el-button :icon="Delete" type="danger" @click="deleteSplitStrategy(selectedStrategy.id)">删除</el-button>
                </div>
              </div>

              <el-form label-width="100px" class="config-form">
                <div class="form-section">
                  <div class="section-title">
                    <el-icon><Document /></el-icon>
                    基本信息
                  </div>
                  <el-form-item label="策略名称">
                    <el-input v-model="splitForm.name" disabled />
                  </el-form-item>
                  <el-form-item label="描述">
                    <el-input v-model="splitForm.description" type="textarea" :rows="2" disabled />
                  </el-form-item>
                  <el-form-item label="分片方式">
                    <el-radio-group v-model="splitForm.type" disabled>
                      <el-radio-button v-for="opt in splitTypeOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </div>

                <div class="form-section">
                  <div class="section-title">
                    <el-icon><DataAnalysis /></el-icon>
                    分片参数
                  </div>
                  <template v-if="splitForm.type === 'fixed'">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="分片大小">
                          <el-input-number v-model="splitForm.config!.chunkSize" :min="100" :max="10000" :step="100" style="width: 100%" disabled />
                          <span class="form-tip">字符数</span>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="重叠大小">
                          <el-input-number v-model="splitForm.config!.chunkOverlap" :min="0" :max="1000" :step="10" style="width: 100%" disabled />
                          <span class="form-tip">字符数</span>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="分隔符">
                      <el-input v-model="splitForm.config!.separator" disabled />
                    </el-form-item>
                    <el-form-item label="保留段落">
                      <el-switch v-model="splitForm.config!.preserveParagraph" disabled />
                    </el-form-item>
                  </template>

                  <template v-else-if="splitForm.type === 'semantic'">
                    <el-form-item label="语义模型">
                      <el-select v-model="splitForm.config!.semanticModel" style="width: 100%" disabled>
                        <el-option v-for="model in embeddingModels" :key="model.value" :label="model.label" :value="model.value" />
                      </el-select>
                    </el-form-item>
                  </template>

                  <template v-else-if="splitForm.type === 'custom'">
                    <el-form-item label="自定义脚本">
                      <el-input v-model="splitForm.config!.customScript" type="textarea" :rows="6" disabled />
                    </el-form-item>
                  </template>
                </div>

                <div class="form-section">
                  <div class="section-title">
                    <el-icon><Cpu /></el-icon>
                    向量化配置
                  </div>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="Embedding模型">
                        <el-select v-model="splitForm.config!.semanticModel" style="width: 100%" disabled>
                          <el-option v-for="model in embeddingModels" :key="model.value" :label="model.label" :value="model.value" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="向量维度">
                        <el-input :value="selectedEmbeddingDimension" disabled>
                          <template #append>维</template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </el-form>
            </template>

            <el-empty v-else description="请从左侧选择一个策略查看详情" />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="元数据规则" name="metadata">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openMetadataDialog()">新建规则</el-button>
        </div>

        <el-table :data="metadataRules" v-loading="loading" stripe>
          <el-table-column prop="name" label="规则名称" width="150" />
          <el-table-column prop="field" label="字段名" width="120" />
          <el-table-column prop="label" label="显示名称" width="120" />
          <el-table-column prop="type" label="提取方式" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ getMetadataTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="配置" min-width="200">
            <template #default="{ row }">
              <span v-if="row.type === 'regex'" class="config-text">{{ row.pattern }}</span>
              <span v-else-if="row.type === 'xpath'" class="config-text">{{ row.xpath }}</span>
              <span v-else-if="row.type === 'llm'" class="config-text">{{ row.llmPrompt }}</span>
              <span v-else class="config-text">系统内置</span>
            </template>
          </el-table-column>
          <el-table-column prop="auto" label="自动提取" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.auto ? 'success' : 'info'" size="small">
                {{ row.auto ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="required" label="必填" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'warning' : 'info'" size="small">
                {{ row.required ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button text type="primary" :icon="Edit" @click="openMetadataDialog(row)">编辑</el-button>
              <el-button text type="danger" :icon="Delete" @click="deleteMetadataRule(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="知识标签" name="tags">
        <div class="toolbar">
          <el-button type="primary" :icon="Plus" @click="openTagDialog()">新建标签</el-button>
        </div>

        <el-row :gutter="20">
          <el-col v-for="tag in tags" :key="tag.id" :span="6">
            <el-card class="tag-card" shadow="hover">
              <div class="tag-header">
                <el-tag :color="tag.color" effect="dark" class="tag-badge">{{ tag.name }}</el-tag>
                <el-dropdown trigger="click">
                  <el-button text :icon="Setting" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :icon="Edit" @click="openTagDialog(tag)">编辑</el-dropdown-item>
                      <el-dropdown-item :icon="Delete" divided @click="deleteTag(tag.id)">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="tag-info">
                <div class="tag-row">
                  <el-icon><Collection /></el-icon>
                  <span>类型: {{ getTagTypeText(tag.type) }}</span>
                </div>
                <div class="tag-row">
                  <el-icon><Document /></el-icon>
                  <span>文档数: {{ tag.documentCount }}</span>
                </div>
                <div class="tag-row">
                  <el-icon><PriceTag /></el-icon>
                  <span>关联: {{ tag.spaceIds.length > 0 ? getSpaceNames(tag.spaceIds) : '未关联' }}</span>
                </div>
              </div>
              <p class="tag-desc">{{ tag.description || '暂无描述' }}</p>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="!loading && tags.length === 0" description="暂无知识标签" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="splitDialogVisible" :title="editingId ? '编辑分片策略' : '新建分片策略'" width="650px" destroy-on-close>
      <el-form ref="splitFormRef" :model="splitForm" :rules="splitRules" label-width="100px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="splitForm.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="分片方式" prop="type">
          <el-radio-group v-model="splitForm.type">
            <el-radio-button v-for="opt in splitTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="splitForm.description" type="textarea" :rows="2" placeholder="请输入策略描述" />
        </el-form-item>
        <el-divider content-position="left">参数配置</el-divider>
        
        <template v-if="splitForm.type === 'fixed'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分片大小">
                <el-input-number v-model="splitForm.config!.chunkSize" :min="100" :max="10000" :step="100" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="重叠大小">
                <el-input-number v-model="splitForm.config!.chunkOverlap" :min="0" :max="1000" :step="10" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="分隔符">
            <el-input v-model="splitForm.config!.separator" placeholder="默认按段落分隔" />
          </el-form-item>
          <el-form-item label="保留段落">
            <el-switch v-model="splitForm.config!.preserveParagraph" />
          </el-form-item>
        </template>

        <template v-else-if="splitForm.type === 'semantic'">
          <el-form-item label="语义模型">
            <el-select v-model="splitForm.config!.semanticModel" style="width: 100%">
              <el-option v-for="model in embeddingModels" :key="model.value" :label="model.label" :value="model.value" />
            </el-select>
          </el-form-item>
        </template>

        <template v-else-if="splitForm.type === 'custom'">
          <el-form-item label="自定义脚本">
            <el-input v-model="splitForm.config!.customScript" type="textarea" :rows="5" placeholder="请输入自定义分片脚本" />
          </el-form-item>
        </template>

        <el-divider content-position="left">向量化配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Embedding模型">
              <el-select v-model="splitForm.config!.semanticModel" style="width: 100%">
                <el-option v-for="model in embeddingModels" :key="model.value" :label="model.label" :value="model.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="向量维度">
              <el-input :value="selectedEmbeddingDimension" disabled>
                <template #append>维</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="启用状态">
          <el-switch v-model="splitForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="splitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSplitStrategy">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewDialogVisible" title="分片预览" width="800px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="预览文本">
          <el-input
            v-model="previewText"
            type="textarea"
            :rows="6"
            placeholder="请输入要预览分片效果的文本内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="previewLoading" @click="handlePreview">
            <el-icon><Refresh /></el-icon>
            开始预览
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="previewChunks.length > 0" class="preview-result">
        <div class="result-header">
          <span>分片结果</span>
          <el-tag>共 {{ previewChunks.length }} 个分片</el-tag>
        </div>
        <div class="chunk-list">
          <div v-for="(chunk, index) in previewChunks" :key="index" class="chunk-item">
            <div class="chunk-header">
              <el-tag type="primary" size="small">分片 {{ index + 1 }}</el-tag>
              <span class="chunk-length">{{ chunk.length }} 字符</span>
            </div>
            <div class="chunk-content">{{ chunk }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="metadataDialogVisible" :title="editingId ? '编辑元数据规则' : '新建元数据规则'" width="550px" destroy-on-close>
      <el-form ref="metadataFormRef" :model="metadataForm" :rules="metadataRules_" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="metadataForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="字段名" prop="field">
          <el-input v-model="metadataForm.field" placeholder="如: author、department" />
        </el-form-item>
        <el-form-item label="显示名称" prop="label">
          <el-input v-model="metadataForm.label" placeholder="如: 作者、部门" />
        </el-form-item>
        <el-form-item label="提取方式" prop="type">
          <el-select v-model="metadataForm.type" style="width: 100%">
            <el-option v-for="opt in metadataTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        
        <template v-if="metadataForm.type === 'regex'">
          <el-form-item label="正则表达式" prop="pattern">
            <el-input v-model="metadataForm.pattern" placeholder="如: 作者[：:]\\s*(.+)" />
          </el-form-item>
        </template>
        
        <template v-else-if="metadataForm.type === 'xpath'">
          <el-form-item label="XPath路径" prop="xpath">
            <el-input v-model="metadataForm.xpath" placeholder="如: //h1" />
          </el-form-item>
        </template>
        
        <template v-else-if="metadataForm.type === 'llm'">
          <el-form-item label="LLM提示词" prop="llmPrompt">
            <el-input v-model="metadataForm.llmPrompt" type="textarea" :rows="3" placeholder="请输入LLM提取提示词" />
          </el-form-item>
        </template>

        <el-form-item label="自动提取">
          <el-switch v-model="metadataForm.auto" />
          <span class="form-tip">是否在文档入库时自动提取</span>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-switch v-model="metadataForm.required" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="metadataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMetadataRule">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="tagDialogVisible" :title="editingId ? '编辑知识标签' : '新建知识标签'" width="500px" destroy-on-close>
      <el-form ref="tagFormRef" :model="tagForm" :rules="tagRules" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签类型" prop="type">
          <el-select v-model="tagForm.type" style="width: 100%">
            <el-option v-for="opt in tagTypes" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签颜色">
          <div class="color-picker">
            <div
              v-for="color in presetColors"
              :key="color"
              class="color-item"
              :class="{ active: tagForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="tagForm.color = color"
            />
          </div>
        </el-form-item>
        <el-form-item label="关联知识库">
          <el-select v-model="tagForm.spaceIds" multiple style="width: 100%" placeholder="请选择关联的知识库">
            <el-option v-for="space in spaces" :key="space.id" :label="space.name" :value="space.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="tagForm.description" type="textarea" :rows="2" placeholder="请输入标签描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTag">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-processing {
  .main-tabs {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
  }

  .toolbar {
    margin-bottom: 20px;
  }

  .split-layout {
    display: flex;
    gap: 20px;
    min-height: 600px;
  }

  .strategy-list-panel {
    width: 300px;
    flex-shrink: 0;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f5f7fa;
      border-radius: 8px 8px 0 0;

      .panel-title {
        font-weight: 600;
        font-size: 15px;
      }
    }

    .strategy-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .strategy-item {
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 8px;
      border: 1px solid transparent;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: #ecf5ff;
        border-color: #409EFF;
      }

      .strategy-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .strategy-item-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;

          .strategy-icon {
            color: #409EFF;
          }
        }
      }

      .strategy-item-meta {
        display: flex;
        align-items: center;
        gap: 8px;

        .meta-text {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .strategy-config-panel {
    flex: 1;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f5f7fa;
      border-radius: 8px 8px 0 0;

      .panel-title {
        font-weight: 600;
        font-size: 15px;
      }

      .panel-actions {
        display: flex;
        gap: 8px;
      }
    }

    .config-form {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
    }
  }

  .form-section {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #e4e7ed;

    &:last-child {
      border-bottom: none;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #303133;
      margin-bottom: 16px;

      .el-icon {
        color: #409EFF;
      }
    }
  }

  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }

  .tag-card {
    margin-bottom: 20px;

    .tag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .tag-badge {
        font-size: 14px;
      }
    }

    .tag-info {
      .tag-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;
        color: #606266;

        .el-icon {
          color: #909399;
        }
      }
    }

    .tag-desc {
      color: #909399;
      font-size: 12px;
      margin-top: 10px;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
  }

  .config-text {
    font-family: monospace;
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }

  .color-picker {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .color-item {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.1);
      }

      &.active {
        border-color: #303133;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .preview-result {
    margin-top: 20px;
    border-top: 1px solid #e4e7ed;
    padding-top: 20px;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-weight: 600;
    }

    .chunk-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .chunk-item {
      background: #f5f7fa;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;

      .chunk-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .chunk-length {
          font-size: 12px;
          color: #909399;
        }
      }

      .chunk-content {
        font-size: 13px;
        line-height: 1.6;
        color: #606266;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
}
</style>