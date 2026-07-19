import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('portal-user-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const userInfoStr = localStorage.getItem('portal-user-info')
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        if (userInfo.tenantId) {
          config.headers['X-Tenant-Id'] = userInfo.tenantId
        }
      } catch {
        // ignore
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const resData = response.data
    
    if (resData.success === true) {
      if (resData.token) {
        return {
          success: true,
          message: resData.message,
          user: resData.user,
          tenant: resData.tenant,
          token: resData.token,
          refreshToken: resData.refresh_token,
        }
      }
      return resData
    }
    
    if (resData.code === 0 || resData.code === 200) {
      return resData.data
    }
    
    if (resData.code === undefined && resData.token) {
      return {
        success: true,
        message: resData.message || 'success',
        user: resData.user,
        tenant: resData.tenant,
        token: resData.token,
        refreshToken: resData.refresh_token,
      }
    }
    
    const errorMsg = resData.message || resData.error?.message || '请求失败'
    return Promise.reject(new Error(errorMsg))
  },
  (error) => {
    const { response } = error
    if (response) {
      const message = response.data?.message || response.data?.error?.message || '请求失败'
      switch (response.status) {
        case 400:
          console.error('请求参数错误:', message)
          break
        case 401:
          localStorage.removeItem('portal-user-token')
          localStorage.removeItem('portal-user-info')
          localStorage.removeItem('portal-user-refreshToken')
          break
        case 403:
          console.error('没有权限访问')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(message)
      }
      return Promise.reject(new Error(message))
    } else {
      console.error('网络连接失败，请检查网络')
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  code?: number
}

export interface PageResult<T = unknown> {
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
  return service.get(url, { params, ...config })
}

export function post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config)
}

export function put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config)
}

export function del<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, { params, ...config })
}

export default service