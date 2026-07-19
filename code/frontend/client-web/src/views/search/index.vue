<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Clock, Document, ChatLineSquare, Histogram, ChatRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索类型
type SearchType = 'all' | 'document' | 'report' | 'ai'

// 历史记录项
interface HistoryItem {
  keyword: string,
  time: string
}

// 搜索结果项
interface SearchResultItem {
  id: string
  title: string
  content: string
  type: SearchType
  source?: string
  score: number
  timestamp: string
}

// 页面数据
const searchKeyword = ref('')
const searchType = ref<SearchType>('all')
const loading = ref(false)
const searchResults = ref<SearchResultItem[]>([])
const hasSearched = ref(false)
const searchHistory = ref<HistoryItem[]>([])
const total = ref(0)

// 定义搜索类型选项
const searchTypeOptions = [
  { label: '全部', value: 'all', icon: Search },
  { label: '文档', value: 'document', icon: Document },
  { label: '报告', value: 'report', icon: Histogram },
  { label: 'AI助手', value: 'ai', icon: ChatRound }
]

/**
 * 执行搜索
 */
async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  hasSearched.value = true
  
  try {
    // 添加搜索历史记录
    const history = getSearchHistory()
    // 移除已有项
    const filtered = history.filter((item: string) => item !== searchKeyword.value)
    // 添加新项到开头，限制数量为20
    const updated = [searchKeyword.value, ...filtered].slice(0, 20)
    localStorage.setItem('search_history', JSON.stringify(updated))
    
    searchHistory.value = updated.map((item: string) => ({
      keyword: item,
      time: new Date().toISOString()
    }))
    
    // 使用模拟数据
    searchResults.value = getMockResults()
    total.value = searchResults.value.length
    ElMessage.success(`搜索完成，找到 ${total.value} 条结果`)
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
    // 使用模拟数据作为替代
    searchResults.value = getMockResults()
    total.value = searchResults.value.length
  } finally {
    loading.value = false
  }
}

/**
 * 获取模拟搜索结果数据
 */
function getMockResults(): SearchResultItem[] {
  const mockResults: SearchResultItem[] = [
    {
      id: '1',
      title: '项目开发文档',
      content: '该项目开发文档详细描述了系统架构设计、数据库设计、接口定义等内容，涵盖了前端和后端的完整技术方案……',
      type: 'document',
      source: '产品知识库',
      score: 0.92,
      timestamp: '2024-01-15'
    },
    {
      id: '2',
      title: 'Q4季度销售报告',
      content: '本季度销售额达成120%，同比增长15%。主要增长来源于移动端渠道，新用户转化率达到85%……',
      type: 'report',
      source: '销售部',
      score: 0.87,
      timestamp: '2024-01-10'
    },
    {
      id: '3',
      title: 'AI模型训练最佳实践',
      content: '关于如何优化模型训练效率、减少资源消耗、提高准确性等问题，推荐了一系列最佳实践方案……',
      type: 'ai',
      source: '研发部AI团队',
      score: 0.85,
      timestamp: '2024-01-12'
    },
    {
      id: '4',
      title: '用户手动 - 系统操作指南',
      content: '欢迎使用我们的知识管理系统。本手册将详细介绍系统的各个功能模块及其使用方法……',
      type: 'document',
      source: '技术支持中心',
      score: 0.78,
      timestamp: '2024-01-08'
    },
    {
      id: '5',
      title: '关于API安全漏洞的修复报告',
      content: '近期发现系统中的XXX接口存在安全风险，现提供修复方案及升级指引，请相关开发人员尽快实施……',
      type: 'report',
      source: '安全团队',
      score: 0.83,
      timestamp: '2024-01-05'
    },
    {
      id: '6',
      title: 'AI助手对话实录',
      content: '用户：如何优化数据库查询效率？AI助手：可以通过添加索引、分表分库等方式提升查询性能……',
      type: 'ai',
      source: 'AI助手日志',
      score: 0.90,
      timestamp: '2024-01-11'
    }
  ]

  // 根据搜索类型过滤结果
  if (searchType.value !== 'all') {
    return mockResults.filter(item => item.type === searchType.value)
  }
  
  return mockResults
}

/**
 * 处理点击历史记录
 */
function handleHistoryClick(keyword: string) {
  searchKeyword.value = keyword
  handleSearch()
}

/**
 * 获取搜索历史
 */
function getSearchHistory(): string[] {
  const storage = localStorage.getItem('search_history')
  if (!storage) return []
  try {
    return JSON.parse(storage)
  } catch {
    return []
  }
}

/**
 * 清空历史记录
 */
function clearHistory() {
  localStorage.removeItem('search_history')
  searchHistory.value = []
  ElMessage.success('搜索历史已清空')
}

// 组件挂载时加载历史记录
onMounted(() => {
  searchHistory.value = getSearchHistory().map((item: string) => ({
    keyword: item,
    time: new Date().toISOString()
  }))
})
</script>

<template>
  <div class="search-page">
    <!-- 搜索头部区域 -->
    <header class="search-header">
      <div class="search-container">
        <!-- 搜索框 -->
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入搜索关键词"
            size="large"
            clearable
            class="main-search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="prefix-icon">
                <Search />
              </el-icon>
            </template>
            <template #append>
              <el-button type="primary" size="large" :icon="Search" @click="handleSearch">
                搜索
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 分类筛选导航 -->
        <nav class="search-nav">
          <el-radio-group v-model="searchType" size="large" @change="hasSearched && handleSearch()">
            <el-radio-button
              v-for="option in searchTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              class="nav-button"
            >
              <el-icon v-if="option.icon" class="nav-icon">
                <component :is="option.icon" />
              </el-icon>
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </nav>

        <!-- 历史记录部分 -->
        <div v-if="searchHistory.length > 0 && !hasSearched" class="search-history">
          <div class="history-header">
            <span class="history-title">搜索历史</span>
            <el-button link type="primary" size="small" @click="clearHistory">
              清空
            </el-button>
          </div>
          <div class="history-tags">
            <el-tag
              v-for="(item, index) in searchHistory.slice(0, 5)"
              :key="index"
              class="history-tag"
              type="info"
              size="small"
              closable
              @click="handleHistoryClick(item.keyword)"
              @close="searchHistory.splice(index, 1)"
            >
              {{ item.keyword }}
            </el-tag>
          </div>
        </div>
      </div>
    </header>

    <!-- 搜索结果区域 -->
    <main v-if="hasSearched" class="search-results">
      <div class="results-container">
        <div class="results-header">
          <span class="results-count">共找到 <strong>{{ total }}</strong> 条结果</span>
          <el-button type="primary" link @click="hasSearched = false">更改搜索条件</el-button>
        </div>
        
        <div v-if="loading" class="loading-area">
          <el-skeleton :rows="4" animated />
        </div>
        
        <div v-else-if="searchResults.length === 0" class="no-results">
          <el-empty description="未找到相关内容" :image-size="100" />
        </div>
        
        <div v-else class="results-list">
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="result-card"
          >
            <div class="result-header">
              <h3 class="result-title">{{ item.title }}</h3>
              <el-tag
                :type="item.type === 'document' ? 'primary' : 
                       item.type === 'report' ? 'success' : 'warning'"
                size="small"
                effect="light"
              >
                {{ item.type === 'document' ? '文档' : 
                   item.type === 'report' ? '报告' : 'AI助手' }}
              </el-tag>
            </div>
            <p class="result-content">{{ item.content }}</p>
            <div class="result-meta">
              <span class="result-source">{{ item.source || '未知来源' }}</span>
              <span class="result-time">{{ item.timestamp }}</span>
              <span class="result-score">相关度: {{ Math.round(item.score * 100) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  padding-bottom: 40px;
}

.search-header {
  padding: 60px 20px 30px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.search-box {
  max-width: 600px;
  margin: 0 auto 20px;
}

.main-search-input {
  width: 100%;
}

.search-nav {
  margin-bottom: 20px;
  text-align: center;
}

.nav-button {
  border-radius: 30px !important;
  margin: 0 4px;
}

.nav-icon {
  margin-right: 4px;
}

.prefix-icon {
  color: #909399;
}

.search-history {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;
}

.history-tag:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.search-results {
  padding: 30px 20px 0;
}

.results-container {
  max-width: 800px;
  margin: 0 auto;
}

.results-header {
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.results-count {
  font-size: 16px;
  color: #333;
}

.results-count strong {
  color: #409eff;
  margin: 0 4px;
}

.loading-area {
  background: white;
  border-radius: 8px;
  padding: 40px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.no-results {
  background: white;
  border-radius: 8px;
  padding: 60px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s;
  border-left: 4px solid #4caf50;
}

.result-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  padding-right: 10px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-content {
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px;
  padding-right: 10px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 13px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.result-source {
  color: #409eff;
}

.result-score {
  color: #e6a23c;
  font-weight: 500;
}

@media (max-width: 768px) {
  .search-header {
    padding: 40px 16px 20px;
  }
  
  .search-container {
    padding: 0 10px;
  }
  
  .results-container {
    padding: 0 10px;
  }
  
  .search-nav {
    display: flex;
    justify-content: center;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 8px;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>