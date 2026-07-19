<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { post, createSSEConnection } from '@/api/request'
import ReferenceBlock from '@/components/ReferenceBlock.vue'

interface Reference {
  id: string
  title: string
  content: string
  score: number
  source?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  loading?: boolean
  references?: Reference[]
}

const route = useRoute()
const messages = ref<Message[]>([])
const inputText = ref('')
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
let sseConnection: { abort: () => void } | null = null

const kbId = ref<string>('')

const renderer = new marked.Renderer()
renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : ''
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value
  return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`
}

marked.setOptions({
  renderer,
  breaks: true
})

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: text,
    timestamp: Date.now(),
  }

  messages.value.push(userMessage)
  inputText.value = ''
  scrollToBottom()

  const assistantMessage: Message = {
    id: generateId(),
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    loading: true,
    references: [],
  }
  messages.value.push(assistantMessage)
  loading.value = true

  try {
    sseConnection = createSSEConnection(
      '/api/chat/completions',
      {
        message: text,
        knowledge_base_id: kbId.value,
        conversation_id: route.params.id,
      },
      {
        onMessage: (data: string) => {
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              assistantMessage.content += parsed.content
              scrollToBottom()
            }
            if (parsed.references) {
              assistantMessage.references = parsed.references
            }
          } catch {
            assistantMessage.content += data
            scrollToBottom()
          }
        },
        onError: () => {
          assistantMessage.loading = false
          if (!assistantMessage.content) {
            assistantMessage.content = '抱歉，发生了错误，请重试'
          }
          showToast('请求失败')
          loading.value = false
        },
        onComplete: () => {
          assistantMessage.loading = false
          loading.value = false
          sseConnection = null
        },
      }
    )
  } catch {
    assistantMessage.loading = false
    assistantMessage.content = '抱歉，发生了错误，请重试'
    loading.value = false
    showToast('发送失败')
  }
}

function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

onMounted(() => {
  kbId.value = (route.query.kb as string) || ''
  if (route.params.id) {
    loadConversation()
  }
})

onUnmounted(() => {
  if (sseConnection) {
    sseConnection.abort()
  }
})

async function loadConversation() {
  try {
    const data = await post<Message[]>('/api/chat/history', {
      conversation_id: route.params.id,
    })
    messages.value = data
    scrollToBottom()
  } catch {
    showToast('加载对话失败')
  }
}
</script>

<template>
  <div class="chat-page">
    <van-nav-bar
      title="AI对话"
      left-arrow
      fixed
      placeholder
      @click-left="$router.back()"
    />

    <div ref="chatContainer" class="chat-container">
      <div v-if="messages.length === 0" class="empty-state">
        <van-icon name="chat-o" size="64" color="#dcdee0" />
        <p>开始与AI对话吧</p>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.role]"
      >
        <div class="avatar">
          <van-icon
            :name="message.role === 'user' ? 'user-o' : 'chat-o'"
            size="24"
          />
        </div>
        <div class="content-wrapper">
          <div v-if="message.loading && !message.content" class="loading-dots">
            <span></span><span></span><span></span>
          </div>
          <div v-else>
            <div
              class="message-content"
              v-html="renderMarkdown(message.content)"
            ></div>
            <ReferenceBlock v-if="message.references?.length" :references="message.references" />
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <van-field
        v-model="inputText"
        type="textarea"
        rows="1"
        autosize
        placeholder="输入消息..."
        @keydown="handleKeydown"
      />
      <van-button
        type="primary"
        size="small"
        :loading="loading"
        :disabled="!inputText.trim() || loading"
        @click="sendMessage"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f8fa;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #969799;
}

.empty-state p {
  margin-top: 12px;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1989fa;
  color: #fff;
}

.message.user .avatar {
  background: #07c160;
}

.content-wrapper {
  max-width: 70%;
  margin: 0 12px;
}

.message-content {
  padding: 12px;
  border-radius: 8px;
  background: #fff;
  word-break: break-word;
}

.message.user .message-content {
  background: #1989fa;
  color: #fff;
}

.message-content :deep(pre) {
  background: #1e1e1e;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.message-content :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.message-content :deep(p) {
  margin: 8px 0;
}

.message-content :deep(p:first-child) {
  margin-top: 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #969799;
  animation: bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #ebedf0;
}

.input-area .van-field {
  flex: 1;
  background: #f7f8fa;
  border-radius: 20px;
  padding: 8px 16px;
}
</style>