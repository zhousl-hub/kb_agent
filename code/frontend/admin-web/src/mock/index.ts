import type { ApiResponse, PageResult } from '@/api/request'
import type { LoginForm, LoginResult, UserInfo } from '@/types/user'
import type { KnowledgeSpace, DataSource } from '@/api/knowledge'
import type { ModelProvider, ModelRouter, DifyApp } from '@/api/dify'
import type { AuditLog, MonitorMetrics, Activity, AppUsage } from '@/api/system'
import type { PermissionNode, SecurityLevel, RolePermissions } from '@/api/permission'

import {
  mockUsers,
  mockRoles,
  mockMenus,
  findUserByUsername,
  validatePassword,
  getUserPermissions,
} from './data/users'
import {
  mockKnowledgeSpaces,
  mockDataSources,
  mockSyncTasks,
  mockSplitStrategies,
  mockMetadataRules,
  mockKnowledgeTags,
} from './data/knowledge'
import {
  mockModelProviders,
  mockModelRouters,
  mockDifyApps,
} from './data/models'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function success<T>(data: T, message = '操作成功'): ApiResponse<T> {
  return { code: 200, message, data }
}

function error(message: string): ApiResponse<null> {
  return { code: 500, message, data: null }
}

function paginate<T>(list: T[], params: Record<string, any> = {}): PageResult<T> {
  const { pageNum = 1, pageSize = 10, keyword } = params
  let filtered = list
  
  if (keyword) {
    const kw = keyword.toLowerCase()
    filtered = list.filter((item: any) => 
      item.name?.toLowerCase().includes(kw) ||
      item.title?.toLowerCase().includes(kw) ||
      item.username?.toLowerCase().includes(kw) ||
      item.nickname?.toLowerCase().includes(kw)
    )
  }
  
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  
  return {
    list: filtered.slice(start, end),
    total: filtered.length,
    pageNum,
    pageSize,
  }
}

interface MockHandler {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  pattern: RegExp
  handler: (url: string, body?: any, headers?: Record<string, string>) => Promise<ApiResponse<any>>
}

const mockHandlers: MockHandler[] = [
  // Auth APIs
  {
    method: 'POST',
    pattern: /^\/auth\/login$/,
    handler: async (_url, body) => {
      const { username, password } = body as LoginForm
      await delay(300)
      
      if (!username || !validatePassword(username, password ?? '')) {
        return error('用户名或密码错误')
      }
      
      const user = findUserByUsername(username)
      if (!user) {
        return error('用户不存在')
      }
      
      const result: LoginResult = {
        token: `mock-token-${username}-${Date.now()}`,
        refreshToken: `mock-refresh-${username}-${Date.now()}`,
        expiresIn: 7200,
        userInfo: user,
      }
      
      return success(result)
    },
  },
  {
    method: 'POST',
    pattern: /^\/auth\/logout$/,
    handler: async () => {
      await delay(100)
      return success(null)
    },
  },
  {
    method: 'GET',
    pattern: /^\/auth\/me$/,
    handler: async (_url, _body, headers) => {
      await delay(100)
      const token = headers?.Authorization?.replace('Bearer ', '') || ''
      const username = token.split('-')[2]
      const user = findUserByUsername(username)
      if (!user) {
        return error('未登录')
      }
      return success(user)
    },
  },
  {
    method: 'GET',
    pattern: /^\/permissions\/menus$/,
    handler: async () => {
      await delay(100)
      return success(mockMenus)
    },
  },
  {
    method: 'GET',
    pattern: /^\/permissions\/list$/,
    handler: async (_url, _body, headers) => {
      await delay(100)
      const token = headers?.Authorization?.replace('Bearer ', '') || ''
      const username = token.split('-')[2]
      const permissions = getUserPermissions(username)
      return success(permissions)
    },
  },
  
  // User APIs
  {
    method: 'GET',
    pattern: /^\/users$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockUsers, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/users\/[^/]+$/,
    handler: async (url) => {
      await delay(100)
      const id = url.split('/').pop()
      const user = mockUsers.find(u => u.id === id)
      return user ? success(user) : error('用户不存在')
    },
  },
  {
    method: 'POST',
    pattern: /^\/users$/,
    handler: async (_url, body) => {
      await delay(200)
      const newUser: UserInfo = {
        id: `user-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        status: 1,
      }
      mockUsers.push(newUser as any)
      return success(newUser)
    },
  },
  {
    method: 'PUT',
    pattern: /^\/users\/[^/]+$/,
    handler: async (url, body) => {
      await delay(200)
      const id = url.split('/').pop()
      const index = mockUsers.findIndex(u => u.id === id)
      if (index === -1) return error('用户不存在')
      mockUsers[index] = { ...mockUsers[index], ...body } as UserInfo
      return success(mockUsers[index])
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/users\/[^/]+$/,
    handler: async (url) => {
      await delay(200)
      const id = url.split('/').pop()
      const index = mockUsers.findIndex(u => u.id === id)
      if (index === -1) return error('用户不存在')
      mockUsers.splice(index, 1)
      return success(null)
    },
  },
  
  // Role APIs
  {
    method: 'GET',
    pattern: /^\/roles$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockRoles, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/roles\/[^/]+$/,
    handler: async (url) => {
      await delay(100)
      const id = url.split('/').pop()
      const role = mockRoles.find(r => r.id === id)
      return role ? success(role) : error('角色不存在')
    },
  },
  
  // Knowledge Space APIs
  {
    method: 'GET',
    pattern: /^\/knowledge\/spaces$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockKnowledgeSpaces, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/knowledge\/spaces\/[^/]+$/,
    handler: async (url) => {
      await delay(100)
      const id = url.split('/').pop()
      const space = mockKnowledgeSpaces.find(s => s.id === id)
      return space ? success(space) : error('知识空间不存在')
    },
  },
  {
    method: 'POST',
    pattern: /^\/knowledge\/spaces$/,
    handler: async (_url, body) => {
      await delay(200)
      const newSpace: KnowledgeSpace = {
        id: `ks-${Date.now()}`,
        ...body,
        documentCount: 0,
        segmentCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockKnowledgeSpaces.push(newSpace)
      return success(newSpace)
    },
  },
  {
    method: 'PUT',
    pattern: /^\/knowledge\/spaces\/[^/]+$/,
    handler: async (url, body) => {
      await delay(200)
      const id = url.split('/').pop()
      const index = mockKnowledgeSpaces.findIndex(s => s.id === id)
      if (index === -1) return error('知识空间不存在')
      mockKnowledgeSpaces[index] = { ...mockKnowledgeSpaces[index], ...body, updatedAt: new Date().toISOString() }
      return success(mockKnowledgeSpaces[index])
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/knowledge\/spaces\/[^/]+$/,
    handler: async (url) => {
      await delay(200)
      const id = url.split('/').pop()
      const index = mockKnowledgeSpaces.findIndex(s => s.id === id)
      if (index === -1) return error('知识空间不存在')
      mockKnowledgeSpaces.splice(index, 1)
      return success(null)
    },
  },
  
  // Data Source APIs
  {
    method: 'GET',
    pattern: /^\/knowledge\/datasources$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockDataSources, params))
    },
  },
  {
    method: 'POST',
    pattern: /^\/knowledge\/datasources$/,
    handler: async (_url, body) => {
      await delay(200)
      const newDS: DataSource = {
        id: `ds-${Date.now()}`,
        ...body,
        status: 'disconnected',
        createdAt: new Date().toISOString(),
      }
      mockDataSources.push(newDS)
      return success(newDS)
    },
  },
  
  // Sync Task APIs
  {
    method: 'GET',
    pattern: /^\/knowledge\/sync-tasks$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockSyncTasks, params))
    },
  },
  
  // Split Strategy APIs
  {
    method: 'GET',
    pattern: /^\/knowledge\/split-strategies$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockSplitStrategies, params))
    },
  },
  
  // Metadata Rule APIs
  {
    method: 'GET',
    pattern: /^\/knowledge\/metadata-rules$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockMetadataRules, params))
    },
  },
  
  // Knowledge Tag APIs
  {
    method: 'GET',
    pattern: /^\/knowledge\/tags$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockKnowledgeTags, params))
    },
  },
  
  // Model Provider APIs
  {
    method: 'GET',
    pattern: /^\/model\/providers$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockModelProviders, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/model\/providers\/[^/]+$/,
    handler: async (url) => {
      await delay(100)
      const id = url.split('/').pop()
      const provider = mockModelProviders.find(p => p.id === id)
      return provider ? success(provider) : error('供应商不存在')
    },
  },
  {
    method: 'POST',
    pattern: /^\/model\/providers$/,
    handler: async (_url, body) => {
      await delay(200)
      const newProvider: ModelProvider = {
        id: `mp-${Date.now()}`,
        ...body,
        status: 'disconnected',
        models: [],
        createdAt: new Date().toISOString(),
      }
      mockModelProviders.push(newProvider)
      return success(newProvider)
    },
  },
  {
    method: 'POST',
    pattern: /^\/model\/providers\/[^/]+\/test$/,
    handler: async (url) => {
      await delay(500)
      const id = url.split('/')[3]
      const provider = mockModelProviders.find(p => p.id === id)
      if (!provider) return error('供应商不存在')
      return success({ success: true, latency: Math.floor(Math.random() * 200) + 50 })
    },
  },
  
  // Model Router APIs
  {
    method: 'GET',
    pattern: /^\/model\/routers$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockModelRouters, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/model\/routers\/[^/]+$/,
    handler: async (url) => {
      await delay(100)
      const id = url.split('/').pop()
      const router = mockModelRouters.find(r => r.id === id)
      return router ? success(router) : error('路由不存在')
    },
  },
  {
    method: 'POST',
    pattern: /^\/model\/routers$/,
    handler: async (_url, body) => {
      await delay(200)
      const newRouter: ModelRouter = {
        id: `mr-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      }
      mockModelRouters.push(newRouter)
      return success(newRouter)
    },
  },
  
  // Dify App APIs
  {
    method: 'GET',
    pattern: /^\/dify\/apps$/,
    handler: async (url) => {
      await delay(200)
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(mockDifyApps, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/dify\/apps\/[^/]+$/,
    handler: async (url) => {
      await delay(100)
      const id = url.split('/').pop()
      const app = mockDifyApps.find(a => a.id === id)
      return app ? success(app) : error('应用不存在')
    },
  },
  {
    method: 'POST',
    pattern: /^\/dify\/apps$/,
    handler: async (_url, body) => {
      await delay(200)
      const newApp: DifyApp = {
        id: `app-${Date.now()}`,
        ...body,
        callCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockDifyApps.push(newApp)
      return success(newApp)
    },
  },
  
  // Dashboard APIs
  {
    method: 'GET',
    pattern: /^\/dashboard\/stats$/,
    handler: async () => {
      await delay(200)
      const stats = {
        knowledgeCount: 12586,
        knowledgeGrowth: 12.5,
        activeUsers: 856,
        userGrowth: 8.2,
        aiCalls: 23451,
        aiCallsGrowth: 24.8,
        knowledgeSources: 18,
        sourceGrowth: 2,
      }
      return success(stats)
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/trend\/knowledge$/,
    handler: async () => {
      await delay(200)
      return success({
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        values: [1200, 1900, 3000, 5000, 8000, 12000],
      })
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/trend\/query$/,
    handler: async () => {
      await delay(200)
      return success({
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        values: [1200, 1500, 980, 2300, 1800, 500],
      })
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/activities$/,
    handler: async (url) => {
      await delay(200)
      const activities: Activity[] = [
        { id: '1', time: '2026-03-10 14:30', type: '知识导入', operator: '张小明', detail: '导入产品文档 50 份', status: 'success' },
        { id: '2', time: '2026-03-10 13:15', type: '模型更新', operator: '系统', detail: '更新大语言模型至 v2.1', status: 'success' },
        { id: '3', time: '2026-03-10 11:45', type: '用户创建', operator: '管理员', detail: '创建新用户 李华', status: 'success' },
        { id: '4', time: '2026-03-10 10:20', type: '应用发布', operator: '王经理', detail: '发布销售助手应用', status: 'pending' },
        { id: '5', time: '2026-03-10 09:05', type: '权限变更', operator: '管理员', detail: '更新研发组权限', status: 'success' },
        { id: '6', time: '2026-03-09 16:30', type: '知识导入', operator: '李华', detail: '导入技术文档 30 份', status: 'failed' },
        { id: '7', time: '2026-03-09 15:00', type: '配置更新', operator: '管理员', detail: '更新系统配置', status: 'success' },
        { id: '8', time: '2026-03-09 14:20', type: '应用发布', operator: '张小明', detail: '发布智能客服应用', status: 'success' },
      ]
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(activities, params))
    },
  },
  {
    method: 'GET',
    pattern: /^\/dashboard\/app-usage$/,
    handler: async () => {
      await delay(200)
      const usage: AppUsage[] = [
        { name: '智能客服', value: 35 },
        { name: '销售助手', value: 25 },
        { name: '研发助手', value: 20 },
        { name: '运营助手', value: 15 },
        { name: '其他', value: 5 },
      ]
      return success(usage)
    },
  },
  
  // Audit APIs
  {
    method: 'GET',
    pattern: /^\/audit\/logs$/,
    handler: async (url) => {
      await delay(200)
      const logs: AuditLog[] = [
        {
          id: 'log-001',
          userId: 'user-admin-001',
          username: 'admin',
          action: 'login',
          resource: 'auth',
          ip: '192.168.1.100',
          status: 'success',
          createdAt: '2025-03-10T08:00:00Z',
        },
        {
          id: 'log-002',
          userId: 'user-zhangsan-001',
          username: 'zhangsan',
          action: 'create',
          resource: 'knowledge_space',
          resourceId: 'ks-001',
          detail: '创建知识空间: 产品文档知识库',
          ip: '192.168.1.101',
          status: 'success',
          createdAt: '2025-03-10T07:30:00Z',
        },
      ]
      const params = Object.fromEntries(new URLSearchParams(url.split('?')[1] || ''))
      return success(paginate(logs, params))
    },
  },
  
  // Monitor APIs
  {
    method: 'GET',
    pattern: /^\/monitor\/metrics$/,
    handler: async () => {
      await delay(200)
      const metrics: MonitorMetrics = {
        qps: 45.6,
        p95Latency: 234,
        errorRate: 0.002,
        hitRate: 0.89,
        embeddingCost: 12.5,
        retrievalCost: 8.3,
        llmCost: 156.7,
      }
      return success(metrics)
    },
  },
  
  // Permission APIs
  {
    method: 'GET',
    pattern: /^\/permissions\/tree$/,
    handler: async () => {
      await delay(200)
      const tree: PermissionNode[] = [
        {
          id: 'knowledge',
          label: '知识管理',
          children: [
            { id: 'knowledge:read', label: '查看' },
            { id: 'knowledge:write', label: '编辑' },
            { id: 'knowledge:delete', label: '删除' },
          ],
        },
        {
          id: 'document',
          label: '文档管理',
          children: [
            { id: 'document:read', label: '查看' },
            { id: 'document:write', label: '编辑' },
            { id: 'document:delete', label: '删除' },
          ],
        },
        {
          id: 'model',
          label: '模型管理',
          children: [
            { id: 'model:read', label: '查看' },
            { id: 'model:write', label: '编辑' },
            { id: 'model:delete', label: '删除' },
          ],
        },
        {
          id: 'user',
          label: '用户管理',
          children: [
            { id: 'user:read', label: '查看' },
            { id: 'user:write', label: '编辑' },
            { id: 'user:delete', label: '删除' },
          ],
        },
      ]
      return success(tree)
    },
  },
  {
    method: 'GET',
    pattern: /^\/permissions\/security-levels$/,
    handler: async () => {
      await delay(200)
      const levels: SecurityLevel[] = [
        { id: 'sl-1', name: '公开', description: '所有人可见', color: '#67C23A' },
        { id: 'sl-2', name: '内部', description: '仅内部人员可见', color: '#409EFF' },
        { id: 'sl-3', name: '机密', description: '仅授权人员可见', color: '#E6A23C' },
        { id: 'sl-4', name: '绝密', description: '仅高级管理层可见', color: '#F56C6C' },
      ]
      return success(levels)
    },
  },
  {
    method: 'GET',
    pattern: /^\/permissions\/roles\/[^/]+$/,
    handler: async (url) => {
      await delay(200)
      const roleId = url.split('/').pop()
      const role = mockRoles.find(r => r.id === roleId)
      if (!role) return error('角色不存在')
      const result: RolePermissions = {
        roleId: role.id,
        roleName: role.name,
        permissions: role.permissions,
        securityLevels: ['sl-1', 'sl-2'],
      }
      return success(result)
    },
  },
  
  // System Config APIs
  {
    method: 'GET',
    pattern: /^\/system\/config$/,
    handler: async () => {
      await delay(200)
      return success({
        siteName: 'KBA 知识库系统',
        siteDescription: '企业级知识库管理系统',
        enableRegister: false,
        enableCaptcha: true,
        maxUploadSize: 50,
        allowedFileTypes: ['pdf', 'docx', 'xlsx', 'pptx', 'md', 'txt'],
        defaultEmbeddingModel: 'text-embedding-3-small',
        defaultChatModel: 'gpt-4o-mini',
      })
    },
  },
]

function matchHandler(method: string, url: string): MockHandler | null {
  const path = url.replace(/^\/api/, '')
  for (const handler of mockHandlers) {
    if (handler.method === method && handler.pattern.test(path)) {
      return handler
    }
  }
  return null
}

export async function mockRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  headers?: Record<string, string>
): Promise<any> {
  const handler = matchHandler(method, url)
  
  if (!handler) {
    console.warn(`[Mock] No handler for ${method} ${url}`)
    return Promise.reject(new Error(`Mock handler not found for ${method} ${url}`))
  }
  
  const path = url.replace(/^\/api/, '')
  const response = await handler.handler(path, data, headers)
  
  if (response.code !== 200) {
    return Promise.reject(new Error(response.message))
  }
  
  return response.data
}

export function setupMock() {
  console.log('[Mock] Mock service initialized')
}

export const isMockEnabled = () => import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK !== 'false'