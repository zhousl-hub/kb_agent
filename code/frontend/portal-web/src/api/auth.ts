import { post, get, type ApiResponse } from './request'
import type { UserInfo, LoginForm, LoginResult, RegisterForm } from '@/types'

export const authApi = {
  login: async (data: LoginForm): Promise<LoginResult> => {
    const response = await post<ApiResponse<LoginResult>>('/api/v1/auth/login', {
      email: data.email,
      password: data.password,
    })
    return response as unknown as LoginResult
  },

  register: async (data: RegisterForm): Promise<{ success: boolean; message: string; user: UserInfo }> => {
    const response = await post<ApiResponse<{ success: boolean; message: string; user: UserInfo }>>(
      '/api/v1/auth/register',
      {
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.name || data.username,
      }
    )
    return response as unknown as { success: boolean; message: string; user: UserInfo }
  },

  logout: () => post<void>('/api/v1/auth/logout'),

  refreshToken: (refreshToken: string) =>
    post<{ token: string; refresh_token: string }>('/api/v1/auth/refresh', { refresh_token: refreshToken }),

  getCurrentUser: () => get<UserInfo>('/api/v1/auth/me'),
}

export const userApi = {
  getProfile: () => get<UserInfo>('/api/v1/user/profile'),
  updateProfile: (data: Partial<UserInfo>) => post<UserInfo>('/api/v1/user/profile', data),
}