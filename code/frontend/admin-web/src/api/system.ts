import { get, post, type PageResult, type PageParams } from './request'

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  resource: string
  resourceId?: string
  detail?: string
  ip: string
  userAgent?: string
  status: 'success' | 'failed'
  createdAt: string
}

export interface DashboardStats {
  knowledgeCount: number
  knowledgeGrowth: number
  activeUsers: number
  userGrowth: number
  aiCalls: number
  aiCallsGrowth: number
  knowledgeSources: number
  sourceGrowth: number
}

export interface ChartData {
  labels: string[]
  values: number[]
}

export interface Activity {
  id: string
  time: string
  type: string
  operator: string
  detail: string
  status: 'success' | 'pending' | 'failed'
}

export interface AppUsage {
  name: string
  value: number
}

export interface MonitorMetrics {
  qps: number
  p95Latency: number
  errorRate: number
  hitRate: number
  embeddingCost: number
  retrievalCost: number
  llmCost: number
}

export const dashboardApi = {
  getStats: () => get<DashboardStats>('/dashboard/stats'),
  getKnowledgeTrend: (days: number) => get<ChartData>('/dashboard/trend/knowledge', { days }),
  getQueryTrend: (days: number) => get<ChartData>('/dashboard/trend/query', { days }),
  getRecentTasks: (limit: number) => get<any[]>('/dashboard/tasks/recent', { limit }),
  getActivities: (params: PageParams) => get<PageResult<Activity>>('/dashboard/activities', params),
  getAppUsage: () => get<AppUsage[]>('/dashboard/app-usage'),
}

export const auditApi = {
  getLogs: (params: PageParams & { userId?: string; action?: string; startTime?: string; endTime?: string }) => 
    get<PageResult<AuditLog>>('/audit/logs', params),
  exportLogs: (params: object) => post<{ url: string }>('/audit/logs/export', params),
}

export const monitorApi = {
  getMetrics: () => get<MonitorMetrics>('/monitor/metrics'),
  getQueryStats: (params: { startTime: string; endTime: string }) => 
    get<any[]>('/monitor/query-stats', params),
  getFeedbackList: (params: PageParams & { rating?: 'positive' | 'negative' }) => 
    get<PageResult<any>>('/monitor/feedback', params),
}

export const systemApi = {
  getConfig: () => get<Record<string, any>>('/system/config'),
  updateConfig: (data: Record<string, any>) => post<void>('/system/config', data),
  getLogs: (params: { level?: string; limit: number }) => get<string[]>('/system/logs', params),
}