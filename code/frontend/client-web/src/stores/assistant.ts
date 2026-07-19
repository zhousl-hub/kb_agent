import { defineStore } from 'pinia'
import { ref } from 'vue'
import { assistantApi } from '@/api'
import type { AIAssistant, AssistantSession, AssistantMessage } from '@/types'

export const useAssistantStore = defineStore('assistant', () => {
  const assistants = ref<AIAssistant[]>([])
  const currentAssistant = ref<AIAssistant | null>(null)
  const myAssistants = ref<AIAssistant[]>([])
  const popularAssistants = ref<AIAssistant[]>([])
  const sessions = ref<AssistantSession[]>([])
  const currentSessionId = ref<string | null>(null)
  const messages = ref<AssistantMessage[]>([])
  const isStreaming = ref(false)

  let abortController: { abort: () => void } | null = null

  async function loadAssistants() {
    const data = await assistantApi.getList()
    assistants.value = data.items.map((a) => ({ ...a, isPopular: false, isMyAssistant: false }))
  }

  async function loadMyAssistants() {
    const data = await assistantApi.getList()
    myAssistants.value = data.items.map((a) => ({ ...a, isMyAssistant: true, isPopular: false }))
  }

  async function loadPopularAssistants() {
    const data = await assistantApi.getList()
    popularAssistants.value = data.items.map((a) => ({ ...a, isPopular: true, isMyAssistant: false }))
  }

  function selectAssistant(assistant: AIAssistant | null) {
    currentAssistant.value = assistant
    currentSessionId.value = null
    messages.value = []
  }

  async function createAssistant(data: Partial<AIAssistant>) {
    const newAssistant: AIAssistant = {
      id: `temp-${Date.now()}`,
      name: data.name || '新助手',
      description: data.description || '',
      avatar: data.avatar || '',
      category: data.category || 'general',
      capabilities: data.capabilities || [],
      systemPrompt: data.systemPrompt || '',
      isMyAssistant: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    myAssistants.value.unshift(newAssistant)
    return newAssistant
  }

  async function updateAssistant(id: string, data: Partial<AIAssistant>) {
    const index = myAssistants.value.findIndex((a) => a.id === id)
    if (index !== -1) {
      myAssistants.value[index] = {
        ...myAssistants.value[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
    }
  }

  async function deleteAssistant(id: string) {
    myAssistants.value = myAssistants.value.filter((a) => a.id !== id)
    if (currentAssistant.value?.id === id) {
      currentAssistant.value = null
    }
  }

  async function loadSessions(assistantId: string) {
    const data = await assistantApi.getSessionsByAssistant(assistantId)
    sessions.value = data.items
  }

  async function createSession(assistantId: string, title?: string) {
    const session = await assistantApi.createSession(assistantId, title)
    sessions.value.unshift(session)
    currentSessionId.value = session.id
    messages.value = []
    return session
  }

  async function loadMessages(sessionId: string) {
    const data = await assistantApi.getMessages(sessionId)
    messages.value = data.items
  }

  async function deleteSession(sessionId: string) {
    await assistantApi.deleteSession(sessionId)
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = null
      messages.value = []
    }
  }

  function sendMessage(content: string) {
    if (!content.trim() || isStreaming.value || !currentAssistant.value) return

    const userMessage: AssistantMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    messages.value.push(userMessage)

    const assistantMessage: AssistantMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    messages.value.push(assistantMessage)
    isStreaming.value = true

    abortController = assistantApi.chat(
      {
        assistantId: currentAssistant.value.id,
        query: content.trim(),
        conversationId: currentSessionId.value || undefined,
      },
      (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            assistantMessage.content += parsed.content
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

  return {
    assistants,
    currentAssistant,
    myAssistants,
    popularAssistants,
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    loadAssistants,
    loadMyAssistants,
    loadPopularAssistants,
    selectAssistant,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    loadSessions,
    createSession,
    loadMessages,
    deleteSession,
    sendMessage,
    stopStreaming,
  }
}, {
  persist: {
    key: 'client-assistant',
    storage: localStorage,
    pick: ['currentAssistant', 'currentSessionId'],
  },
})