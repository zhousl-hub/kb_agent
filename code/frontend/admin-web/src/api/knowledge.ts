import { get, post, put, del, type PageResult, type PageParams } from './request'

export interface KnowledgeSpace {
  id: string
  name: string
  description?: string
  type: 'document' | 'faq' | 'structured'
  documentCount: number
  segmentCount: number
  status: 'active' | 'inactive' | 'indexing'
  createdAt: string
  updatedAt: string
}

export interface DataSource {
  id: string
  name: string
  type: 'upload' | 'database' | 'web' | 'api'
  config: Record<string, any>
  status: 'connected' | 'disconnected' | 'error'
  lastSyncAt?: string
  createdAt: string
}

export interface SyncTask {
  id: string
  dataSourceId: string
  dataSourceName: string
  type: 'full' | 'incremental'
  status: 'pending' | 'running' | 'success' | 'failed'
  progress: number
  documentCount: number
  successCount: number
  failedCount: number
  errorMessage?: string
  startedAt?: string
  finishedAt?: string
  createdAt: string
}

export interface SplitStrategy {
  id: string
  name: string
  description?: string
  type: 'fixed' | 'semantic' | 'custom'
  enabled: boolean
  config: {
    chunkSize?: number
    chunkOverlap?: number
    separator?: string
    preserveParagraph?: boolean
    semanticModel?: string
    customScript?: string
  }
  createdAt: string
  updatedAt: string
}

export interface MetadataRule {
  id: string
  name: string
  field: string
  label: string
  type: 'regex' | 'xpath' | 'llm' | 'builtin'
  pattern?: string
  xpath?: string
  llmPrompt?: string
  auto: boolean
  required: boolean
  defaultValue?: string
  options?: string[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeTag {
  id: string
  name: string
  type: string
  color: string
  description?: string
  spaceIds: string[]
  documentCount: number
  createdAt: string
  updatedAt: string
}

export const knowledgeApi = {
  getSpaces: (params: PageParams) => get<PageResult<KnowledgeSpace>>('/knowledge/spaces', params),
  getSpace: (id: string) => get<KnowledgeSpace>(`/knowledge/spaces/${id}`),
  createSpace: (data: Partial<KnowledgeSpace>) => post<KnowledgeSpace>('/knowledge/spaces', data),
  updateSpace: (id: string, data: Partial<KnowledgeSpace>) => put<KnowledgeSpace>(`/knowledge/spaces/${id}`, data),
  deleteSpace: (id: string) => del<void>(`/knowledge/spaces/${id}`),

  getDataSources: (params: PageParams) => get<PageResult<DataSource>>('/knowledge/datasources', params),
  createDataSource: (data: Partial<DataSource>) => post<DataSource>('/knowledge/datasources', data),
  testConnection: (id: string) => post<{ success: boolean; message: string }>(`/knowledge/datasources/${id}/test`),

  getSyncTasks: (params: PageParams) => get<PageResult<SyncTask>>('/knowledge/sync-tasks', params),
  createSyncTask: (data: { dataSourceId: string; type: 'full' | 'incremental' }) => post<SyncTask>('/knowledge/sync-tasks', data),
  cancelSyncTask: (id: string) => post<void>(`/knowledge/sync-tasks/${id}/cancel`),
  retrySyncTask: (id: string) => post<void>(`/knowledge/sync-tasks/${id}/retry`),

  getSplitStrategies: (params: PageParams) => get<PageResult<SplitStrategy>>('/knowledge/split-strategies', params),
  getSplitStrategy: (id: string) => get<SplitStrategy>(`/knowledge/split-strategies/${id}`),
  createSplitStrategy: (data: Partial<SplitStrategy>) => post<SplitStrategy>('/knowledge/split-strategies', data),
  updateSplitStrategy: (id: string, data: Partial<SplitStrategy>) => put<SplitStrategy>(`/knowledge/split-strategies/${id}`, data),
  deleteSplitStrategy: (id: string) => del<void>(`/knowledge/split-strategies/${id}`),

  getMetadataRules: (params: PageParams) => get<PageResult<MetadataRule>>('/knowledge/metadata-rules', params),
  getMetadataRule: (id: string) => get<MetadataRule>(`/knowledge/metadata-rules/${id}`),
  createMetadataRule: (data: Partial<MetadataRule>) => post<MetadataRule>('/knowledge/metadata-rules', data),
  updateMetadataRule: (id: string, data: Partial<MetadataRule>) => put<MetadataRule>(`/knowledge/metadata-rules/${id}`, data),
  deleteMetadataRule: (id: string) => del<void>(`/knowledge/metadata-rules/${id}`),

  getTags: (params: PageParams) => get<PageResult<KnowledgeTag>>('/knowledge/tags', params),
  getTag: (id: string) => get<KnowledgeTag>(`/knowledge/tags/${id}`),
  createTag: (data: Partial<KnowledgeTag>) => post<KnowledgeTag>('/knowledge/tags', data),
  updateTag: (id: string, data: Partial<KnowledgeTag>) => put<KnowledgeTag>(`/knowledge/tags/${id}`, data),
  deleteTag: (id: string) => del<void>(`/knowledge/tags/${id}`),
}