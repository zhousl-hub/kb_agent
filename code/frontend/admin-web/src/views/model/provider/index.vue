<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { modelApi } from '@/api'
import type { ModelProvider, ModelInfo } from '@/api/dify'
import { Plus, Connection, Delete, Cpu, Edit } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const loading = ref(false)
const providers = ref<ModelProvider[]>([])
const testDialogVisible = ref(false)
const selectedProvider = ref<ModelProvider | null>(null)
const testPrompt = ref('你好，请介绍一下你自己。')
const testOutput = ref('')
const testLoading = ref(false)
const connectionTesting = ref<string | null>(null)

const providerDialogVisible = ref(false)
const providerDialogMode = ref<'create' | 'edit'>('create')
const providerFormRef = ref<FormInstance>()
const providerFormLoading = ref(false)

interface ProviderFormData {
  id: string
  name: string
  type: 'local' | 'domestic' | 'international'
  endpoint: string
  apiKey: string
  models: ModelInfo[]
}

const providerForm = reactive<ProviderFormData>({
  id: '',
  name: '',
  type: 'international',
  endpoint: '',
  apiKey: '',
  models: [],
})

interface ModelFormData {
  id: string
  name: string
  contextLength: number
  maxOutputTokens: number
  supportsFunctionCall: boolean
  supportsVision: boolean
  inputPrice: number
  outputPrice: number
}

const modelDialogVisible = ref(false)
const modelFormRef = ref<FormInstance>()
const modelForm = reactive<ModelFormData>({
  id: '',
  name: '',
  contextLength: 4096,
  maxOutputTokens: 2048,
  supportsFunctionCall: false,
  supportsVision: false,
  inputPrice: 0,
  outputPrice: 0,
})

const providerRules: FormRules = {
  name: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度为2-50个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择供应商类型', trigger: 'change' }],
  endpoint: [
    { required: true, message: '请输入API地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' },
  ],
  apiKey: [{ required: true, message: '请输入API Key', trigger: 'blur' }],
}

const modelRules: FormRules = {
  name: [
    { required: true, message: '请输入模型名称', trigger: 'blur' },
  ],
  contextLength: [
    { required: true, message: '请输入上下文长度', trigger: 'blur' },
    { type: 'number', min: 1, message: '上下文长度必须大于0', trigger: 'blur' },
  ],
  maxOutputTokens: [
    { required: true, message: '请输入最大输出Token数', trigger: 'blur' },
    { type: 'number', min: 1, message: '最大输出Token数必须大于0', trigger: 'blur' },
  ],
}

const providerTypeOptions = [
  { label: '本地模型', value: 'local' },
  { label: '国内模型', value: 'domestic' },
  { label: '国际模型', value: 'international' },
]

async function loadProviders() {
  loading.value = true
  try {
    const result = await modelApi.getProviders({ pageNum: 1, pageSize: 100 })
    providers.value = result.list
  } catch (error) {
    console.error('加载模型供应商失败', error)
  } finally {
    loading.value = false
  }
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    local: '本地模型',
    domestic: '国内模型',
    international: '国际模型',
  }
  return map[type] || type
}

function getTypeTagType(type: string) {
  const map: Record<string, string> = {
    local: 'success',
    domestic: 'warning',
    international: 'primary',
  }
  return map[type] || 'info'
}

function openCreateDialog() {
  providerDialogMode.value = 'create'
  resetProviderForm()
  providerDialogVisible.value = true
}

function openEditDialog(provider: ModelProvider) {
  providerDialogMode.value = 'edit'
  resetProviderForm()
  providerForm.id = provider.id
  providerForm.name = provider.name
  providerForm.type = provider.type
  providerForm.endpoint = provider.endpoint
  providerForm.apiKey = provider.config?.apiKey || ''
  providerForm.models = [...(provider.models || [])]
  providerDialogVisible.value = true
}

function resetProviderForm() {
  providerForm.id = ''
  providerForm.name = ''
  providerForm.type = 'international'
  providerForm.endpoint = ''
  providerForm.apiKey = ''
  providerForm.models = []
  providerFormRef.value?.resetFields()
}

async function handleProviderSubmit() {
  if (!providerFormRef.value) return
  
  await providerFormRef.value.validate()
  providerFormLoading.value = true

  try {
    const submitData = {
      name: providerForm.name,
      type: providerForm.type,
      endpoint: providerForm.endpoint,
      config: { apiKey: providerForm.apiKey },
      models: providerForm.models,
    }

    if (providerDialogMode.value === 'create') {
      await modelApi.createProvider(submitData)
      ElMessage.success('供应商创建成功')
    } else {
      await modelApi.updateProvider(providerForm.id, submitData)
      ElMessage.success('供应商更新成功')
    }
    
    providerDialogVisible.value = false
    loadProviders()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    providerFormLoading.value = false
  }
}

async function handleDeleteProvider(provider: ModelProvider) {
  try {
    await ElMessageBox.confirm(
      `确定要删除供应商 "${provider.name}" 吗？`,
      '删除确认',
      { type: 'warning' }
    )
    await modelApi.deleteProvider(provider.id)
    ElMessage.success('删除成功')
    loadProviders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

async function handleTestConnection(provider: ModelProvider) {
  connectionTesting.value = provider.id
  try {
    const result = await modelApi.testProvider(provider.id)
    ElMessage.success(`连接成功，延迟 ${result.latency}ms`)
    loadProviders()
  } catch (error: any) {
    ElMessage.error(error.message || '连接失败')
  } finally {
    connectionTesting.value = null
  }
}

function openTestDialog(provider: ModelProvider) {
  selectedProvider.value = provider
  testOutput.value = ''
  testDialogVisible.value = true
}

async function handleTestInference() {
  if (!selectedProvider.value) return
  testLoading.value = true
  try {
    const result = await modelApi.testInference(selectedProvider.value.id, testPrompt.value)
    testOutput.value = result.output
    ElMessage.success(`推理完成，消耗 ${result.tokens} tokens`)
  } catch (error: any) {
    ElMessage.error(error.message || '推理测试失败')
  } finally {
    testLoading.value = false
  }
}

function openModelDialog() {
  resetModelForm()
  modelDialogVisible.value = true
}

function resetModelForm() {
  modelForm.id = ''
  modelForm.name = ''
  modelForm.contextLength = 4096
  modelForm.maxOutputTokens = 2048
  modelForm.supportsFunctionCall = false
  modelForm.supportsVision = false
  modelForm.inputPrice = 0
  modelForm.outputPrice = 0
  modelFormRef.value?.resetFields()
}

function handleAddModel() {
  if (!modelForm.name) {
    ElMessage.warning('请输入模型名称')
    return
  }
  
  const newModel: ModelInfo = {
    id: modelForm.id || `model_${Date.now()}`,
    name: modelForm.name,
    contextLength: modelForm.contextLength,
    maxOutputTokens: modelForm.maxOutputTokens,
    supportsFunctionCall: modelForm.supportsFunctionCall,
    supportsVision: modelForm.supportsVision,
    inputPrice: modelForm.inputPrice,
    outputPrice: modelForm.outputPrice,
  }
  
  const existIndex = providerForm.models.findIndex(m => m.name === newModel.name)
  if (existIndex > -1) {
    providerForm.models[existIndex] = newModel
    ElMessage.success('模型已更新')
  } else {
    providerForm.models.push(newModel)
    ElMessage.success('模型已添加')
  }
  
  modelDialogVisible.value = false
}

function handleRemoveModel(index: number) {
  providerForm.models.splice(index, 1)
}

function editModel(model: ModelInfo) {
  modelForm.id = model.id
  modelForm.name = model.name
  modelForm.contextLength = model.contextLength
  modelForm.maxOutputTokens = model.maxOutputTokens
  modelForm.supportsFunctionCall = model.supportsFunctionCall
  modelForm.supportsVision = model.supportsVision
  modelForm.inputPrice = model.inputPrice
  modelForm.outputPrice = model.outputPrice
  modelDialogVisible.value = true
}

onMounted(() => {
  loadProviders()
})
</script>

<template>
  <div class="model-provider">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>模型供应商管理</span>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增供应商</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col v-for="provider in providers" :key="provider.id" :span="8">
          <el-card class="provider-card" shadow="hover">
            <div class="provider-header">
              <div class="provider-icon">
                <el-icon :size="28"><Cpu /></el-icon>
              </div>
              <div class="provider-info">
                <div class="provider-name">{{ provider.name }}</div>
                <el-tag :type="getTypeTagType(provider.type)" size="small">
                  {{ getTypeText(provider.type) }}
                </el-tag>
              </div>
            </div>

            <div class="provider-status">
              <span :class="['status-dot', provider.status]"></span>
              <span>{{ provider.status === 'connected' ? '已连接' : provider.status === 'error' ? '连接错误' : '未连接' }}</span>
              <span v-if="provider.latency" class="latency">{{ provider.latency }}ms</span>
            </div>

            <div class="provider-models">
              <el-tag v-for="model in provider.models.slice(0, 3)" :key="model.id" size="small" class="model-tag">
                {{ model.name }}
              </el-tag>
              <el-tag v-if="provider.models.length > 3" size="small" type="info">
                +{{ provider.models.length - 3 }}
              </el-tag>
            </div>

            <div class="provider-actions">
              <el-button 
                text 
                type="primary" 
                :loading="connectionTesting === provider.id"
                @click="handleTestConnection(provider)"
              >
                <el-icon><Connection /></el-icon> 连通性测试
              </el-button>
              <el-button text @click="openTestDialog(provider)">推理测试</el-button>
              <el-button text :icon="Edit" @click="openEditDialog(provider)" />
              <el-button text type="danger" :icon="Delete" @click="handleDeleteProvider(provider)" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 新增/编辑供应商弹窗 -->
    <el-dialog
      v-model="providerDialogVisible"
      :title="providerDialogMode === 'create' ? '新增供应商' : '编辑供应商'"
      width="650px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="providerFormRef"
        :model="providerForm"
        :rules="providerRules"
        label-width="100px"
      >
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="providerForm.name" placeholder="请输入供应商名称" />
        </el-form-item>
        
        <el-form-item label="供应商类型" prop="type">
          <el-select v-model="providerForm.type" placeholder="请选择供应商类型" style="width: 100%">
            <el-option
              v-for="item in providerTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="API地址" prop="endpoint">
          <el-input v-model="providerForm.endpoint" placeholder="请输入API地址，如 https://api.openai.com/v1" />
        </el-form-item>
        
        <el-form-item label="API Key" prop="apiKey">
          <el-input 
            v-model="providerForm.apiKey" 
            type="password" 
            show-password
            placeholder="请输入API Key" 
          />
        </el-form-item>
        
        <el-form-item label="模型列表">
          <div class="model-list">
            <div v-for="(model, index) in providerForm.models" :key="model.id" class="model-item">
              <span class="model-name">{{ model.name }}</span>
              <span class="model-info">{{ model.contextLength }} context | {{ model.maxOutputTokens }} output</span>
              <el-button text size="small" @click="editModel(model)">编辑</el-button>
              <el-button text type="danger" size="small" @click="handleRemoveModel(index)">删除</el-button>
            </div>
            <el-button type="primary" plain size="small" @click="openModelDialog">
              <el-icon><Plus /></el-icon> 添加模型
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="providerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="providerFormLoading" @click="handleProviderSubmit">
          {{ providerDialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加模型弹窗 -->
    <el-dialog
      v-model="modelDialogVisible"
      title="添加模型"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="modelFormRef"
        :model="modelForm"
        :rules="modelRules"
        label-width="120px"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="modelForm.name" placeholder="如 gpt-4, claude-3-opus" />
        </el-form-item>
        
        <el-form-item label="上下文长度" prop="contextLength">
          <el-input-number v-model="modelForm.contextLength" :min="1" :max="1000000" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="最大输出Token" prop="maxOutputTokens">
          <el-input-number v-model="modelForm.maxOutputTokens" :min="1" :max="1000000" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="支持Function Call">
          <el-switch v-model="modelForm.supportsFunctionCall" />
        </el-form-item>
        
        <el-form-item label="支持视觉">
          <el-switch v-model="modelForm.supportsVision" />
        </el-form-item>
        
        <el-form-item label="输入价格">
          <el-input-number 
            v-model="modelForm.inputPrice" 
            :min="0" 
            :precision="6" 
            :step="0.0001"
            style="width: 100%" 
          />
          <div class="form-tip">每1000 tokens价格（美元）</div>
        </el-form-item>
        
        <el-form-item label="输出价格">
          <el-input-number 
            v-model="modelForm.outputPrice" 
            :min="0" 
            :precision="6" 
            :step="0.0001"
            style="width: 100%" 
          />
          <div class="form-tip">每1000 tokens价格（美元）</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="modelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddModel">确定</el-button>
      </template>
    </el-dialog>

    <!-- 推理测试弹窗 -->
    <el-dialog v-model="testDialogVisible" title="推理测试" width="600px">
      <div v-if="selectedProvider" class="test-provider-info">
        <el-tag :type="getTypeTagType(selectedProvider.type)" size="small">
          {{ getTypeText(selectedProvider.type) }}
        </el-tag>
        <span class="provider-name">{{ selectedProvider.name }}</span>
      </div>
      
      <el-form label-width="80px">
        <el-form-item label="输入提示">
          <el-input v-model="testPrompt" type="textarea" :rows="3" placeholder="请输入提示词进行测试" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="testLoading" @click="handleTestInference">
            执行推理
          </el-button>
        </el-form-item>
        <el-form-item v-if="testOutput" label="输出结果">
          <pre class="test-output">{{ testOutput }}</pre>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
export default { name: 'ModelProvider' }
</script>

<style lang="scss" scoped>
.model-provider {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .provider-card {
    margin-bottom: 20px;

    .provider-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .provider-icon {
        width: 48px;
        height: 48px;
        background: #f0f2f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        color: var(--el-color-primary);
      }

      .provider-info {
        .provider-name {
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 4px;
        }
      }
    }

    .provider-status {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #909399;
      margin-bottom: 15px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;

        &.connected { background: #67C23A; }
        &.disconnected { background: #909399; }
        &.error { background: #F56C6C; }
      }

      .latency {
        margin-left: auto;
        color: var(--el-color-primary);
      }
    }

    .provider-models {
      margin-bottom: 15px;

      .model-tag {
        margin-right: 5px;
        margin-bottom: 5px;
      }
    }

    .provider-actions {
      border-top: 1px solid #eee;
      padding-top: 10px;
      display: flex;
      flex-wrap: wrap;
    }
  }

  .model-list {
    width: 100%;
    
    .model-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 8px;
      
      .model-name {
        font-weight: 500;
        margin-right: 12px;
      }
      
      .model-info {
        color: #909399;
        font-size: 12px;
        flex: 1;
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .test-provider-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    
    .provider-name {
      font-weight: 500;
    }
  }

  .test-output {
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
    max-height: 300px;
    overflow-y: auto;
    margin: 0;
    width: 100%;
  }
}
</style>