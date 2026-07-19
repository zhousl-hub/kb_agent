<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Filter,
  Refresh,
  View,
  Download,
  Star,
  StarFilled,
  Document,
  Clock,
  FolderOpened,
  Link,
} from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api'
import type { KnowledgeSpace, DataSource } from '@/api/knowledge'

interface SearchResult {
  id: string
  title: string
  summary: string
  content: string
  score: number
  source: string
  sourceType: string
  spaceId: string
  spaceName: string
  fileType: string
  fileSize?: number
  createdAt: string
  isFavorite: boolean
  metadata?: Record<string, any>
}

interface SearchParams {
  keyword: string
  spaceId: string
  dataSourceId: string
  fileType: string
  dateRange: [string, string] | []
  sortBy: 'relevance' | 'time'
}

const loading = ref(false)
const searchParams = ref<SearchParams>({
  keyword: '',
  spaceId: '',
  dataSourceId: '',
  fileType: '',
  dateRange: [],
  sortBy: 'relevance',
})

const knowledgeSpaces = ref<KnowledgeSpace[]>([])
const dataSources = ref<DataSource[]>([])
const searchResults = ref<SearchResult[]>([])
const pagination = ref({
  pageNum: 1,
  pageSize: 12,
  total: 0,
})

const showAdvancedFilter = ref(false)
const selectedResult = ref<SearchResult | null>(null)
const detailDialogVisible = ref(false)

const fileTypes = [
  { label: '全部类型', value: '' },
  { label: 'PDF文档', value: 'pdf' },
  { label: 'Word文档', value: 'doc' },
  { label: 'Excel表格', value: 'xls' },
  { label: 'TXT文本', value: 'txt' },
  { label: 'Markdown', value: 'md' },
  { label: '网页', value: 'html' },
]

const sortOptions = [
  { label: '相关度', value: 'relevance' },
  { label: '时间', value: 'time' },
]

const hasSearched = computed(() => searchResults.value.length > 0 || loading.value)

async function loadKnowledgeSpaces() {
  try {
    const result = await knowledgeApi.getSpaces({ pageNum: 1, pageSize: 100 })
    knowledgeSpaces.value = result.list
  } catch {
    knowledgeSpaces.value = getMockSpaces()
  }
}

async function loadDataSources() {
  try {
    const result = await knowledgeApi.getDataSources({ pageNum: 1, pageSize: 100 })
    dataSources.value = result.list
  } catch {
    dataSources.value = getMockDataSources()
  }
}

function getMockSpaces(): KnowledgeSpace[] {
  return [
    { id: '1', name: '产品文档', type: 'document', documentCount: 120, segmentCount: 1500, status: 'active', createdAt: '', updatedAt: '' },
    { id: '2', name: 'FAQ知识库', type: 'faq', documentCount: 50, segmentCount: 800, status: 'active', createdAt: '', updatedAt: '' },
    { id: '3', name: '技术文档', type: 'document', documentCount: 80, segmentCount: 1200, status: 'active', createdAt: '', updatedAt: '' },
    { id: '4', name: '营销资料', type: 'document', documentCount: 35, segmentCount: 420, status: 'active', createdAt: '', updatedAt: '' },
  ]
}

function getMockDataSources(): DataSource[] {
  return [
    { id: '1', name: '本地文档库', type: 'upload', config: {}, status: 'connected', createdAt: '' },
    { id: '2', name: '数据库同步', type: 'database', config: {}, status: 'connected', createdAt: '' },
    { id: '3', name: 'Confluence', type: 'web', config: {}, status: 'connected', createdAt: '' },
  ]
}

function getMockSearchResults(): SearchResult[] {
  return [
    {
      id: '1',
      title: '产品功能介绍文档',
      summary: '本文档详细介绍了产品的核心功能模块，包括用户管理、权限控制、数据分析和报表生成等主要功能。产品采用微服务架构设计，支持高并发访问...',
      content: '本文档详细介绍了产品的核心功能模块，包括用户管理、权限控制、数据分析和报表生成等主要功能。产品采用微服务架构设计，支持高并发访问，具有良好的扩展性和稳定性。系统提供了完善的API接口，方便第三方系统集成。',
      score: 0.95,
      source: '产品功能说明.pdf',
      sourceType: 'upload',
      spaceId: '1',
      spaceName: '产品文档',
      fileType: 'pdf',
      fileSize: 2048576,
      createdAt: '2026-03-10 14:30:00',
      isFavorite: true,
      metadata: { author: '张三', department: '产品部' },
    },
    {
      id: '2',
      title: 'API接口开发指南',
      summary: 'API接口开发规范文档，包含接口设计原则、请求响应格式、错误码定义、认证授权机制等内容。适用于前后端开发人员进行接口对接...',
      content: 'API接口开发规范文档，包含接口设计原则、请求响应格式、错误码定义、认证授权机制等内容。适用于前后端开发人员进行接口对接。文档采用OpenAPI 3.0规范编写，支持Swagger在线调试。',
      score: 0.89,
      source: '开发文档/接口规范.md',
      sourceType: 'upload',
      spaceId: '3',
      spaceName: '技术文档',
      fileType: 'md',
      fileSize: 102400,
      createdAt: '2026-03-09 10:15:00',
      isFavorite: false,
      metadata: { author: '李四', department: '研发部' },
    },
    {
      id: '3',
      title: '系统部署手册',
      summary: '系统部署操作手册，涵盖环境准备、安装配置、服务启动、健康检查等完整部署流程。支持Docker容器化部署和传统部署两种方式...',
      content: '系统部署操作手册，涵盖环境准备、安装配置、服务启动、健康检查等完整部署流程。支持Docker容器化部署和传统部署两种方式。文档详细说明了各个配置参数的含义和推荐值。',
      score: 0.85,
      source: '运维文档.docx',
      sourceType: 'upload',
      spaceId: '3',
      spaceName: '技术文档',
      fileType: 'doc',
      fileSize: 512000,
      createdAt: '2026-03-08 16:45:00',
      isFavorite: false,
      metadata: { author: '王五', department: '运维部' },
    },
    {
      id: '4',
      title: '常见问题解答FAQ',
      summary: '用户常见问题整理，包含账号注册、密码重置、功能使用、权限申请等高频问题的解答。定期更新维护，确保信息准确...',
      content: '用户常见问题整理，包含账号注册、密码重置、功能使用、权限申请等高频问题的解答。定期更新维护，确保信息准确。每个问题都配有详细的操作截图和步骤说明。',
      score: 0.82,
      source: 'FAQ知识库.xlsx',
      sourceType: 'upload',
      spaceId: '2',
      spaceName: 'FAQ知识库',
      fileType: 'xls',
      fileSize: 256000,
      createdAt: '2026-03-07 09:20:00',
      isFavorite: true,
      metadata: { author: '客服组', department: '客服部' },
    },
    {
      id: '5',
      title: '数据分析报告模板',
      summary: '标准数据分析报告模板，包含数据概览、趋势分析、异常检测、改进建议等章节。适用于月度/季度业务分析汇报...',
      content: '标准数据分析报告模板，包含数据概览、趋势分析、异常检测、改进建议等章节。适用于月度/季度业务分析汇报。模板内置多种图表样式和数据可视化方案。',
      score: 0.78,
      source: '模板库/分析报告.xlsx',
      sourceType: 'upload',
      spaceId: '4',
      spaceName: '营销资料',
      fileType: 'xls',
      fileSize: 128000,
      createdAt: '2026-03-06 11:30:00',
      isFavorite: false,
      metadata: { author: '分析组', department: '数据部' },
    },
    {
      id: '6',
      title: '安全合规指南',
      summary: '信息安全与合规操作指南，包括数据分类分级、访问控制策略、审计日志管理、安全事件响应等内容...',
      content: '信息安全与合规操作指南，包括数据分类分级、访问控制策略、审计日志管理、安全事件响应等内容。符合等保2.0和ISO27001标准要求。',
      score: 0.75,
      source: '安全文档/合规指南.pdf',
      sourceType: 'upload',
      spaceId: '1',
      spaceName: '产品文档',
      fileType: 'pdf',
      fileSize: 3072000,
      createdAt: '2026-03-05 15:00:00',
      isFavorite: false,
      metadata: { author: '安全组', department: '安全部' },
    },
  ]
}

async function handleSearch() {
  if (!searchParams.value.keyword.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    searchResults.value = getMockSearchResults()
    pagination.value.total = searchResults.value.length
    ElMessage.success(`找到 ${pagination.value.total} 条相关结果`)
  } catch {
    ElMessage.error('搜索失败，请重试')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  searchParams.value = {
    keyword: '',
    spaceId: '',
    dataSourceId: '',
    fileType: '',
    dateRange: [],
    sortBy: 'relevance',
  }
  searchResults.value = []
  pagination.value.pageNum = 1
  pagination.value.total = 0
}

function handlePageChange(page: number) {
  pagination.value.pageNum = page
}

function toggleFavorite(result: SearchResult) {
  result.isFavorite = !result.isFavorite
  ElMessage.success(result.isFavorite ? '已收藏' : '已取消收藏')
}

function viewDetail(result: SearchResult) {
  selectedResult.value = result
  detailDialogVisible.value = true
}

function handleDownload(result: SearchResult) {
  ElMessage.success(`正在下载: ${result.source}`)
}

function getFileTypeIcon(type: string) {
  const map: Record<string, any> = {
    pdf: Document,
    doc: Document,
    docx: Document,
    xls: Document,
    xlsx: Document,
    txt: Document,
    md: Document,
    html: Link,
  }
  return map[type] || Document
}

function getFileTypeColor(type: string) {
  const map: Record<string, string> = {
    pdf: '#F56C6C',
    doc: '#409EFF',
    docx: '#409EFF',
    xls: '#67C23A',
    xlsx: '#67C23A',
    txt: '#909399',
    md: '#E6A23C',
    html: '#909399',
  }
  return map[type] || '#909399'
}

function formatFileSize(size?: number) {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getSourceTypeText(type: string) {
  const map: Record<string, string> = {
    upload: '本地文档',
    database: '数据库',
    web: '网页',
    api: 'API',
  }
  return map[type] || type
}

onMounted(() => {
  loadKnowledgeSpaces()
  loadDataSources()
})
</script>

<template>
  <div class="knowledge-retrieval">
    <div class="search-section">
      <div class="search-box">
        <el-input
          v-model="searchParams.keyword"
          placeholder="输入关键词搜索知识库内容..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" :icon="Search" :loading="loading" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="filter-bar">
        <div class="filter-left">
          <el-select v-model="searchParams.spaceId" placeholder="知识空间" clearable style="width: 160px">
            <el-option label="全部空间" value="" />
            <el-option v-for="space in knowledgeSpaces" :key="space.id" :label="space.name" :value="space.id" />
          </el-select>

          <el-select v-model="searchParams.dataSourceId" placeholder="数据源" clearable style="width: 140px">
            <el-option label="全部来源" value="" />
            <el-option v-for="ds in dataSources" :key="ds.id" :label="ds.name" :value="ds.id" />
          </el-select>

          <el-select v-model="searchParams.fileType" placeholder="文件类型" clearable style="width: 130px">
            <el-option v-for="ft in fileTypes" :key="ft.value" :label="ft.label" :value="ft.value" />
          </el-select>

          <el-date-picker
            v-model="searchParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />

          <el-button :icon="Filter" @click="showAdvancedFilter = !showAdvancedFilter">
            {{ showAdvancedFilter ? '收起筛选' : '高级筛选' }}
          </el-button>
        </div>

        <div class="filter-right">
          <el-radio-group v-model="searchParams.sortBy" size="small">
            <el-radio-button v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>

          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
      </div>

      <el-collapse-transition>
        <div v-show="showAdvancedFilter" class="advanced-filter">
          <el-form label-width="80px" inline>
            <el-form-item label="作者">
              <el-input placeholder="输入作者名称" style="width: 150px" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input placeholder="输入部门名称" style="width: 150px" />
            </el-form-item>
            <el-form-item label="标签">
              <el-select placeholder="选择标签" style="width: 150px" />
            </el-form-item>
            <el-form-item label="密级">
              <el-select placeholder="选择密级" style="width: 120px">
                <el-option label="公开" value="public" />
                <el-option label="内部" value="internal" />
                <el-option label="机密" value="confidential" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </div>

    <div class="results-section" v-loading="loading">
      <el-empty v-if="!hasSearched && !loading" description="输入关键词开始搜索知识库" :image-size="120">
        <template #image>
          <el-icon :size="80" color="#C0C4CC"><Search /></el-icon>
        </template>
      </el-empty>

      <template v-else>
        <div class="results-header">
          <span class="results-count">共找到 <strong>{{ pagination.total }}</strong> 条结果</span>
        </div>

        <div class="results-grid">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="result-card"
          >
            <div class="card-header">
              <div class="file-type-badge" :style="{ backgroundColor: getFileTypeColor(result.fileType) + '20', color: getFileTypeColor(result.fileType) }">
                <el-icon><component :is="getFileTypeIcon(result.fileType)" /></el-icon>
                {{ result.fileType.toUpperCase() }}
              </div>
              <div class="card-actions">
                <el-button
                  text
                  :type="result.isFavorite ? 'warning' : 'default'"
                  :icon="result.isFavorite ? StarFilled : Star"
                  @click="toggleFavorite(result)"
                />
              </div>
            </div>

            <h4 class="card-title" @click="viewDetail(result)">{{ result.title }}</h4>

            <p class="card-summary">{{ result.summary }}</p>

            <div class="card-meta">
              <div class="meta-item">
                <el-icon><FolderOpened /></el-icon>
                <span>{{ result.spaceName }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ result.createdAt }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="source-info">
                <el-icon><Document /></el-icon>
                <span class="source-name">{{ result.source }}</span>
                <span class="file-size">{{ formatFileSize(result.fileSize) }}</span>
              </div>
              <div class="score-badge">
                <span class="score-value">{{ (result.score * 100).toFixed(0) }}%</span>
                <span class="score-label">相关度</span>
              </div>
            </div>

            <div class="card-hover-actions">
              <el-button type="primary" size="small" :icon="View" @click="viewDetail(result)">查看详情</el-button>
              <el-button size="small" :icon="Download" @click="handleDownload(result)">下载原文</el-button>
            </div>
          </div>
        </div>

        <el-empty v-if="searchResults.length === 0 && !loading" description="未找到相关结果，请尝试其他关键词" />

        <div class="pagination-wrapper" v-if="pagination.total > pagination.pageSize">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            layout="total, prev, pager, next, jumper"
            @current-change="handlePageChange"
          />
        </div>
      </template>
    </div>

    <el-dialog v-model="detailDialogVisible" title="知识详情" width="800px" destroy-on-close>
      <template v-if="selectedResult">
        <div class="detail-header">
          <h3 class="detail-title">{{ selectedResult.title }}</h3>
          <div class="detail-meta">
            <el-tag :type="selectedResult.isFavorite ? 'warning' : 'info'" size="small">
              {{ selectedResult.isFavorite ? '已收藏' : '未收藏' }}
            </el-tag>
            <el-tag type="success" size="small">
              相关度: {{ (selectedResult.score * 100).toFixed(0) }}%
            </el-tag>
          </div>
        </div>

        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="来源文件">
            <el-icon><Document /></el-icon>
            {{ selectedResult.source }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(selectedResult.fileSize) }}
          </el-descriptions-item>
          <el-descriptions-item label="知识空间">
            <el-icon><FolderOpened /></el-icon>
            {{ selectedResult.spaceName }}
          </el-descriptions-item>
          <el-descriptions-item label="数据来源">
            {{ getSourceTypeText(selectedResult.sourceType) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ selectedResult.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="文件类型">
            <el-tag size="small">{{ selectedResult.fileType.toUpperCase() }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-content">
          <h4 class="section-title">内容摘要</h4>
          <div class="content-text">{{ selectedResult.content }}</div>
        </div>

        <div class="detail-metadata" v-if="selectedResult.metadata">
          <h4 class="section-title">元数据信息</h4>
          <el-descriptions :column="3" border>
            <el-descriptions-item v-for="(value, key) in selectedResult.metadata" :key="key" :label="key">
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>

      <template #footer>
        <el-button :icon="Star" @click="toggleFavorite(selectedResult!)">
          {{ selectedResult?.isFavorite ? '取消收藏' : '收藏' }}
        </el-button>
        <el-button :icon="Download" type="primary" @click="handleDownload(selectedResult!)">下载原文</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-retrieval {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-section {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .search-box {
    margin-bottom: 16px;

    :deep(.el-input__wrapper) {
      padding: 8px 16px;
    }

    :deep(.el-input__inner) {
      font-size: 16px;
    }
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .filter-left, .filter-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .advanced-filter {
    margin-top: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 6px;
  }
}

.results-section {
  flex: 1;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  min-height: 400px;

  .results-header {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;

    .results-count {
      font-size: 14px;
      color: #606266;

      strong {
        color: #409EFF;
        font-size: 16px;
      }
    }
  }
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.result-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  position: relative;

  &:hover {
    border-color: #409EFF;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);

    .card-hover-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .file-type-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .card-actions {
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  &:hover .card-actions {
    opacity: 1;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: #409EFF;
    }
  }

  .card-summary {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 60px;
  }

  .card-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #909399;

      .el-icon {
        font-size: 14px;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .source-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #909399;

      .source-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-size {
        color: #c0c4cc;
      }
    }

    .score-badge {
      display: flex;
      align-items: baseline;
      gap: 4px;

      .score-value {
        font-size: 16px;
        font-weight: 600;
        color: #67C23A;
      }

      .score-label {
        font-size: 11px;
        color: #909399;
      }
    }
  }

  .card-hover-actions {
    position: absolute;
    bottom: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.2s;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.detail-header {
  margin-bottom: 20px;

  .detail-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .detail-meta {
    display: flex;
    gap: 8px;
  }
}

.detail-descriptions {
  margin-bottom: 24px;

  :deep(.el-descriptions__label) {
    width: 100px;
  }
}

.detail-content, .detail-metadata {
  margin-bottom: 24px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    padding-left: 10px;
    border-left: 3px solid #409EFF;
  }

  .content-text {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 6px;
    line-height: 1.8;
    color: #606266;
    font-size: 14px;
  }
}
</style>