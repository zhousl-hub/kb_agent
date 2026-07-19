import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { authApi } from '@/api/auth'

const TOKEN_KEY = 'portal-user-token'
const REFRESH_TOKEN_KEY = 'portal-user-refreshToken'
const USER_INFO_KEY = 'portal-user-info'
const TOKEN_EXPIRE_KEY = 'portal-user-token-expire'

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function getStoredUserInfo(): UserInfo | null {
  const stored = localStorage.getItem(USER_INFO_KEY)
  return stored ? JSON.parse(stored) : null
}

function isTokenExpired(): boolean {
  const expireStr = localStorage.getItem(TOKEN_EXPIRE_KEY)
  if (!expireStr) return false
  return Date.now() > parseInt(expireStr, 10)
}


export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const refreshToken = ref<string>(getRefreshToken() || '')
  const userInfo = ref<UserInfo | null>(getStoredUserInfo())
  const loading = ref(false)
  const loginError = ref<string>('')

  const isLoggedIn = computed(() => !!token.value && !isTokenExpired())
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.name || '')
  const roles = computed(() => userInfo.value?.roles || [])
  const tenantId = computed(() => userInfo.value?.tenantId || '')
  const avatar = computed(() => userInfo.value?.avatar || '')

  function setToken(val: string, expiresIn?: number) {
    token.value = val
    localStorage.setItem(TOKEN_KEY, val)
    if (expiresIn) {
      localStorage.setItem(TOKEN_EXPIRE_KEY, String(Date.now() + expiresIn * 1000))
    }
  }

  function setRefreshTokenValue(val: string) {
    refreshToken.value = val
    localStorage.setItem(REFRESH_TOKEN_KEY, val)
  }

  function setUserInfo(val: UserInfo) {
    userInfo.value = val
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(val))
  }

  async function login(
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ success: boolean; redirectUrl?: string }> {
    loginError.value = ''
    loading.value = true

    try {
      const result = await authApi.login({ email, password, rememberMe })
      
      if (!result.success) {
        loginError.value = result.message || '登录失败'
        return { success: false }
      }

      setToken(result.token, 86400)
      if (result.refreshToken) {
        setRefreshTokenValue(result.refreshToken)
      }
      
      const rawUser = result.user as Record<string, any>
      const rawTenant = result.tenant as Record<string, any> | undefined
      const userInfo: UserInfo = {
        id: rawUser.id || rawUser.user_id || '',
        username: rawUser.username || rawUser.user_name || '',
        email: rawUser.email || '',
        avatar: rawUser.avatar || '',
        tenantId: rawUser.tenantId || rawUser.tenant_id || rawTenant?.id || 0,
        tenantName: rawTenant?.name || '',
        createdAt: rawUser.createdAt || rawUser.created_at || '',
        roles: ['user'],
      }
      setUserInfo(userInfo)

      const redirectUrl = determineRedirectUrl(userInfo.roles || [])

      return { success: true, redirectUrl }
    } catch (error) {
      const err = error as Error
      loginError.value = err.message || '登录失败，请检查邮箱和密码'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  function determineRedirectUrl(_roles: string[]): string {
    return import.meta.env.VITE_USER_PORTAL_URL || 'http://localhost:5174'
  }

  async function initUserState(): Promise<void> {
    if (!token.value || userInfo.value) {
      return
    }
    try {
      const user = await authApi.getCurrentUser()
      if (user) {
        setUserInfo(user)
      }
    } catch {
      await logout(false)
    }
  }

  async function logout(redirect = false): Promise<void> {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    token.value = ''
    refreshToken.value = ''
    userInfo.value = null

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
    localStorage.removeItem(TOKEN_EXPIRE_KEY)

    if (redirect) {
      window.location.href = '/'
    }
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(checkRoles: string[]): boolean {
    return checkRoles.some((role) => roles.value.includes(role))
  }

  return {
    token,
    refreshToken,
    userInfo,
    loading,
    loginError,
    isLoggedIn,
    username,
    nickname,
    roles,
    tenantId,
    avatar,
    setToken,
    setRefreshTokenValue,
    setUserInfo,
    login,
    logout,
    initUserState,
    hasRole,
    hasAnyRole,
  }
})