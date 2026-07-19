import { ref } from 'vue'
import { chatApi } from '@/api/chat'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: { id: string; title: string; content: string; score: number }[]
}

export function useChatStream() {
  const messages = ref<ChatMessage[]>([])
  const loading = ref(false)
  const currentContent = ref('')
  let abortController: { abort: () => void } | null = null

  const sendMessage = async (query: string, knowledgeIds?: string[], conversationId?: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    }
    messages.value.push(userMessage)

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      references: []
    }
    messages.value.push(assistantMessage)
    loading.value = true
    currentContent.value = ''

    abortController = chatApi.chat(
      { query, knowledgeIds, conversationId },
      (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.content) {
            currentContent.value += parsed.content
            assistantMessage.content = currentContent.value
          }
          if (parsed.references) {
            assistantMessage.references = parsed.references
          }
        } catch {
          currentContent.value += data
          assistantMessage.content = currentContent.value
        }
      },
      () => {
        loading.value = false
      }
    )
  }

  const abort = () => {
    abortController?.abort()
    loading.value = false
  }

  const clearMessages = () => {
    messages.value = []
    currentContent.value = ''
  }

  return {
    messages,
    loading,
    sendMessage,
    abort,
    clearMessages
  }
}