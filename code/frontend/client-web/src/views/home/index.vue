<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Search, Clock, Document, Plus, Delete } from '@element-plus/icons-vue'
import { get } from '@/api/request'
import { assistantApi } from '@/api/assistant'
import { userApi } from '@/api/user'
import * as echarts from 'echarts'
import type { Assistant } from '@/types'

interface RecentDocument {
  id: string
  title: string
  type: string
  knowledgeId: string
  knowledgeName: string
  updatedAt: string
}

interface TodoItem {
  id: string
  content: string
  completed: boolean
  createdAt: string
}

interface KnowledgeStats {
  trendData: number[]
  categoryData: { name: string; value: number }[]
}

const router = useRouter()
const userStore = useUserStore()

const currentTime = ref('')
const currentDate = ref('')
let timeInterval: ReturnType<typeof setInterval> | null = null

const quickSearchKeyword = ref('')

const recentDocuments = ref<RecentDocument[]>([])
const recentLoading = ref(false)

const todoList = ref<TodoItem[]>([])
const todoLoading = ref(false)
const newTodoContent = ref('')
const showAddTodo = ref(false)

const aiAssistants = ref<Assistant[]>([])
const assistantsLoading = ref(false)

const knowledgeStats = ref<KnowledgeStats>({
  trendData: [],
  categoryData: []
})

const userName = computed(() => userStore.userInfo?.nickname || '用户')

function updateDateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  })
}

async function fetchRecentDocuments() {
  recentLoading.value = true
  try {
    const data = await userApi.getRecentDocuments(5)
    recentDocuments.value = data.slice(0, 5)
  } catch {
    recentDocuments.value = []
  } finally {
    recentLoading.value = false
  }
}

async function fetchTodoList() {
  todoLoading.value = true
  try {
    todoList.value = await userApi.getTodos()
  } catch {
    todoList.value = []
  } finally {
    todoLoading.value = false
  }
}

async function toggleTodo(id: string) {
  const todo = todoList.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
    try {
      await userApi.toggleTodo(id, todo.completed)
    } catch {
      // ignore
    }
  }
}

async function addTodo() {
  if (!newTodoContent.value.trim()) return
  
  const newTodo: TodoItem = {
    id: `todo-${Date.now()}`,
    content: newTodoContent.value.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  }
  
  try {
    const created = await userApi.createTodo(newTodo.content)
    newTodo.id = created.id
  } catch {
    // ignore
  }
  
  todoList.value.unshift(newTodo)
  newTodoContent.value = ''
  showAddTodo.value = false
}

async function deleteTodo(id: string) {
  try {
    await userApi.deleteTodo(id)
  } catch {
    // ignore
  }
  todoList.value = todoList.value.filter(t => t.id !== id)
}

async function fetchAssistants() {
  assistantsLoading.value = true
  try {
    const data = await assistantApi.getList()
    aiAssistants.value = (data.items || []).slice(0, 4)
  } catch {
    aiAssistants.value = [
      { id: 'asst-001', name: '智能客服', description: '智能问答，快速解决客户问题', avatar: '', category: '客服', capabilities: [], systemPrompt: '', createdAt: '', updatedAt: '' },
      { id: 'asst-002', name: '销售助手', description: '销售话术推荐，客户画像分析', avatar: '', category: '销售', capabilities: [], systemPrompt: '', createdAt: '', updatedAt: '' },
      { id: 'asst-003', name: '研发助手', description: '代码生成，技术文档撰写', avatar: '', category: '研发', capabilities: [], systemPrompt: '', createdAt: '', updatedAt: '' },
      { id: 'asst-004', name: '运营助手', description: '活动策划，内容创作', avatar: '', category: '运营', capabilities: [], systemPrompt: '', createdAt: '', updatedAt: '' },
    ]
  } finally {
    assistantsLoading.value = false
  }
}

async function fetchKnowledgeStats() {
  try {
    knowledgeStats.value = await get<KnowledgeStats>('/v1/knowledge/stats')
  } catch {
    knowledgeStats.value = {
      trendData: [],
      categoryData: [],
    }
  }
}

function handleQuickSearch() {
  if (quickSearchKeyword.value.trim()) {
    router.push({ path: '/search', query: { q: quickSearchKeyword.value } })
  }
}

function navigateToDocument(doc: RecentDocument) {
  router.push(`/knowledge/${doc.knowledgeId}/document/${doc.id}`)
}

function startAssistant(id: string) {
  router.push(`/assistants?id=${id}`)
}

let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

function initCharts() {
  const trendEl = document.getElementById('trendChart')
  const categoryEl = document.getElementById('categoryChart')
  
  if (trendEl) {
    trendChart = echarts.init(trendEl)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#64748B' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [{
        data: knowledgeStats.value.trendData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00CFFD', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 207, 253, 0.3)' },
            { offset: 1, color: 'rgba(0, 207, 253, 0.05)' }
          ])
        },
        itemStyle: { color: '#00CFFD' }
      }]
    })
  }

  if (categoryEl) {
    categoryChart = echarts.init(categoryEl)
    categoryChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#64748B' }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: knowledgeStats.value.categoryData.map((item, index) => ({
          ...item,
          itemStyle: { color: ['#00CFFD', '#BFFF00', '#FF6B6B', '#4ECDC4', '#45B7D1'][index % 5] }
        }))
      }]
    })
  }
}

function handleResize() {
  trendChart?.resize()
  categoryChart?.resize()
}

const assistantColors = ['#3b82f6', '#22c55e', '#a855f7', '#f97316']

function getAssistantColor(index: number) {
  return assistantColors[index % assistantColors.length]
}

onMounted(() => {
  updateDateTime()
  timeInterval = setInterval(updateDateTime, 1000)
  
  fetchRecentDocuments()
  fetchTodoList()
  fetchAssistants()
  fetchKnowledgeStats().then(() => {
    initCharts()
  })
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  trendChart?.dispose()
  categoryChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="home-page">
    <div class="welcome-card">
      <div class="welcome-content">
        <h3 class="welcome-title">欢迎回来，{{ userName }}！</h3>
        <p class="welcome-date">今天是 {{ currentDate }}</p>
      </div>
      <div class="welcome-time">
        <div class="time-value">{{ currentTime }}</div>
        <div class="time-label">当前时间</div>
      </div>
    </div>

    <div class="quick-cards">
      <div class="card card-hover quick-search-card">
        <div class="card-header">
          <h4 class="card-title">快速检索</h4>
          <el-icon class="card-icon"><Search /></el-icon>
        </div>
        <el-input
          v-model="quickSearchKeyword"
          placeholder="输入关键词..."
          size="large"
          @keyup.enter="handleQuickSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="search-btn" @click="handleQuickSearch">
          开始检索
        </el-button>
      </div>

      <div class="card card-hover">
        <div class="card-header">
          <h4 class="card-title">最近访问</h4>
          <el-icon class="card-icon"><Clock /></el-icon>
        </div>
        <div v-if="recentLoading" class="loading-container">
          <el-icon class="is-loading"><Clock /></el-icon>
          <span>加载中...</span>
        </div>
        <ul v-else class="recent-list">
          <li 
            v-for="item in recentDocuments" 
            :key="item.id" 
            class="recent-item" 
            @click="navigateToDocument(item)"
          >
            <el-icon class="recent-icon"><Document /></el-icon>
            <div class="recent-info">
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-meta">{{ item.knowledgeName }} · {{ item.updatedAt }}</span>
            </div>
          </li>
          <li v-if="recentDocuments.length === 0" class="empty-tip">
            暂无最近访问记录
          </li>
        </ul>
      </div>

      <div class="card card-hover">
        <div class="card-header">
          <h4 class="card-title">待办事项</h4>
          <el-icon class="card-icon"><Clock /></el-icon>
        </div>
        <div v-if="todoLoading" class="loading-container">
          <el-icon class="is-loading"><Clock /></el-icon>
          <span>加载中...</span>
        </div>
        <template v-else>
          <ul class="todo-list">
            <li v-for="todo in todoList" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
              <el-checkbox 
                :model-value="todo.completed" 
                @change="toggleTodo(todo.id)"
              />
              <span class="todo-content">{{ todo.content }}</span>
              <el-button 
                type="danger" 
                :icon="Delete" 
                circle 
                size="small" 
                class="delete-btn"
                @click.stop="deleteTodo(todo.id)"
              />
            </li>
            <li v-if="todoList.length === 0" class="empty-tip">
              暂无待办事项
            </li>
          </ul>
          <div v-if="showAddTodo" class="add-todo-input">
            <el-input 
              v-model="newTodoContent" 
              placeholder="输入待办内容" 
              size="small"
              @keyup.enter="addTodo"
            />
            <el-button type="primary" size="small" @click="addTodo">添加</el-button>
            <el-button size="small" @click="showAddTodo = false">取消</el-button>
          </div>
          <el-button v-else class="add-todo-btn" :icon="Plus" @click="showAddTodo = true">
            添加待办
          </el-button>
        </template>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3 class="section-title">AI助手应用</h3>
        <a class="view-link" @click="router.push('/assistants')">查看全部</a>
      </div>
      <div v-if="assistantsLoading" class="loading-container assistants-loading">
        <el-icon class="is-loading"><Clock /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else class="assistant-grid">
        <div 
          v-for="(assistant, index) in aiAssistants" 
          :key="assistant.id" 
          class="app-card" 
          @click="startAssistant(assistant.id)"
        >
          <div 
            class="assistant-icon" 
            :style="{ backgroundColor: `${getAssistantColor(index)}15` }"
          >
            <img 
              v-if="assistant.avatar" 
              :src="assistant.avatar" 
              :alt="assistant.name" 
              class="assistant-img" 
            />
            <span v-else class="assistant-name-initial">{{ assistant.name.charAt(0) }}</span>
          </div>
          <h4 class="assistant-name">{{ assistant.name }}</h4>
          <p class="assistant-desc">{{ assistant.description }}</p>
          <div class="assistant-stats">
            <span class="usage">使用率: {{ 90 + index * 2 }}%</span>
            <span class="status">
              <span class="status-dot"></span>
              在线
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <h4 class="chart-title">知识访问趋势</h4>
        <div id="trendChart" class="chart-container"></div>
      </div>
      <div class="card">
        <h4 class="chart-title">知识分类分布</h4>
        <div id="categoryChart" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.welcome-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.welcome-time {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px 24px;
  text-align: center;
}

.time-value {
  font-size: 28px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.time-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.quick-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: #00CFFD;
  box-shadow: 0 0 15px rgba(0, 207, 253, 0.1);
}

.card-hover:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #0F172A;
}

.card-icon {
  font-size: 24px;
  color: #00CFFD;
}

.quick-search-card {
  display: flex;
  flex-direction: column;
}

.search-btn {
  margin-top: 16px;
  background-color: #00CFFD;
  border-color: #00CFFD;
  color: #070D19;
  font-weight: 600;
}

.search-btn:hover {
  background-color: #00B8E6;
  border-color: #00B8E6;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #64748B;
}

.loading-container .is-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #F1F5F9;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  color: #0F172A;
  background: #F8FAFC;
  margin: 0 -12px;
  padding: 12px;
  border-radius: 6px;
}

.recent-icon {
  margin-right: 12px;
  color: #00CFFD;
  margin-top: 2px;
}

.recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-title {
  flex: 1;
  font-size: 14px;
  color: #0F172A;
}

.recent-meta {
  font-size: 12px;
  color: #94A3B8;
}

.empty-tip {
  text-align: center;
  color: #94A3B8;
  padding: 24px 0;
  font-size: 14px;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: #64748B;
  border-bottom: 1px solid #F1F5F9;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed .todo-content {
  text-decoration: line-through;
  color: #94A3B8;
}

.todo-content {
  flex: 1;
  font-size: 14px;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.add-todo-input {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.add-todo-btn {
  margin-top: 12px;
  width: 100%;
  border: 1px dashed #E2E8F0;
  color: #64748B;
  background: transparent;
}

.add-todo-btn:hover {
  border-color: #00CFFD;
  color: #00CFFD;
}

.section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #0F172A;
}

.view-link {
  color: #00CFFD;
  cursor: pointer;
  font-size: 14px;
}

.view-link:hover {
  text-decoration: underline;
}

.assistants-loading {
  padding: 48px;
}

.assistant-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.app-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.app-card:hover {
  border-color: #00CFFD;
  box-shadow: 0 0 15px rgba(0, 207, 253, 0.1);
  transform: translateY(-2px);
}

.assistant-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.assistant-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.assistant-name-initial {
  font-size: 24px;
  font-weight: 600;
  color: #0F172A;
}

.assistant-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #0F172A;
}

.assistant-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 16px 0;
  line-height: 1.5;
  min-height: 42px;
}

.assistant-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748B;
}

.status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #22c55e;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  padding: 24px 24px 0 24px;
  color: #0F172A;
}

.chart-container {
  height: 280px;
  padding: 16px 24px 24px 24px;
}

@media (max-width: 1200px) {
  .quick-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .assistant-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .quick-cards {
    grid-template-columns: 1fr;
  }
  
  .assistant-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}
</style>