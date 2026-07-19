import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

export type RequestConfig = AxiosRequestConfig & { silent?: boolean }
import { ElMessage } from 'element-plus'
import type { ChatParams, AssistantChatParams } from '@/types'
import { useUserStore } from '@/stores/user'

type SSEHandler = {
  onMessage: (data: string) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    const tenantId = userStore.userInfo?.tenantId
    if (tenantId) {
      config.headers['X-Tenant-Id'] = String(tenantId)
    }
    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data ?? {}
    const { code, message, data } = body
    if (code === 200 || code === 0) {
      return data !== undefined ? data : body
    }
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    const { response } = error
    if (response?.status === 401 && !response.config?.url?.includes('/auth/login')) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    const msg = response?.data?.message || error.message || '网络请求失败'
    const silent = (response?.config as RequestConfig)?.silent
    if (!silent && !response?.config?.url?.includes('/auth/login')) {
      ElMessage.error(msg)
    }
    return Promise.reject(new Error(msg))
  },
)

export function get<T = unknown>(url: string, params?: object, config?: RequestConfig): Promise<T> {
  return service.get(url, { params, ...config })
}

export function post<T = unknown>(url: string, data?: object, config?: RequestConfig): Promise<T> {
  return service.post(url, data, config)
}

export function put<T = unknown>(url: string, data?: object, config?: RequestConfig): Promise<T> {
  return service.put(url, data, config)
}

export function del<T = unknown>(url: string, params?: object, config?: RequestConfig): Promise<T> {
  return service.delete(url, { params, ...config })
}

export function patch<T = unknown>(url: string, data?: object, config?: RequestConfig): Promise<T> {
  return service.patch(url, data, config)
}

/** 将聊天参数映射为后端 query 参数 */
function buildChatQueryParams(url: string, params: ChatParams | AssistantChatParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  const content =
    ('message' in params && params.message) ||
    ('query' in params && params.query) ||
    ''

  const sessionInPath = /\/assistant-sessions\/[^/]+\/messages$/.test(url)

  if ('assistantId' in params) {
    searchParams.set('assistantId', params.assistantId)
    if (!sessionInPath) {
      const sessionId = params.sessionId || params.conversationId
      if (sessionId) {
        searchParams.set('sessionId', sessionId)
      }
    }
    searchParams.set('content', content)
  } else {
    const chatParams = params as ChatParams & { appId?: string }
    if (chatParams.appId) {
      searchParams.set('appId', chatParams.appId)
    }
    if (chatParams.sessionId) {
      searchParams.set('sessionId', chatParams.sessionId)
    }
    searchParams.set('content', content)
  }

  const stream = params.stream !== false
  searchParams.set('stream', stream ? 'true' : 'false')
  return searchParams
}

/** 解析 SSE 或纯 JSON 响应片段 */
function extractSSEPayloads(chunk: string): string[] {
  const payloads: string[] = []
  const parts = chunk.split('\n\n')

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    let matched = false
    for (const line of trimmed.split('\n')) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim()
        if (data && data !== '[DONE]') {
          payloads.push(data)
        }
        matched = true
      }
    }
    if (!matched) {
      payloads.push(trimmed)
    }
  }

  return payloads
}

export function createSSEConnection(
  url: string,
  params: ChatParams | AssistantChatParams,
  handlers: SSEHandler,
): { abort: () => void } {
  const controller = new AbortController()
  const userStore = useUserStore()
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  const query = buildChatQueryParams(url, params)
  const fullUrl = `${baseURL}${url}?${query.toString()}`

  const headers: Record<string, string> = {}
  if (userStore.token) {
    headers.Authorization = `Bearer ${userStore.token}`
  }
  const tenantId = userStore.userInfo?.tenantId
  if (tenantId) {
    headers['X-Tenant-Id'] = String(tenantId)
  }

  ;(async () => {
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        signal: controller.signal,
      })

      if (!response.ok) {
        let message = `HTTP ${response.status}`
        try {
          const errBody = await response.json()
          message = errBody.message || message
        } catch {
          const errText = await response.text()
          if (errText) message = errText
        }
        throw new Error(message)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const segments = buffer.split('\n\n')
        buffer = segments.pop() || ''

        for (const segment of segments) {
          for (const payload of extractSSEPayloads(segment)) {
            handlers.onMessage(payload)
          }
        }
      }

      if (buffer.trim()) {
        for (const payload of extractSSEPayloads(buffer)) {
          handlers.onMessage(payload)
        }
      }

      handlers.onComplete?.()
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        handlers.onError?.(error as Error)
      }
    }
  })()

  return {
    abort: () => controller.abort(),
  }
}

export default service
