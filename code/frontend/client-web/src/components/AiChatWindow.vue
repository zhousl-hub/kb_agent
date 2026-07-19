<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import ReferenceBlock from './ReferenceBlock.vue'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: { id: string; title: string; content: string; score: number }[]
  loading?: boolean
}

const props = defineProps<{
  messages: Message[]
  loading?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
}>()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

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

const renderMarkdown = (content: string) => {
  return marked.parse(content) as string
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => props.messages, scrollToBottom, { deep: true })

const handleSend = () => {
  if (!inputMessage.value.trim() || props.loading) return
  emit('send', inputMessage.value.trim())
  inputMessage.value = ''
}
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50">
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg p-3',
            message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white shadow'
          ]"
        >
          <div
            v-if="message.role === 'assistant'"
            class="prose prose-sm max-w-none"
            v-html="renderMarkdown(message.content)"
          />
          <div v-else>{{ message.content }}</div>
          <ReferenceBlock v-if="message.references?.length" :references="message.references" />
        </div>
      </div>
      <div v-if="loading" class="flex justify-start">
        <div class="bg-white rounded-lg p-3 shadow">
          <span class="animate-pulse">思考中...</span>
        </div>
      </div>
    </div>
    <div class="border-t bg-white p-4">
      <div class="flex gap-2">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="请输入问题..."
          class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="handleSend"
        />
        <button
          :disabled="!inputMessage.trim() || loading"
          class="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>