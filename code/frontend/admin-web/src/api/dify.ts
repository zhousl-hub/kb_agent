import { get, post, put, del, type PageResult, type PageParams } from './request'

export interface DifyApp {
  id: string
  name: string
  description?: string
  appId: string
  status: 'active' | 'inactive'
  knowledgeSpaceIds: string[]
  knowledgeSpaceNames: string[]
  modelProvider?: string
  modelName?: string
  callCount: number
  lastCallAt?: string
  createdAt: string
  updatedAt: string
}

export interface ModelProvider {
  id: string
  name: string
  type: 'local' | 'domestic' | 'international'
  status: 'connected' | 'disconnected' | 'error'
  endpoint: string
  models: ModelInfo[]
  config: Record<string, any>
  latency?: number
  errorRate?: number
  createdAt: string
}

export interface ModelInfo {
  id: string
  name: string
  contextLength: number
  maxOutputTokens: number
  supportsFunctionCall: boolean
  supportsVision: boolean
  inputPrice: number
  outputPrice: number
}

export interface ModelRouter {
  id: string
  name: string
  appId?: string
  appName?: string
  primaryModelId: string
  primaryModelName: string
  fallbackModelId?: string
  fallbackModelName?: string
  strategy: 'quality' | 'cost' | 'latency' | 'custom'
  conditions?: Record<string, any>
  enabled: boolean
  createdAt: string
}

export const difyApi = {
  getApps: (params: PageParams) => get<PageResult<DifyApp>>('/dify/apps', params),
  getApp: (id: string) => get<DifyApp>(`/dify/apps/${id}`),
  createApp: (data: Partial<DifyApp>) => post<DifyApp>('/dify/apps', data),
  updateApp: (id: string, data: Partial<DifyApp>) => put<DifyApp>(`/dify/apps/${id}`, data),
  deleteApp: (id: string) => del<void>(`/dify/apps/${id}`),
  testApp: (id: string, query: string) => post<{ response: string }>(`/dify/apps/${id}/test`, { query }),
  bindKnowledgeSpaces: (id: string, spaceIds: string[]) => 
    post<void>(`/dify/apps/${id}/bind-knowledge`, { spaceIds }),
}

export const modelApi = {
  getProviders: (params: PageParams) => get<PageResult<ModelProvider>>('/model/providers', params),
  getProvider: (id: string) => get<ModelProvider>(`/model/providers/${id}`),
  createProvider: (data: Partial<ModelProvider>) => post<ModelProvider>('/model/providers', data),
  updateProvider: (id: string, data: Partial<ModelProvider>) => put<ModelProvider>(`/model/providers/${id}`, data),
  deleteProvider: (id: string) => del<void>(`/model/providers/${id}`),
  testProvider: (id: string) => post<{ success: boolean; latency: number }>(`/model/providers/${id}/test`),
  testInference: (id: string, prompt: string) => post<{ output: string; tokens: number }>(`/model/providers/${id}/inference`, { prompt }),

  getRouters: (params: PageParams) => get<PageResult<ModelRouter>>('/model/routers', params),
  getRouter: (id: string) => get<ModelRouter>(`/model/routers/${id}`),
  createRouter: (data: Partial<ModelRouter>) => post<ModelRouter>('/model/routers', data),
  updateRouter: (id: string, data: Partial<ModelRouter>) => put<ModelRouter>(`/model/routers/${id}`, data),
  deleteRouter: (id: string) => del<void>(`/model/routers/${id}`),
}