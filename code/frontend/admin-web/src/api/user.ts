import { get, post, put, del } from './request'

export interface User {
  id: string
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  roles: string[]
  createdAt: string
}

export interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export const userApi = {
  getList: (params: UserListParams) => get<PageResult<User>>('/users', { params }),
  getById: (id: string) => get<User>(`/users/${id}`),
  create: (data: Partial<User>) => post<User>('/users', data),
  update: (id: string, data: Partial<User>) => put<User>(`/users/${id}`, data),
  delete: (id: string) => del<void>(`/users/${id}`),
  resetPassword: (id: string) => post<void>(`/users/${id}/reset-password`)
}