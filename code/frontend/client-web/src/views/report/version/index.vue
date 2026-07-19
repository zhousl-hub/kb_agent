<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { reportApi } from '@/api/report'
import type { ReportVersion } from '@/types'
import { ElButton, ElCard, ElTable, ElTableColumn, ElCheckbox, ElTag, ElDialog, ElButtonGroup, ElPopconfirm, ElMessage, ElSkeleton } from 'element-plus'
import { Document, View, Edit } from '@element-plus/icons-vue'

const ElMessage = ElMessage

const route = useRoute()
const reportId = route.params.id as string

const loading = ref(false)
const versions = ref<ReportVersion[]>([])
const selectedVersions = ref<number[]>([])
const diffResult = ref('')
const showDiffDialog = ref(false)
const showVersionDialog = ref(false)
const selectedVersionContent = ref('')

async function loadVersions() {
  loading.value = true
  try {
    versions.value = await reportApi.getVersions(reportId)
    // 按版本号降序排列
    versions.value.sort((a, b) => b.version - a.version)
  } catch (error) {
    console.error('加载版本历史失败', error)
    ElMessage.error('加载版本历史失败')
  } finally {
    loading.value = false
  }
}

function toggleVersion(version: number) {
  const index = selectedVersions.value.indexOf(version)
  if (index > -1) {
    selectedVersions.value.splice(index, 1)
  } else {
    if (selectedVersions.value.length >= 2) {
      selectedVersions.value.shift()
    }
    selectedVersions.value.push(version)
  }
}

function clearSelection() {
  selectedVersions.value = []
}

async function handleCompare() {
  if (selectedVersions.value.length !== 2) {
    ElMessage.info('请选择两个版本进行对比')
    return
  }
  const [v1, v2] = selectedVersions.value.slice().sort((a, b) => a - b)
  try {
    const result = await reportApi.compareVersions(reportId, v1, v2)
    diffResult.value = result.diff
    showDiffDialog.value = true
  } catch (error) {
    console.error('对比版本失败', error)
    ElMessage.error('对比版本失败')
  }
}

async function handleCompareWithCurrent(selectedItem: ReportVersion) {
  // 当前版本是最新版本
  const currentVersion = versions.value[0]?.version || 1
  try {
    const result = await reportApi.compareVersions(reportId, selectedItem.version, currentVersion)
    diffResult.value = result.diff
    showDiffDialog.value = true
  } catch (error) {
    console.error('对比版本失败', error)
    ElMessage.error('对比版本失败')
  }
}

async function handleRollback(version: number) {
  try {
    await reportApi.rollback(reportId, version)
    ElMessage.success('回滚成功')
    loadVersions()
  } catch (error) {
    console.error('回滚版本失败', error)
    ElMessage.error('回滚版本失败')
  }
}

function handleView(version: number) {
  const versionDetails = versions.value.find(v => v.version === version)
  if (versionDetails) {
    selectedVersionContent.value = versionDetails.content
    showVersionDialog.value = true
  }
}

function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

function getVersionType(version: number) {
  if (version === 1) {
    return 'info'
  } else if (version === versions.value[0]?.version) {
    return 'danger'
  } else {
    return 'warning'
  }
}

function getVersionLabel(version: number) {
  if (version === 1) {
    return '初始版本'
  } else if (version === versions.value[0]?.version) {
    return '最新版本'
  } else {
    return '中间版本'
  }
}

onMounted(() => {
  loadVersions()
})
</script>

<template>
  <div class="versions-page">
    <div class="page-header mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">版本历史</h1>
        <el-button @click="$router.back()" class="mr-2">返回</el-button>
      </div>
    </div>

    <el-card class="selection-summary mb-6" v-if="selectedVersions.length > 0">
      <div class="flex items-center justify-between">
        <span>请选择两个版本进行对比（已选 {{ selectedVersions.length }}/2）</span>
        <el-button-group>
          <el-button 
            v-if="selectedVersions.length > 0" 
            size="small" 
            @click="clearSelection"
          >
            清除选择
          </el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="selectedVersions.length !== 2"
            @click="handleCompare"
            :icon="Edit"
          >
            对比选中版本
          </el-button>
        </el-button-group>
      </div>
    </el-card>

    <el-skeleton :loading="loading" :rows="5">
      <template #default>
        <el-table
          :data="versions"
          style="width: 100%"
          row-key="id"
          stripe
        >
          <el-table-column width="60">
            <template #header>
              <el-checkbox
                :model-value="selectedVersions.length === versions.length && versions.length > 0"
                @change="(checked) => checked ? selectedVersions.push(...versions.map(v => v.version)) : selectedVersions = []"
              />
            </template>
            <template #default="{ row }">
              <el-checkbox
                :model-value="selectedVersions.includes(row.version)"
                @change="(checked) => checked ? toggleVersion(row.version) : toggleVersion(row.version)"
              />
            </template>
          </el-table-column>

          <el-table-column prop="version" label="版本号" width="100">
            <template #default="{ row }">
              <el-tag type="primary" size="default">v{{ row.version }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="changeSummary" label="变更说明" min-width="200">
            <template #default="{ row }">
              <span>{{ row.changeSummary || '无变更说明' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="创建者" width="150">
            <template #default="{ row }">
              <span>{{ row.createdByName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              <span>{{ formatTime(row.createdAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="版本类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getVersionType(row.version)" size="default">
                {{ getVersionLabel(row.version) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button
                  size="small"
                  :icon="View"
                  @click="handleView(row.version)"
                >
                  查看详情
                </el-button>
                <el-button
                  v-if="row.version !== versions[0]?.version"
                  size="small"
                  type="info"
                  @click="handleCompareWithCurrent(row)"
                >
                  与最新对比
                </el-button>
                <el-popconfirm
                  title="确定要回滚到此版本吗？此举将把报告内容回复至此版本的状态。"
                  @confirm="handleRollback(row.version)"
                >
                  <template #reference>
                    <el-button
                      size="small"
                      type="warning"
                    >
                      版本回滚
                    </el-button>
                  </template>
                </el-popconfirm>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="versions.length === 0" class="empty-state text-center py-12 text-gray-500">
          暂无版本历史
        </div>
      </template>
    </el-skeleton>

    <!-- 版本详情弹窗 -->
    <el-dialog
      v-model="showVersionDialog"
      title="版本内容预览"
      width="60%"
      destroy-on-close
    >
      <div class="version-content-preview">
        <pre class="content-preview-text">{{ selectedVersionContent }}</pre>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showVersionDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 版本对比结果弹窗 -->
    <el-dialog
      v-model="showDiffDialog"
      title="版本对比结果"
      width="70%"
      destroy-on-close
    >
      <div class="diff-result-container">
        <div v-if="diffResult" class="bg-gray-50 p-4 rounded-lg border">
          <h4 class="font-semibold mb-2">差异内容：</h4>
          <pre class="whitespace-pre-wrap break-words text-sm leading-relaxed">{{ diffResult }}</pre>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          <el-skeleton :rows="4" />
          <p class="mt-2">正在计算版本差异...</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDiffDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.versions-page {
  padding: 0;
}

.selection-summary {
  display: flex;
  align-items: center;
}

.diff-result-container {
  max-height: 50vh;
  overflow-y: auto;
}

.content-preview-text {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  max-height: 50vh;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state {
  margin-top: 40px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>

<style scoped>
svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}
</style>