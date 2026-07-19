import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/api'
import type { ChatSession, ChatMessage } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const currentSessionId = ref<string | null>(null)
  const sessions = ref<ChatSession[]>([])
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const inputMessage = ref('')

  let abortController: { abort: () => void } | null = null

  async function loadSessions(appId?: string) {
    const data = await chatApi.getSessions(appId)
    sessions.value = data.items
  }

  function setCurrentSession(sessionId: string | null) {
    currentSessionId.value = sessionId
    if (sessionId) {
      loadMessages(sessionId)
    } else {
      messages.value = []
    }
  }

  async function loadMessages(sessionId: string) {
    const data = await chatApi.getMessages(sessionId)
    messages.value = data.items
  }

  async function createSession(appId?: string) {
    const title = appId ? `新对话 - ${appId}` : '新对话'
    const session = await chatApi.createSession(appId || 'default', title)
    sessions.value.unshift(session)
    currentSessionId.value = session.id
    messages.value = []
    return session
  }

  async function deleteSession(sessionId: string) {
    await chatApi.deleteSession(sessionId)
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = sessions.value.length > 0 ? sessions.value[0].id : null
      messages.value = []
    }
  }

  function sendMessage(content: string, knowledgeIds?: string[]) {
    if (!content.trim() || isStreaming.value) return

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    messages.value.push(userMessage)

    const assistantMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    messages.value.push(assistantMessage)
    isStreaming.value = true
    inputMessage.value = ''

    abortController = chatApi.chat(
      {
        query: content.trim(),
        knowledgeIds,
        conversationId: currentSessionId.value || undefined,
      },
      (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            assistantMessage.content += parsed.content
          }
          if (parsed.references) {
            assistantMessage.references = parsed.references
          }
        } catch {
          assistantMessage.content += data
        }
      },
      () => {
        isStreaming.value = false
        abortController = null
      }
    )
  }

  function stopStreaming() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isStreaming.value = false
  }

  function clearMessages() {
    messages.value = []
  }

  function setInputMessage(value: string) {
    inputMessage.value = value
  }

  return {
    currentSessionId,
    sessions,
    messages,
    isStreaming,
    inputMessage,
    setCurrentSession,
    loadSessions,
    createSession,
    deleteSession,
    loadMessages,
    sendMessage,
    stopStreaming,
    clearMessages,
    setInputMessage,
  }
}, {
  persist: {
    key: 'client-chat',
    storage: localStorage,
    pick: ['currentSessionId'],
  },
})