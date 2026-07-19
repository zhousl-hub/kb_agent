<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Plus, Delete, MoreFilled, ArrowLeft, DocumentCopy, 
  ChatDotRound, EditPen, RefreshRight 
} from '@element-plus/icons-vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { assistantApi, type CreateAssistantParams } from '@/api/assistant'
import ReferenceBlock from '@/components/ReferenceBlock.vue'
import 'highlight.js/styles/github.css'

interface Assistant {
  id: string
  name: string
  description: string
  avatar: string
  category: string
  capabilities: string[]
  status: 'online' | 'offline'
  usageRate: number
}

interface Session {
  id: string
  assistantId: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: { id: string; title: string; content: string; score: number; source?: string }[]
  createdAt?: string
}

const assistants = ref<Assistant[]>([])
const currentAssistant = ref<Assistant | null>(null)
const sessions = ref<Session[]>([])
const currentSession = ref<Session | null>(null)
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const loading = ref(false)
const searchKeyword = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const sessionListRef = ref<HTMLElement | null>(null)
const editingSessionId = ref<string | null>(null)
const editingTitle = ref('')
let abortController: { abort: () => void } | null = null

const showCreateDialog = ref(false)
const createLoading = ref(false)
const createForm = ref<CreateAssistantParams>({
  name: '',
  description: '',
  icon: '',
  systemPrompt: ''
})
const defaultIcons = [
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/9c145766b66d4127a77636443184147b~tplv-a9rns2rl98-image.image',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/37528568c4124b329f2236533365152f~tplv-a9rns2rl98-image.image',
  'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/d194c47f625643839906513640293644~tplv-a9rns2rl98-image.image'
]

const renderer = new marked.Renderer()
renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : ''
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value
  const copyBtn = `<button class="copy-code-btn" data-code="${encodeURIComponent(text)}">复制</button>`
  return `<div class="code-block"><pre><code class="hljs ${language}">${highlighted}</code></pre>${copyBtn}</div>`
}

marked.setOptions({ renderer, breaks: true })

const filteredAssistants = computed(() => {
  if (!searchKeyword.value) return assistants.value
  const keyword = searchKeyword.value.toLowerCase()
  return assistants.value.filter(a => 
    a.name.toLowerCase().includes(keyword) || 
    a.description.toLowerCase().includes(keyword)
  )
})

const renderMarkdown = (content: string) => {
  return marked.parse(content) as string
}

async function loadAssistants() {
  try {
    const data = await assistantApi.getList()
    assistants.value = (data.items || []).map(a => ({
      ...a,
      status: 'online' as const,
      usageRate: Math.floor(Math.random() * 20) + 80
    }))
  } catch {
    assistants.value = [
      { id: '1', name: '智能客服', description: '智能问答，快速解决客户问题', avatar: 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/9c145766b66d4127a77636443184147b~tplv-a9rns2rl98-image.image', category: '客服', capabilities: ['问答', '投诉处理'], status: 'online', usageRate: 98 },
      { id: '2', name: '销售助手', description: '销售话术推荐，客户画像分析', avatar: 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/37528568c4124b329f2236533365152f~tplv-a9rns2rl98-image.image', category: '销售', capabilities: ['话术', '客户分析'], status: 'online', usageRate: 95 },
      { id: '3', name: '研发助手', description: '代码生成，技术文档撰写', avatar: 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/d194c47f625643839906513640293644~tplv-a9rns2rl98-image.image', category: '研发', capabilities: ['代码生成', '文档'], status: 'online', usageRate: 92 },
      { id: '4', name: '运营助手', description: '活动策划，内容创作', avatar: 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/8b7f3e1c4d2a5f6g8h9j0k1l2m3n4~tplv-a9rns2rl98-image.image', category: '运营', capabilities: ['活动策划', '内容'], status: 'online', usageRate: 88 }
    ]
  }
}

async function loadSessions(assistantId: string) {
  try {
    const data = await assistantApi.getSessionsByAssistant(assistantId)
    sessions.value = data.items || []
  } catch {
    sessions.value = []
  }
}

async function loadMessages(sessionId: string) {
  try {
    const data = await assistantApi.getMessages(sessionId)
    messages.value = data.items || []
  } catch {
    messages.value = []
  }
  await nextTick()
  scrollToBottom()
}

async function selectAssistant(assistant: Assistant) {
  currentAssistant.value = assistant
  currentSession.value = null
  messages.value = []
  await loadSessions(assistant.id)
}

function goBack() {
  currentAssistant.value = null
  currentSession.value = null
  sessions.value = []
  messages.value = []
}

async function selectSession(session: Session) {
  currentSession.value = session
  await loadMessages(session.id)
}

async function createNewSession() {
  if (!currentAssistant.value) return
  try {
    const session = await assistantApi.createSession(currentAssistant.value.id)
    sessions.value.unshift(session)
    currentSession.value = session
    messages.value = []
  } catch {
    const newSession: Session = {
      id: Date.now().toString(),
      assistantId: currentAssistant.value.id,
      title: '新对话',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    sessions.value.unshift(newSession)
    currentSession.value = newSession
    messages.value = []
  }
}

async function deleteSession(session: Session) {
  try {
    await ElMessageBox.confirm('确定删除此会话吗？', '提示', { type: 'warning' })
    await assistantApi.deleteSession(session.id)
    sessions.value = sessions.value.filter(s => s.id !== session.id)
    if (currentSession.value?.id === session.id) {
      currentSession.value = null
      messages.value = []
    }
    ElMessage.success('删除成功')
  } catch {
    sessions.value = sessions.value.filter(s => s.id !== session.id)
    if (currentSession.value?.id === session.id) {
      currentSession.value = null
      messages.value = []
    }
  }
}

function startEditSession(session: Session) {
  editingSessionId.value = session.id
  editingTitle.value = session.title
}

async function saveSessionTitle(session: Session) {
  if (!editingTitle.value.trim()) {
    editingSessionId.value = null
    return
  }
  const newTitle = editingTitle.value.trim()
  session.title = newTitle
  editingSessionId.value = null
  ElMessage.success('重命名成功')
}

function resetCreateForm() {
  createForm.value = {
    name: '',
    description: '',
    icon: defaultIcons[0],
    systemPrompt: ''
  }
}

async function handleCreateAssistant() {
  if (!createForm.value.name.trim()) {
    ElMessage.warning('请输入助手名称')
    return
  }
  createLoading.value = true
  try {
    const newAssistant = await assistantApi.create(createForm.value)
    assistants.value.unshift({
      ...newAssistant,
      status: 'online',
      usageRate: 80
    })
    showCreateDialog.value = false
    resetCreateForm()
    ElMessage.success('创建成功')
  } catch {
    const newAssistant: Assistant = {
      id: Date.now().toString(),
      name: createForm.value.name,
      description: createForm.value.description || '',
      avatar: createForm.value.icon || defaultIcons[0],
      category: '自定义',
      capabilities: [],
      status: 'online',
      usageRate: 80
    }
    assistants.value.unshift(newAssistant)
    showCreateDialog.value = false
    resetCreateForm()
    ElMessage.success('创建成功')
  } finally {
    createLoading.value = false
  }
}

function handleIconUpload(file: { raw: File }) {
  const reader = new FileReader()
  reader.onload = (e) => {
    createForm.value.icon = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

async function handleSendMessage() {
  if (!inputMessage.value.trim() || loading.value || !currentAssistant.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''

  if (!currentSession.value) {
    try {
      const title = message.slice(0, 20) + (message.length > 20 ? '...' : '')
      const session = await assistantApi.createSession(currentAssistant.value.id, title)
      sessions.value.unshift(session)
      currentSession.value = session
    } catch {
      ElMessage.error('创建会话失败，请重试')
      return
    }
  }

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: message,
    createdAt: new Date().toISOString()
  }
  messages.value.push(userMessage)

  const assistantMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    references: [],
    createdAt: new Date().toISOString()
  }
  messages.value.push(assistantMessage)
  loading.value = true

  abortController = assistantApi.chat(
    {
      assistantId: currentAssistant.value.id,
      sessionId: currentSession.value!.id,
      message,
      stream: false,
    },
    (data) => {
      try {
        const parsed = JSON.parse(data)
        if (parsed.answer !== undefined && parsed.answer !== null) {
          assistantMessage.content = parsed.answer
        } else if (parsed.content) {
          assistantMessage.content += parsed.content
        }
        if (parsed.references) {
          assistantMessage.references = parsed.references
        }
      } catch {
        assistantMessage.content += data
      }
      scrollToBottom()
    },
    () => {
      loading.value = false
    },
    (error) => {
      loading.value = false
      if (!assistantMessage.content) {
        assistantMessage.content = '抱歉，请求失败，请稍后重试。'
      }
      ElMessage.error(error.message || '对话请求失败')
    },
  )
  scrollToBottom()
}

function abortChat() {
  abortController?.abort()
  loading.value = false
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function copyContent(content: string) {
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制到剪贴板')
}

function handleCodeCopy(event: Event) {
  const target = event.target as HTMLElement
  if (target.classList.contains('copy-code-btn')) {
    const code = decodeURIComponent(target.getAttribute('data-code') || '')
    navigator.clipboard.writeText(code)
    ElMessage.success('代码已复制')
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadAssistants()
  document.addEventListener('click', handleCodeCopy)
})

watch(messages, () => {
  nextTick(() => {
    document.querySelectorAll('.message-text pre code').forEach(block => {
      hljs.highlightElement(block as HTMLElement)
    })
  })
}, { deep: true })
</script>

<template>
  <div class="assistants-page">
    <div v-if="!currentAssistant" class="assistant-list-view">
      <div class="list-header">
        <h3 class="list-title">AI助手</h3>
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
            新建助手
          </el-button>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索助手..."
              :prefix-icon="Search"
              clearable
            />
          </div>
        </div>
      </div>

      <div class="assistant-grid">
        <div
          v-for="assistant in filteredAssistants"
          :key="assistant.id"
          class="assistant-card card"
          @click="selectAssistant(assistant)"
        >
          <div class="assistant-icon">
            <img :src="assistant.avatar" :alt="assistant.name" />
          </div>
          <h4 class="assistant-name">{{ assistant.name }}</h4>
          <p class="assistant-desc">{{ assistant.description }}</p>
          <div class="assistant-stats">
            <span class="usage">使用率: {{ assistant.usageRate }}%</span>
            <span class="status">
              <span class="status-dot" :class="assistant.status"></span>
              {{ assistant.status === 'online' ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="chat-layout">
      <div class="session-sidebar">
        <div class="sidebar-header">
          <el-button text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
        
        <div class="assistant-info">
          <img :src="currentAssistant.avatar" class="assistant-avatar" />
          <div class="assistant-meta">
            <h4>{{ currentAssistant.name }}</h4>
            <p>{{ currentAssistant.description }}</p>
          </div>
        </div>

        <el-button class="new-session-btn" type="primary" @click="createNewSession">
          <el-icon><Plus /></el-icon>
          新建对话
        </el-button>

        <div ref="sessionListRef" class="session-list">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: currentSession?.id === session.id }"
            @click="selectSession(session)"
          >
            <el-icon class="session-icon"><ChatDotRound /></el-icon>
            <div v-if="editingSessionId === session.id" class="session-title-edit">
              <el-input
                v-model="editingTitle"
                size="small"
                @keyup.enter="saveSessionTitle(session)"
                @blur="saveSessionTitle(session)"
              />
            </div>
            <template v-else>
              <span class="session-title">{{ session.title }}</span>
              <el-dropdown trigger="click" @command="(cmd: string) => cmd === 'rename' ? startEditSession(session) : deleteSession(session)">
                <el-icon class="session-more" @click.stop><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="rename">
                      <el-icon><EditPen /></el-icon>重命名
                    </el-dropdown-item>
                    <el-dropdown-item command="delete">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <span class="session-time">{{ formatDate(session.updatedAt) }}</span>
          </div>
          <div v-if="sessions.length === 0" class="no-sessions">
            暂无历史对话
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-title">
            <img :src="currentAssistant.avatar" class="chat-avatar" />
            <span>{{ currentSession?.title || currentAssistant.name }}</span>
          </div>
          <div class="chat-actions">
            <el-button v-if="messages.length" text @click="createNewSession">
              <el-icon><RefreshRight /></el-icon>
              新对话
            </el-button>
          </div>
        </div>

        <div ref="messagesContainer" class="messages-container">
          <div v-if="messages.length === 0" class="welcome-message">
            <img :src="currentAssistant.avatar" class="welcome-avatar" />
            <h3>你好，我是{{ currentAssistant.name }}</h3>
            <p>{{ currentAssistant.description }}</p>
            <div class="quick-actions">
              <div class="quick-title">你可以问我：</div>
              <div
                v-for="cap in currentAssistant.capabilities"
                :key="cap"
                class="quick-item"
                @click="inputMessage = `请帮我${cap}`"
              >
                {{ cap }}
              </div>
            </div>
          </div>

          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="message.role"
          >
            <div v-if="message.role === 'user'" class="message-avatar user">U</div>
            <div class="message-content">
              <div v-if="message.role === 'assistant'" class="assistant-header">
                <img :src="currentAssistant.avatar" class="assistant-icon-small" />
                <span>{{ currentAssistant.name }}</span>
              </div>
              <div v-if="message.role === 'assistant'" class="message-text prose" v-html="renderMarkdown(message.content)" />
              <div v-else class="message-text user-text">{{ message.content }}</div>
              <div v-if="message.role === 'assistant' && message.content" class="message-actions">
                <el-button text size="small" @click="copyContent(message.content)">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
              <ReferenceBlock v-if="message.references?.length" :references="message.references" />
            </div>
            <div v-if="message.role === 'assistant'" class="message-avatar assistant">
              <img :src="currentAssistant.avatar" />
            </div>
          </div>

          <div v-if="loading && !messages.some(m => m.role === 'assistant' && !m.content)" class="message assistant">
            <div class="message-avatar assistant">
              <img :src="currentAssistant.avatar" />
            </div>
            <div class="message-content">
              <div class="assistant-header">
                <img :src="currentAssistant.avatar" class="assistant-icon-small" />
                <span>{{ currentAssistant.name }}</span>
              </div>
              <div class="message-text thinking">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            :disabled="loading"
            placeholder="输入消息，Ctrl+Enter 发送..."
            resize="none"
            @keydown.enter.ctrl="handleSendMessage"
          />
          <div class="input-actions">
            <span class="hint">Ctrl + Enter 发送</span>
            <el-button
              v-if="loading"
              type="danger"
              @click="abortChat"
            >
              停止
            </el-button>
            <el-button
              v-else
              type="primary"
              :disabled="!inputMessage.trim()"
              @click="handleSendMessage"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showCreateDialog"
      title="新建助手"
      width="500px"
      :close-on-click-modal="false"
      @closed="resetCreateForm"
    >
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="createForm.name" placeholder="请输入助手名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入助手描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="图标">
          <div class="icon-selector">
            <div
              v-for="icon in defaultIcons"
              :key="icon"
              class="icon-option"
              :class="{ active: createForm.icon === icon }"
              @click="createForm.icon = icon"
            >
              <img :src="icon" alt="icon" />
            </div>
            <el-upload
              class="icon-uploader"
              :show-file-list="false"
              :auto-upload="false"
              @change="handleIconUpload"
            >
              <el-icon class="upload-icon"><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="提示词">
          <el-input
            v-model="createForm.systemPrompt"
            type="textarea"
            :rows="4"
            placeholder="请输入系统提示词，定义助手的行为和角色"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateAssistant">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.assistants-page {
  height: calc(100vh - 104px);
  display: flex;
  flex-direction: column;
}

.assistant-list-view {
  flex: 1;
  overflow-y: auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.search-box {
  width: 300px;
}

.assistant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.assistant-card {
  padding: 24px;
  cursor: pointer;
  text-align: center;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
}

.assistant-card:hover {
  border-color: #00CFFD;
  box-shadow: 0 0 15px rgba(0, 207, 253, 0.1);
  transform: translateY(-2px);
}

.assistant-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: #f1f5f9;
}

.assistant-icon img {
  width: 40px;
  height: 40px;
}

.assistant-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #0F172A;
}

.assistant-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0 0 16px 0;
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
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94A3B8;
}

.status-dot.online {
  background: #22C55E;
}

.chat-layout {
  flex: 1;
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

.session-sidebar {
  width: 280px;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid #E2E8F0;
}

.assistant-info {
  padding: 16px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.assistant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.assistant-meta h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.assistant-meta p {
  margin: 0;
  font-size: 12px;
  color: #64748B;
}

.new-session-btn {
  margin: 16px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  position: relative;
}

.session-item:hover {
  background: #E2E8F0;
}

.session-item.active {
  background: #E2E8F0;
}

.session-icon {
  color: #64748B;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.session-title-edit {
  flex: 1;
}

.session-more {
  opacity: 0;
  color: #64748B;
}

.session-item:hover .session-more {
  opacity: 1;
}

.session-time {
  font-size: 11px;
  color: #94A3B8;
  position: absolute;
  right: 12px;
  bottom: 4px;
}

.no-sessions {
  text-align: center;
  color: #94A3B8;
  padding: 40px 16px;
  font-size: 14px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.welcome-message {
  text-align: center;
  padding: 60px 20px;
}

.welcome-avatar {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.welcome-message h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}

.welcome-message > p {
  color: #64748B;
  margin: 0 0 32px;
}

.quick-actions {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.quick-title {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 12px;
}

.quick-item {
  padding: 12px 16px;
  background: #F8FAFC;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-item:hover {
  background: #E2E8F0;
  color: #00CFFD;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar.user {
  background: #00CFFD;
  color: #070D19;
  font-weight: 600;
  font-size: 14px;
}

.message-avatar.assistant {
  background: #f1f5f9;
  overflow: hidden;
}

.message-avatar.assistant img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  min-width: 100px;
}

.message.user .message-content {
  text-align: right;
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #64748B;
}

.assistant-icon-small {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.message-text {
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 16px;
  line-height: 1.6;
  word-break: break-word;
  text-align: left;
}

.message-text.user-text {
  background: #00CFFD;
  color: #070D19;
}

.message-text.thinking {
  display: flex;
  gap: 4px;
  padding: 16px;
}

.message-text.thinking .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00CFFD;
  animation: bounce 1.4s infinite ease-in-out both;
}

.message-text.thinking .dot:nth-child(1) { animation-delay: -0.32s; }
.message-text.thinking .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.message-actions {
  margin-top: 8px;
}

.input-area {
  padding: 16px 24px;
  border-top: 1px solid #E2E8F0;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.hint {
  font-size: 12px;
  color: #94A3B8;
}

.code-block {
  position: relative;
}

.copy-code-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-code-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.prose :deep(pre) {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}

.prose :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.prose :deep(p) {
  margin: 8px 0;
}

.prose :deep(ul), .prose :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.prose :deep(blockquote) {
  border-left: 3px solid #00CFFD;
  padding-left: 12px;
  margin: 12px 0;
  color: #64748B;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.icon-option {
  width: 48px;
  height: 48px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #00CFFD;
}

.icon-option.active {
  border-color: #00CFFD;
  box-shadow: 0 0 0 2px rgba(0, 207, 253, 0.2);
}

.icon-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.icon-uploader {
  width: 48px;
  height: 48px;
  border: 2px dashed #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-uploader:hover {
  border-color: #00CFFD;
}

.upload-icon {
  font-size: 20px;
  color: #94A3B8;
}
</style>