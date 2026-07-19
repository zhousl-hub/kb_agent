export interface UserInfo {
  id: string
  username: string
  nickname: string
  name?: string
  avatar: string
  email: string
  phone?: string
  tenantId: string | number
  tenantName?: string
  createdAt: string
  updatedAt?: string
  roles?: string[]
}

export interface KnowledgeSpace {
  id: string
  name: string
  spaceName?: string
  spaceCode?: string
  description: string
  icon?: string
  type?: string
  embeddingModel?: string
  documentCount?: number
  ownerId?: string
  status?: number
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  spaceId: string
  docName?: string
  name?: string
  docType?: string
  type?: string
  fileSize?: number
  size?: number
  processStatus?: string
  status?: string
  segmentCount?: number
  createdAt: string
  updatedAt: string
}

// 助手类型
export type AIAssistant = Assistant

export interface Assistant {
  id: string
  name: string
  description: string
  avatar: string
  category: string
  capabilities: string[]
  systemPrompt?: string
  isMyAssistant: boolean
  isPopular: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  references?: Array<{
    id: string
    title: string
    content: string
    score: number
    source: string
  }>
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface AssistantSession {
  id: string
  assistantId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// 报告类型定义
export interface Report {
  id: string
  tenantId: string
  spaceId: string
  title: string
  reportType?: string
  reportFormat?: string
  content: string
  aiGenerated?: boolean
  generateStatus?: string
  publishStatus?: string
  publishTime?: string
  viewCount?: number
  downloadCount?: number
  ownerId: string
  status: number
  createTime: string
  updateTime: string
  version: number
  authorName?: string
  departmentName?: string
}

// 报告版本类型
export interface ReportVersion {
  id: string
  reportId: string       // 映射 report_id
  version: number        // 映射 version_number
  title?: string         // 映射 version_name
  content: string        // 映射 content
  changeSummary?: string // 映射 change_summary
  createdBy: string      // 映射 create_by
  createdByName?: string // 创建者姓名（前端获取）
  createdAt: string      // 映射 create_time
  status?: number        // 状态
}

export interface SearchResult {
  id: string
  content: string
  sourceTitle: string
  sourceUrl?: string
  score: number
  highlight?: string
  metadata: Record<string, any>
}

// 分页类型定义
export interface PageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  [key: string]: any
}

export interface PaginatedResponse<T> extends PageResult<T> {}

// 搜索参数类型
export interface SearchParams {
  query: string
  spaceId?: string
  pageNum?: number
  pageSize?: number
  filters?: Record<string, any>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  pageSize: number
}

// 聊天参数类型
export interface ChatParams {
  message: string
  query?: string
  sessionId?: string
  stream?: boolean
  knowledge_base_id?: string
  knowledgeIds?: string[]
  conversation_id?: string
}

// 助手聊天参数
export interface AssistantChatParams {
  assistantId: string
  message: string
  query?: string
  sessionId?: string
  conversationId?: string
  stream?: boolean
}

// 知识库参数类型
export interface CreateKnowledgeSpaceParams {
  name: string
  spaceName?: string
  spaceCode?: string
  description?: string
  type?: number
  embeddingModel?: string
}

export interface UpdateKnowledgeSpaceParams {
  name?: string
  description?: string
  type?: number
}