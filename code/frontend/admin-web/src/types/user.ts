export interface UserInfo {
  id: string
  username: string
  nickname: string
  email: string
  phone?: string
  avatar?: string
  departmentId?: string
  departmentName?: string
  roles: string[]
  tenantId: string
  tenantName?: string
  status?: number
  createdAt: string
  lastLoginAt?: string
}

export interface MenuInfo {
  id: string
  parentId: string | null
  name: string
  path: string
  icon?: string
  sort: number
  visible: boolean
  children?: MenuInfo[]
}

export interface LoginForm {
  username?: string
  password?: string
  phone?: string
  smsCode?: string
  rememberMe?: boolean
  captcha?: string
  captchaKey?: string
}

export interface LoginResult {
  token: string
  refreshToken: string
  expiresIn: number
  userInfo: UserInfo
}

export interface RoleInfo {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}