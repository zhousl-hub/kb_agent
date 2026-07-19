import { get, post } from '@/api/request'
// 导入类型而不是具体的类型名称
import type { SearchParams, SearchResult, SearchResponse } from '@/types/search'

export interface AdvancedSearchRequest {
  query: string
  type?: 'all' | 'document' | 'report' | 'ai'
  fieldWeights?: Record<string, number>
  fuzzyMatch?: boolean
  phraseMatch?: boolean
  wildcards?: boolean
  caseSensitive?: boolean
  proximityDistance?: number
  searchMode?: 'fulltext' | 'semantic' | 'hybrid'
  knowledgeIds?: string[]
  docTypes?: string[]
  tags?: string[]
  dateRange?: string[] | null
  fileSizes?: [number, number]
  sortBy?: string
  page?: number
  pageSize?: number
}

export interface DetailedSearchResult {
  id: string
  documentId: string
  documentName: string
  knowledgeId: string
  knowledgeName: string
  content: string
  score: number
  highlight?: string
  fileSize?: number
  segmentCount?: number
  author?: string
  summary?: string
  matchedTerms?: string[]
  createdAt?: string
  docType?: string
  viewCount?: number
  tags?: string[]
  type: 'document' | 'report' | 'ai'
  source?: string
  timestamp: string
}

/**
 * 执行高级搜索请求
 */
export const advancedSearch = (params: AdvancedSearchRequest): Promise<SearchResponse> => {
  console.log('执行高级搜索:', params);
  // 实际的API调用会在这里发生
  // return post('/search', params)
  // 返回模拟响应
  return Promise.resolve({
    results: [],
    total: 0,
    took: 1
  });
}

/**
 * 执行标准搜索
 */
export const search = (params: SearchParams): Promise<SearchResponse> => {
  console.log('执行搜索:', params);
  // 返回模拟响应
  return Promise.resolve({
    results: [],
    total: 0,
    took: 1
  });
}

/**
 * 获取搜索建议
 */
export const getSearchSuggestions = (query: string): Promise<{ suggestions: string[] }> => {
  // return get('/search/suggestions', {
  //   params: { q: query }
  // })
  // 返回模拟响应
  return Promise.resolve({
    suggestions: []
  });
}

/**
 * 获取热门搜索关键词
 */
export const getHotSearchKeywords = (): Promise<{ keywords: string[] }> => {
  // return get('/search/hot-keywords')
  // 返回模拟响应
  return Promise.resolve({
    keywords: ['API文档', '用户手册', '安全指南', '技术规范']
  });
}

/**
 * 获取可用的标签
 */
export const getSearchTags = (): Promise<{ tags: string[] }> => {
  // return get('/search/tags')
  // 返回模拟响应
  return Promise.resolve({
    tags: ['产品文档', '技术文档', '操作手册']
  });
}

/**
 * 获取搜索历史
 */
export const getSearchHistory = (): any[] => {
  const history = localStorage.getItem('search_history')
  return history ? JSON.parse(history) : []
}

/**
 * 添加查询到搜索历史
 */
export const addSearchHistory = (query: string): void => {
  const history = getSearchHistory()
  // 移除已有项
  const filtered = history.filter((item: string) => item !== query)
  // 添加新项到开头，限制数量为20
  const updated = [query, ...filtered].slice(0, 20)
  localStorage.setItem('search_history', JSON.stringify(updated))
}