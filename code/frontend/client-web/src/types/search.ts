// 定义Search API类型

export interface SearchParams {
  query: string
  type?: 'all' | 'document' | 'report' | 'ai'
  knowledgeIds?: string[]
  docTypes?: string[]
  tags?: string[]
  dateRange?: string[] | null
  sortBy?: string
  page?: number
  pageSize?: number
}

export interface SearchResult {
  id: string
  title: string
  content: string
  type: 'document' | 'report' | 'ai'
  source?: string
  score: number
  timestamp: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  took: number
}

// 知识空间类型
export interface KnowledgeSpace {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// 文档搜索结果扩展类型
export interface DocumentSearchResult {
  id: string
  documentId: string
  documentName: string
  knowledgeId: string
  knowledgeName: string
  content: string
  score: number
  highlight?: string
}