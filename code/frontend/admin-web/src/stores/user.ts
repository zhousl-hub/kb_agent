import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, MenuInfo } from '@/types/user'
import { authApi, menuApi } from '@/api'
import {
  getToken,
  setToken as saveToken,
  getRefreshToken,
  setRefreshToken as saveRefreshToken,
  setTokenExpire,
  getStoredUserInfo,
  setStoredUserInfo,
  clearAllOnLogout,
  isTokenExpired,
  isTokenExpiringSoon,
} from '@/utils/auth'
import router from '@/router'

let refreshTimer: ReturnType<typeof setTimeout> | null = null

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const refreshToken = ref<string>(getRefreshToken() || '')
  const userInfo = ref<UserInfo | null>(getStoredUserInfo())
  const menus = ref<MenuInfo[]>([])
  const permissions = ref<string[]>([])
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !isTokenExpired())
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const roles = computed(() => userInfo.value?.roles || [])
  const tenantId = computed(() => userInfo.value?.tenantId || '')
  const avatar = computed(() => userInfo.value?.avatar || '')

  function setToken(val: string, expiresIn?: number) {
    token.value = val
    saveToken(val)
    if (expiresIn) {
      setTokenExpire(expiresIn)
    }
  }

  function setRefreshTokenValue(val: string) {
    refreshToken.value = val
    saveRefreshToken(val)
  }

  function setUserInfo(val: UserInfo) {
    userInfo.value = val
    setStoredUserInfo(val)
  }

  function setMenus(val: MenuInfo[]) {
    menus.value = val
  }

  function setPermissions(val: string[]) {
    permissions.value = val
  }

  async function fetchUserInfo(): Promise<UserInfo | null> {
    try {
      const info = await authApi.getCurrentUser()
      setUserInfo(info)
      return info
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      return null
    }
  }

  async function fetchMenusAndPermissions(): Promise<void> {
    try {
      const [menusData, permsData] = await Promise.all([
        menuApi.getMenus(),
        menuApi.getPermissions(),
      ])
      setMenus(menusData as MenuInfo[])
      setPermissions(permsData)
    } catch (error) {
      console.error('Failed to fetch menus and permissions:', error)
    }
  }

  async function initUserState(): Promise<boolean> {
    if (!token.value) {
      return false
    }

    if (isTokenExpired()) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        logout()
        return false
      }
    }

    loading.value = true
    try {
      await Promise.all([fetchUserInfo(), fetchMenusAndPermissions()])
      scheduleTokenRefresh()
      return true
    } catch (error) {
      console.error('Failed to init user state:', error)
      logout()
      return false
    } finally {
      loading.value = false
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    const currentRefreshToken = refreshToken.value || getRefreshToken()
    if (!currentRefreshToken) {
      return false
    }

    try {
      const result = await authApi.refreshToken(currentRefreshToken)
      setToken(result.token, result.expiresIn || 3600)
      if (result.refreshToken) {
        setRefreshTokenValue(result.refreshToken)
      }
      scheduleTokenRefresh()
      return true
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return false
    }
  }

  function scheduleTokenRefresh(): void {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    if (!token.value) return

    const checkInterval = 60000
    refreshTimer = setInterval(async () => {
      if (isTokenExpiringSoon(5)) {
        const success = await refreshAccessToken()
        if (!success) {
          logout()
        }
      }
    }, checkInterval)
  }

  async function logout(redirect = true): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }

    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    menus.value = []
    permissions.value = []

    clearAllOnLogout()

    if (redirect) {
      router.push('/login')
    }
  }

  function hasPermission(permission: string): boolean {
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(checkRoles: string[]): boolean {
    return checkRoles.some(role => roles.value.includes(role))
  }

  return {
    token,
    refreshToken,
    userInfo,
    menus,
    permissions,
    loading,
    isLoggedIn,
    username,
    nickname,
    roles,
    tenantId,
    avatar,
    setToken,
    setRefreshTokenValue,
    setUserInfo,
    setMenus,
    setPermissions,
    fetchUserInfo,
    fetchMenusAndPermissions,
    initUserState,
    refreshAccessToken,
    scheduleTokenRefresh,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
  }
}, {
  persist: {
    key: 'kba-user',
    pick: ['token', 'refreshToken', 'userInfo'],
  },
})