export interface UserInfo {
  id: string
  username: string
  nickname?: string
  name?: string
  email: string
  phone?: string
  avatar?: string
  tenantId: number
  tenantName?: string
  isActive?: boolean
  roles?: string[]
  createdAt: string
  updatedAt?: string
}

export interface Tenant {
  id: number
  name: string
  description?: string
  apiKey?: string
  status: string
  storageQuota?: number
  storageUsed?: number
}

export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  username: string
  name?: string
}

export interface LoginResult {
  success: boolean
  message: string
  user: UserInfo
  tenant?: Tenant
  token: string
  refreshToken: string
}

export interface PortalConfig {
  userPortalUrl: string
  adminPortalUrl: string
}

export type PortalType = 'user' | 'admin'