import { get, post, del, createSSEConnection } from './request'
import type { ChatMessage, ChatSession, ChatParams, PaginatedResponse } from '@/types'

export const chatApi = {
  createSession: (appId: string = 'default', title?: string) => 
    post<ChatSession>('/v1/chat/sessions', null, { params: { appId, title } }),
  
  getSessions: (appId?: string, pageNum = 1, pageSize = 10) => 
    get<PaginatedResponse<ChatSession>>('/v1/chat/sessions', { appId, pageNum, pageSize }),
  
  getSession: (sessionId: string) => 
    get<ChatSession>(`/v1/chat/sessions/${sessionId}`),
  
  getMessages: (sessionId: string, pageNum = 1, pageSize = 20) => 
    get<PaginatedResponse<ChatMessage>>(`/v1/chat/sessions/${sessionId}/messages`, { pageNum, pageSize }),
  
  sendMessage: (params: ChatParams, onMessage: (data: string) => void, onComplete?: () => void) => {
    return createSSEConnection('/v1/chat/send', params, {
      onMessage,
      onComplete
    })
  },
  
  chat: (params: ChatParams, onMessage: (data: string) => void, onComplete?: () => void) => {
    return createSSEConnection('/v1/chat', params, {
      onMessage,
      onComplete
    })
  },
  
  deleteSession: (id: string) => del<void>(`/v1/chat/sessions/${id}`),
}