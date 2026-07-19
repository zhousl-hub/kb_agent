import { get, del } from './request'

export interface HistoryItem {
  id: string
  title: string
  preview: string
  knowledgeBaseName?: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

function mapHistoryItem(raw: Record<string, unknown>): HistoryItem {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? '未命名对话'),
    preview: String(raw.preview ?? ''),
    knowledgeBaseName: raw.knowledgeBaseName as string | undefined,
    messageCount: Number(raw.messageCount ?? 0),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
  }
}

export const historyApi = {
  getList: async (search?: string) => {
    const data = await get<Record<string, unknown>[]>('/v1/assistant-sessions', {
      pageNum: 1,
      pageSize: 50,
      search,
    })
    const list = Array.isArray(data) ? data : []
    return list.map(mapHistoryItem)
  },

  delete: (id: string) => del<void>(`/v1/assistant-sessions/${id}`),

  clearAll: () => del<void>('/v1/assistant-sessions'),
}
