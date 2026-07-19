import { get, post, put, del, createSSEConnection } from './request'
import type { Assistant, AssistantSession, AssistantMessage, AssistantChatParams, PaginatedResponse } from '@/types'

export interface CreateAssistantParams {
  name: string
  description?: string
  icon?: string
  systemPrompt?: string
}

function normalizePageResult<T>(data: PaginatedResponse<T> & { list?: T[] }): PaginatedResponse<T> {
  return {
    ...data,
    items: data.items ?? data.list ?? [],
  }
}

export const assistantApi = {
  getList: async (pageNum = 1, pageSize = 10, status?: string) => {
    const data = await get<PaginatedResponse<Assistant> & { list?: Assistant[] }>(
      '/v1/assistants',
      { pageNum, pageSize, status },
    )
    return normalizePageResult(data)
  },

  getById: (id: string) => get<Assistant>(`/v1/assistants/${id}`),

  create: (data: CreateAssistantParams) => post<Assistant>('/v1/assistants', data),

  update: (id: string, data: CreateAssistantParams) => put<Assistant>(`/v1/assistants/${id}`, data),

  delete: (id: string) => del<void>(`/v1/assistants/${id}`),

  getSessionsByAssistant: (assistantId: string, pageNum = 1, pageSize = 10) =>
    get<PaginatedResponse<AssistantSession>>(`/v1/assistants/${assistantId}/sessions`, { pageNum, pageSize }),

  getAllSessions: (pageNum = 1, pageSize = 10) =>
    get<PaginatedResponse<AssistantSession>>('/v1/assistant-sessions', { pageNum, pageSize }),

  getSession: (sessionId: string) => get<AssistantSession>(`/v1/assistant-sessions/${sessionId}`),

  getMessages: (sessionId: string, pageNum = 1, pageSize = 20) =>
    get<PaginatedResponse<AssistantMessage>>(`/v1/assistant-sessions/${sessionId}/messages`, { pageNum, pageSize }),

  createSession: (assistantId: string, title?: string) =>
    post<AssistantSession>('/v1/assistant-sessions', null, { params: { assistantId, title } }),

  deleteSession: (sessionId: string) => del<void>(`/v1/assistant-sessions/${sessionId}`),

  updateSessionTitle: (sessionId: string, title: string) =>
    put<void>(`/v1/assistant-sessions/${sessionId}/title`, { title }),

  chat: (
    params: AssistantChatParams,
    onMessage: (data: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void,
  ) => {
    const sessionId = params.sessionId || params.conversationId
    if (!sessionId) {
      onError?.(new Error('缺少会话ID'))
      return { abort: () => {} }
    }
    return createSSEConnection(`/v1/assistant-sessions/${sessionId}/messages`, params, {
      onMessage,
      onComplete,
      onError,
    })
  },
}