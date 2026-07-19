import { get, post, put, del, type PageResult, type PageParams } from './request'
import type { UserInfo, LoginForm, LoginResult, RoleInfo } from '@/types/user'

export const authApi = {
  login: (data: LoginForm) => post<LoginResult>('/auth/login', data),
  logout: () => post<void>('/auth/logout'),
  refreshToken: (refreshToken: string) => post<{ token: string; refreshToken: string; expiresIn?: number }>('/auth/refresh', { refreshToken }),
  getCurrentUser: () => get<UserInfo>('/auth/me'),
  updateProfile: (data: Partial<UserInfo>) => post<UserInfo>('/auth/profile', data),
  changePassword: (oldPassword: string, newPassword: string) => 
    post<void>('/auth/change-password', { oldPassword, newPassword }),
  sendSmsCode: (phone: string) => post<void>('/auth/sms/send', { phone }),
  loginBySms: (phone: string, smsCode: string) => post<LoginResult>('/auth/sms/login', { phone, smsCode }),
}

export const userApi = {
  getList: (params: PageParams) => get<PageResult<UserInfo>>('/users', params),
  getDetail: (id: string) => get<UserInfo>(`/users/${id}`),
  create: (data: Partial<UserInfo> & { password: string }) => post<UserInfo>('/users', data),
  update: (id: string, data: Partial<UserInfo>) => put<UserInfo>(`/users/${id}`, data),
  delete: (id: string) => del<void>(`/users/${id}`),
  resetPassword: (id: string) => post<{ password: string }>(`/users/${id}/reset-password`),
  assignRoles: (id: string, roleIds: string[]) => post<void>(`/users/${id}/roles`, { roleIds }),
}

export const roleApi = {
  getList: (params: PageParams) => get<PageResult<RoleInfo>>('/roles', params),
  getDetail: (id: string) => get<RoleInfo>(`/roles/${id}`),
  create: (data: Partial<RoleInfo>) => post<RoleInfo>('/roles', data),
  update: (id: string, data: Partial<RoleInfo>) => put<RoleInfo>(`/roles/${id}`, data),
  delete: (id: string) => del<void>(`/roles/${id}`),
  assignPermissions: (id: string, permissions: string[]) => 
    post<void>(`/roles/${id}/permissions`, { permissions }),
}

export const menuApi = {
  getMenus: () => get<{ id: string; name: string; children?: any[] }[]>('/permissions/menus'),
  getPermissions: () => get<string[]>('/permissions/list'),
}