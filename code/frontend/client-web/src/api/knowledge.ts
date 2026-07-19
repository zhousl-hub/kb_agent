import { get, post, put, del } from './request'
import type {
  KnowledgeSpace,
  Document,
  SearchParams,
  SearchResponse,
  PaginatedResponse,
  CreateKnowledgeSpaceParams,
  UpdateKnowledgeSpaceParams,
} from '@/types'

function normalizePageResult<T>(data: PaginatedResponse<T> & { list?: T[] }): PaginatedResponse<T> {
  return {
    ...data,
    items: data.items ?? data.list ?? [],
    page: data.page ?? (data as { pageNum?: number }).pageNum ?? 1,
  }
}

function mapKnowledgeSpace(raw: Record<string, unknown>): KnowledgeSpace {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    icon: raw.icon as string | undefined,
    documentCount: raw.documentCount as number | undefined,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

function mapDocument(raw: Record<string, unknown>): Document {
  return {
    id: String(raw.id ?? ''),
    spaceId: String(raw.knowledgeId ?? raw.spaceId ?? ''),
    name: String(raw.name ?? ''),
    type: String(raw.type ?? ''),
    size: raw.size as number | undefined,
    status: String(raw.status ?? ''),
    chunkCount: raw.chunkCount as number | undefined,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

export const knowledgeApi = {
  getList: async (pageNum = 1, pageSize = 10, spaceId?: string) => {
    const data = await get<PaginatedResponse<KnowledgeSpace> & { list?: KnowledgeSpace[] }>(
      '/v1/knowledge',
      { pageNum, pageSize, spaceId },
    )
    const normalized = normalizePageResult(data)
    return {
      ...normalized,
      items: (normalized.items as Record<string, unknown>[]).map(mapKnowledgeSpace),
    }
  },

  getSpaces: async (pageNum = 1, pageSize = 10) => {
    return knowledgeApi.getList(pageNum, pageSize)
  },

  getById: async (id: string) => {
    const raw = await get<Record<string, unknown>>(`/v1/knowledge/${id}`)
    return mapKnowledgeSpace(raw)
  },

  create: async (params: CreateKnowledgeSpaceParams) => {
    const raw = await post<Record<string, unknown>>('/v1/knowledge', params)
    return mapKnowledgeSpace(raw)
  },

  update: async (id: string, params: UpdateKnowledgeSpaceParams) => {
    const raw = await put<Record<string, unknown>>(`/v1/knowledge/${id}`, params)
    return mapKnowledgeSpace(raw)
  },

  delete: (id: string) => del<void>(`/v1/knowledge/${id}`),

  getDocuments: async (spaceId: string, pageNum = 1, pageSize = 20) => {
    const data = await get<PaginatedResponse<Document> & { list?: Document[] }>(
      '/v1/documents',
      { page: pageNum, pageSize, knowledgeId: spaceId },
    )
    const normalized = normalizePageResult(data)
    return {
      ...normalized,
      items: (normalized.items as Record<string, unknown>[]).map(mapDocument),
    }
  },

  uploadDocument: async (spaceId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('knowledgeId', spaceId)
    const raw = await post<Record<string, unknown>>('/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return mapDocument(raw)
  },

  deleteDocument: (_spaceId: string, documentId: string) =>
    del<void>(`/v1/documents/${documentId}`),

  search: (query: string, knowledgeId?: string, topK = 5) =>
    post<SearchResponse>('/v1/search', { query, knowledgeId, topK }),

  advancedSearch: (params: SearchParams) =>
    post<SearchResponse>('/v1/search/advanced', params),

  getSuggestions: (query: string, knowledgeId?: string) =>
    get<string[]>('/v1/search/suggestions', { query, knowledgeId }),

  getStats: () => get<Record<string, unknown>>('/v1/knowledge/stats'),
}
