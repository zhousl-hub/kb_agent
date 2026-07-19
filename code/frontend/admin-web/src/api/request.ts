import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'
import { mockRequest, isMockEnabled } from '@/mock'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config) => {
    NProgress.start()
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    const tenantId = userStore.userInfo?.tenantId
    if (tenantId) {
      config.headers['X-Tenant-Id'] = tenantId
    }
    return config
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()
    const { code, message, data } = response.data
    if (code === 200 || code === 0) {
      return data
    }
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    NProgress.done()
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401:
          ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            const userStore = useUserStore()
            userStore.logout()
            location.href = '/login'
          })
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

export interface PageParams {
  pageNum: number
  pageSize: number
  keyword?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export function get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  if (isMockEnabled()) {
    const userStore = useUserStore()
    return mockRequest('GET', url, params, {
      Authorization: userStore.token ? `Bearer ${userStore.token}` : '',
      'X-Tenant-Id': userStore.userInfo?.tenantId || '',
    })
  }
  return service.get(url, { params, ...config })
}

export function post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  if (isMockEnabled()) {
    const userStore = useUserStore()
    return mockRequest('POST', url, data, {
      Authorization: userStore.token ? `Bearer ${userStore.token}` : '',
      'X-Tenant-Id': userStore.userInfo?.tenantId || '',
    })
  }
  return service.post(url, data, config)
}

export function put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  if (isMockEnabled()) {
    const userStore = useUserStore()
    return mockRequest('PUT', url, data, {
      Authorization: userStore.token ? `Bearer ${userStore.token}` : '',
      'X-Tenant-Id': userStore.userInfo?.tenantId || '',
    })
  }
  return service.put(url, data, config)
}

export function del<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  if (isMockEnabled()) {
    const userStore = useUserStore()
    return mockRequest('DELETE', url, params, {
      Authorization: userStore.token ? `Bearer ${userStore.token}` : '',
      'X-Tenant-Id': userStore.userInfo?.tenantId || '',
    })
  }
  return service.delete(url, { params, ...config })
}

export default service