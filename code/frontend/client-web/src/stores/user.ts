import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: string
  username: string
  nickname: string
  name?: string
  avatar: string
  email: string
  phone?: string
  tenantId?: number
}

export const useUserStore = defineStore('user', () => {
  const getStoredUserInfo = (): UserInfo | null => {
    const stored = localStorage.getItem('client-user-info')
    return stored ? JSON.parse(stored) : null
  }

  const token = ref<string>(localStorage.getItem('client-user-token') || '')
  const userInfo = ref<UserInfo | null>(getStoredUserInfo())
  const theme = ref<'light' | 'dark'>(localStorage.getItem('client-user-theme') as 'light' | 'dark' || 'light')

  const isLoggedIn = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('client-user-token', newToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    localStorage.setItem('client-user-info', JSON.stringify(info))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('client-user-token')
    localStorage.removeItem('client-user-info')
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('client-user-theme', theme.value)
  }

  function initFromStorage() {
    const storedToken = localStorage.getItem('client-user-token')
    const storedInfo = localStorage.getItem('client-user-info')
    if (storedToken) {
      token.value = storedToken
    }
    if (storedInfo) {
      try {
        userInfo.value = JSON.parse(storedInfo)
      } catch {
        userInfo.value = null
      }
    }
  }

  initFromStorage()

  return {
    token,
    userInfo,
    theme,
    isLoggedIn,
    setToken,
    setUserInfo,
    logout,
    toggleTheme,
  }
})