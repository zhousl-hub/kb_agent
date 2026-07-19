import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import {
  mockKnowledgeSpaces,
  mockDocuments,
  mockAssistants,
  mockChatSessions,
  mockChatMessages,
  mockAssistantSessions,
  mockAssistantMessages,
  mockSearchResults,
  mockRecentDocuments,
  mockUserTodos,
  mockKnowledgeStats,
  mockUserProfile,
  mockTags,
  mockFavorites,
  mockReports,
  mockReportVersions,
  mockReportSearchResults
} from './data'

type MockHandler = (config: InternalAxiosRequestConfig) => AxiosResponse | null

interface MockRoute {
  method: string
  url: RegExp | string
  handler: MockHandler
}

const createResponse = <T>(data: T, status = 200): AxiosResponse<T> => ({
  data: {
    code: 0,
    message: 'success',
    data
  } as unknown as T,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as InternalAxiosRequestConfig
})

const createPaginatedResponse = <T>(items: T[], total?: number): AxiosResponse<{ items: T[]; total: number; page: number; pageSize: number }> => ({
  data: {
    code: 0,
    message: 'success',
    data: {
      items,
      total: total ?? items.length,
      page: 1,
      pageSize: 10
    }
  } as unknown as { items: T[]; total: number; page: number; pageSize: number },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as InternalAxiosRequestConfig
})

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockRoutes: MockRoute[] = [
  // 认证相关
  {
    method: 'POST',
    url: '/api/auth/login',
    handler: () => createResponse({
      token: 'mock-jwt-token-' + Date.now(),
      user: mockUserProfile,
      expiresIn: 7200
    })
  },
  {
    method: 'POST',
    url: '/api/auth/logout',
    handler: () => createResponse({ success: true })
  },
  {
    method: 'POST',
    url: '/api/auth/register',
    handler: () => createResponse({
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...mockUserProfile, id: 'user-' + Date.now() },
      expiresIn: 7200
    })
  },

  // 用户相关
  {
    method: 'GET',
    url: '/api/user/profile',
    handler: () => createResponse(mockUserProfile)
  },
  {
    method: 'POST',
    url: '/api/user/profile',
    handler: () => createResponse({ success: true })
  },
  {
    method: 'POST',
    url: '/api/user/avatar',
    handler: () => createResponse({
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
    })
  },
  {
    method: 'POST',
    url: '/api/user/password',
    handler: () => createResponse({ success: true })
  },

  // 知识空间相关
  {
    method: 'GET',
    url: /^\/api\/knowledge\/spaces$/,
    handler: () => createPaginatedResponse(mockKnowledgeSpaces)
  },
  {
    method: 'POST',
    url: '/api/knowledge/spaces',
    handler: () => createResponse({
      id: 'ks-' + Date.now(),
      name: '新建知识空间',
      description: '',
      icon: 'folder',
      type: 'general',
      embeddingModel: 'text-embedding-ada-002',
      documentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },
  {
    method: 'PUT',
    url: /^\/api\/knowledge\/spaces\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/knowledge\/spaces\/([^/]+)$/)
      if (!match) return null
      const space = mockKnowledgeSpaces.find(s => s.id === match[1])
      if (!space) return createResponse(null, 404)
      return createResponse({ ...space, updatedAt: new Date().toISOString() })
    }
  },
  {
    method: 'GET',
    url: /^\/api\/knowledge\/spaces\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/knowledge\/spaces\/([^/]+)$/)
      if (!match) return null
      const space = mockKnowledgeSpaces.find(s => s.id === match[1])
      if (!space) return createResponse(null, 404)
      return createResponse(space)
    }
  },
  {
    method: 'GET',
    url: /^\/api\/knowledge\/spaces\/([^/]+)\/documents$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/knowledge\/spaces\/([^/]+)\/documents$/)
      if (!match) return null
      const knowledgeId = match[1]
      const docs = mockDocuments.filter(d => d.knowledgeId === knowledgeId)
      return createPaginatedResponse(docs)
    }
  },

  // 上传文档相关 - 统一路径在spaces下
  {
    method: 'POST',
    url: /^\/api\/knowledge\/spaces\/([^/]+)\/documents$/,
    handler: (config) => {
      // 模拟创建一个新的文档
      const match = config.url?.match(/\/api\/knowledge\/spaces\/([^/]+)\/documents$/)
      if (!match) return null
      const spaceId = match[1]
      return createResponse({
        id: 'doc-' + Date.now(),
        spaceId,
        docName: 'uploaded-document-' + Date.now() + '.pdf',
        docType: 'pdf',
        fileSize: 1024000,
        segmentCount: 10,
        processStatus: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  },

  // 搜索相关
  {
    method: 'POST',
    url: /^\/api\/search$/,
    handler: () => createResponse({
      results: mockSearchResults,
      total: mockSearchResults.length,
      took: 45
    })
  },
  {
    method: 'GET',
    url: '/api/search/tags',
    handler: () => createResponse(mockTags)
  },
  {
    method: 'DELETE',
    url: /^\/api\/favorites\/([^/]+)$/,
    handler: () => createResponse({ success: true })
  },

  // 聊天会话相关
  {
    method: 'GET',
    url: /^\/api\/chat\/sessions$/,
    handler: () => createPaginatedResponse(mockChatSessions)
  },
  {
    method: 'GET',
    url: /^\/api\/chat\/sessions\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/chat\/sessions\/([^/]+)$/)
      if (!match) return null
      const session = mockChatSessions.find(s => s.id === match[1])
      if (!session) return createResponse(null, 404)
      return createResponse(session)
    }
  },
  {
    method: 'GET',
    url: /^\/api\/chat\/sessions\/([^/]+)\/messages$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/chat\/sessions\/([^/]+)\/messages$/)
      if (!match) return null
      const messages = mockChatMessages[match[1]] || []
      return createPaginatedResponse(messages)
    }
  },
  {
    method: 'POST',
    url: /^\/api\/chat\/sessions\/([^/]+)\/delete$/,
    handler: () => createResponse({ success: true })
  },
  {
    method: 'POST',
    url: '/api/chat/history',
    handler: () => createPaginatedResponse(mockChatMessages['sess-001'] || [])
  },
  {
    method: 'POST',
    url: '/api/chat/completions',
    handler: () => createResponse({
      content: '这是一个模拟的AI回复内容。实际使用时，后端会根据知识库内容生成回答。',
      references: mockChatMessages['sess-001']?.[1]?.references || []
    })
  },

  // 助手相关
  {
    method: 'GET',
    url: /^\/api\/assistants$/,
    handler: () => createPaginatedResponse(mockAssistants)
  },
  {
    method: 'POST',
    url: '/api/assistants',
    handler: () => createResponse({
      id: 'asst-' + Date.now(),
      name: '新建助手',
      description: '',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + Date.now(),
      category: '通用',
      capabilities: [],
      systemPrompt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },
  {
    method: 'GET',
    url: /^\/api\/assistants\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/assistants\/([^/]+)$/)
      if (!match) return null
      const assistant = mockAssistants.find(a => a.id === match[1])
      if (!assistant) return createResponse(null, 404)
      return createResponse(assistant)
    }
  },
  {
    method: 'GET',
    url: /^\/api\/assistants\/([^/]+)\/sessions$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/assistants\/([^/]+)\/sessions$/)
      if (!match) return null
      const assistantId = match[1]
      const sessions = mockAssistantSessions.filter(s => s.assistantId === assistantId)
      return createPaginatedResponse(sessions)
    }
  },
  {
    method: 'GET',
    url: /^\/api\/assistant-sessions\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/assistant-sessions\/([^/]+)$/)
      if (!match) return null
      const session = mockAssistantSessions.find(s => s.id === match[1])
      if (!session) return createResponse(null, 404)
      return createResponse(session)
    }
  },
  {
    method: 'PUT',
    url: /^\/api\/assistant-sessions\/([^/]+)\/title$/,
    handler: () => createResponse({ success: true })
  },
  {
    method: 'GET',
    url: /^\/api\/assistant-sessions\/([^/]+)\/messages$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/assistant-sessions\/([^/]+)\/messages$/)
      if (!match) return null
      const messages = mockAssistantMessages[match[1]] || []
      return createPaginatedResponse(messages)
    }
  },

  // 用户相关
  {
    method: 'GET',
    url: /^\/api\/user\/recent-documents$/,
    handler: () => createResponse(mockRecentDocuments)
  },
  {
    method: 'GET',
    url: /^\/api\/user\/todos$/,
    handler: () => createResponse(mockUserTodos)
  },
  {
    method: 'POST',
    url: /^\/api\/user\/todos$/,
    handler: () => createResponse({ success: true })
  },
  {
    method: 'POST',
    url: /^\/api\/user\/todos\/([^/]+)\/toggle$/,
    handler: () => createResponse({ success: true })
  },
  {
    method: 'POST',
    url: /^\/api\/user\/todos\/([^/]+)\/delete$/,
    handler: () => createResponse({ success: true })
  },

  // 知识统计
  {
    method: 'GET',
    url: /^\/api\/knowledge\/stats$/,
    handler: () => createResponse(mockKnowledgeStats)
  },

  // 文档上传
  {
    method: 'POST',
    url: /^\/api\/knowledge\/spaces\/([^/]+)\/documents$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/knowledge\/spaces\/([^/]+)\/documents$/)
      if (!match) return null
      const spaceId = match[1]
      // 模拟文档上传成功
      return createResponse({
        id: 'doc-' + Date.now(),
        spaceId,
        docName: 'uploaded-document-' + Date.now() + '.pdf',
        docType: 'pdf',
        fileSize: Math.floor(Math.random() * 5000000) + 1000,
        segmentCount: Math.floor(Math.random() * 10) + 1,
        processStatus: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  },
  
  // 文档删除
  {
    method: 'DELETE',
    url: /^\/api\/knowledge\/spaces\/([^/]+)\/documents\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/knowledge\/spaces\/([^/]+)\/documents\/([^/]+)$/)
      if (!match) return null
      return createResponse({ success: true })
    }
  },

  // 报告相关
  {
    method: 'GET',
    url: /^\/api\/v1\/reports$/,
    handler: () => createPaginatedResponse(mockReports)
  },
  {
    method: 'GET',
    url: /^\/api\/v1\/reports\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/v1\/reports\/([^/]+)$/)
      if (!match) return null
      const report = mockReports.find(r => r.id === match[1])
      if (!report) return createResponse(null, 404)
      return createResponse(report)
    }
  },
  {
    method: 'POST',
    url: /^\/api\/v1\/reports$/,
    handler: () => createResponse({
      id: 'report-' + Date.now(),
      title: '新建报告',
      content: '',
      status: 'draft',
      version: 1,
      authorId: mockUserProfile.id,
      authorName: mockUserProfile.nickname,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },
  {
    method: 'PUT',
    url: /^\/api\/v1\/reports\/([^/]+)$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/v1\/reports\/([^/]+)$/)
      if (!match) return null
      const report = mockReports.find(r => r.id === match[1])
      if (!report) return createResponse(null, 404)
      return createResponse({ ...report, updatedAt: new Date().toISOString() })
    }
  },
  {
    method: 'DELETE',
    url: /^\/api\/v1\/reports\/([^/]+)$/,
    handler: () => createResponse({ success: true })
  },
  {
    method: 'POST',
    url: /^\/api\/v1\/reports\/([^/]+)\/publish$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/v1\/reports\/([^/]+)\/publish$/)
      if (!match) return null
      const report = mockReports.find(r => r.id === match[1])
      if (!report) return createResponse(null, 404)
      return createResponse({ ...report, status: 'published', publishedAt: new Date().toISOString() })
    }
  },
  {
    method: 'POST',
    url: /^\/api\/v1\/reports\/search$/,
    handler: () => createResponse(mockReportSearchResults)
  },
  {
    method: 'GET',
    url: /^\/api\/v1\/reports\/([^/]+)\/versions$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/v1\/reports\/([^/]+)\/versions$/)
      if (!match) return null
      const versions = mockReportVersions[match[1]] || []
      return createResponse(versions)
    }
  },
  {
    method: 'POST',
    url: /^\/api\/v1\/reports\/([^/]+)\/versions\/compare$/,
    handler: (config: InternalAxiosRequestConfig) => {
      // 从URL中提取报告ID
      const reportMatch = config.url?.match(/\/api\/v1\/reports\/([^/]+)\/versions\/compare$/);
      if (!reportMatch) return null;
      
      // 获取请求参数
      let requestData: any = {};
      if (typeof config.data === 'string') {
        try {
          requestData = JSON.parse(config.data);
        } catch (e) {
          console.error('Failed to parse request data:', e);
        }
      } else {
        requestData = config.data || {};
      }
      
      const { version1, version2 } = requestData;
      if (version1 === undefined || version2 === undefined) {
        return createResponse({ diff: '错误：缺少版本号参数' }, 400);
      }

      const reportId = reportMatch[1];
      const versions = mockReportVersions[reportMatch[1]] || [];
      
      // 根据版本号找到对应的内容
      const ver1Content = versions.find(v => v.version === version1)?.content || '';
      const ver2Content = versions.find(v => v.version === version2)?.content || '';
      
      // 构建差异信息
      const differences = [];
      
      if (ver1Content.length !== ver2Content.length) {
        differences.push(`- 内容长度：版本${version1}(${ver1Content.length}字符) vs 版本${version2}(${ver2Content.length}字符)`);
      }
      
      // 计算简单的差异
      const lines1 = ver1Content.split('\n');
      const lines2 = ver2Content.split('\n');
      
      const commonStart = Math.min(lines1.length, lines2.length);
      let firstDiffLine = -1;
      for (let i = 0; i < commonStart; i++) {
        if (lines1[i] !== lines2[i]) {
          firstDiffLine = i + 1;
          break;
        }
      }
      
      if (firstDiffLine !== -1) {
        differences.push(`- 首次差异出现在第 ${firstDiffLine} 行`);
        differences.push(`版本${version1}的第${firstDiffLine}行: "${lines1[firstDiffLine - 1]?.substring(0, 50) || '(空)'}` + (lines1[firstDiffLine - 1]?.length > 50 ? '...' : '') + '"');
        differences.push(`版本${version2}的第${firstDiffLine}行: "${lines2[firstDiffLine - 1]?.substring(0, 50) || '(空)'}` + (lines2[firstDiffLine - 1]?.length > 50 ? '...' : '') + '"');
      } else if (lines1.length !== lines2.length) {
        differences.push(`- 内容行数不同：版本${version1}(${lines1.length}行) vs 版本${version2}(${lines2.length}行)`);
      } else {
        differences.push('- 两个版本内容完全相同');
      }
      
      const changeSummary = versions.find(v => v.version === version1)?.changeSummary;
      const changeSummary2 = versions.find(v => v.version === version2)?.changeSummary;
      
      if (changeSummary || changeSummary2) {
        differences.push('');
        differences.push('变更说明:');
        if (changeSummary) differences.push(`  版本${version1}: ${changeSummary}`);
        if (changeSummary2) differences.push(`  版本${version2}: ${changeSummary2}`);
      }
      
      differences.unshift(`版本 ${version1} 与版本 ${version2} 的对比如下：\n`);

      return createResponse({ diff: differences.join('\n') });
    }
  },
  {
    method: 'POST',
    url: /^\/api\/v1\/reports\/([^/]+)\/versions\/rollback$/,
    handler: (config) => {
      const match = config.url?.match(/\/api\/v1\/reports\/([^/]+)\/versions\/rollback$/)
      if (!match) return null
      const report = mockReports.find(r => r.id === match[1])
      if (!report) return createResponse(null, 404)
      return createResponse(report)
    }
  }
]

function matchRoute(config: InternalAxiosRequestConfig): MockHandler | null {
  for (const route of mockRoutes) {
    if (config.method?.toUpperCase() !== route.method) continue
    const url = config.url || ''
    if (route.url instanceof RegExp) {
      if (route.url.test(url)) {
        return route.handler
      }
    } else if (url === route.url) {
      return route.handler
    }
  }
  return null
}

export function setupMock(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    async (config) => {
      if (import.meta.env.VITE_MOCK !== 'true') {
        return config
      }

      const handler = matchRoute(config)
      if (handler) {
        await delay(200 + Math.random() * 300)
        const response = handler(config)
        if (response) {
          return Promise.reject({
            ...response,
            __MOCK__: true
          })
        }
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.__MOCK__) {
        return Promise.resolve(error)
      }
      return Promise.reject(error)
    }
  )
}

export {
  mockKnowledgeSpaces,
  mockDocuments,
  mockAssistants,
  mockChatSessions,
  mockChatMessages,
  mockAssistantSessions,
  mockAssistantMessages,
  mockSearchResults,
  mockRecentDocuments,
  mockUserTodos,
  mockKnowledgeStats,
  mockUserProfile,
  mockTags,
  mockFavorites
}