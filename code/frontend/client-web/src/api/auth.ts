import { post, get } from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginUserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  realName?: string
  tenantId?: string
  avatar?: string
}

export interface LoginResult {
  token: string
  tokenType?: string
  expiresIn?: number
  user: LoginUserInfo
}

export interface UserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  realName?: string
  tenantId?: string
}

export const authApi = {
  login: (params: LoginParams) => post<LoginResult>('/v1/auth/login', params),
  logout: () => post<void>('/v1/auth/logout'),
  refresh: () => post<LoginResult>('/v1/auth/refresh'),
  getCurrentUser: () => get<UserInfo>('/v1/auth/user-info'),
}

/** 将邮箱或用户名解析为后端登录用的 username */
export function resolveLoginUsername(input: string): string {
  const trimmed = input.trim()
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0]
  }
  return trimmed
}
