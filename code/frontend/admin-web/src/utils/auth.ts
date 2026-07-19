import type { UserInfo } from '@/types/user'

const TOKEN_KEY = 'kba_token'
const REFRESH_TOKEN_KEY = 'kba_refresh_token'
const TOKEN_EXPIRE_KEY = 'kba_token_expire'
const USER_INFO_KEY = 'kba_user_info'
const REMEMBER_ME_KEY = 'kba_remember_me'
const SAVED_USERNAME_KEY = 'kba_saved_username'
const SAVED_PASSWORD_KEY = 'kba_saved_password'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (!isBrowser()) return
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  if (!isBrowser()) return
  localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken(): void {
  if (!isBrowser()) return
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getTokenExpire(): number | null {
  if (!isBrowser()) return null
  const expire = localStorage.getItem(TOKEN_EXPIRE_KEY)
  return expire ? parseInt(expire, 10) : null
}

export function setTokenExpire(expiresIn: number): void {
  if (!isBrowser()) return
  const expireTime = Date.now() + expiresIn * 1000
  localStorage.setItem(TOKEN_EXPIRE_KEY, expireTime.toString())
}

export function removeTokenExpire(): void {
  if (!isBrowser()) return
  localStorage.removeItem(TOKEN_EXPIRE_KEY)
}

export function isTokenExpired(): boolean {
  const expire = getTokenExpire()
  if (!expire) return true
  return Date.now() >= expire - 60000
}

export function isTokenExpiringSoon(thresholdMinutes = 5): boolean {
  const expire = getTokenExpire()
  if (!expire) return true
  return Date.now() >= expire - thresholdMinutes * 60 * 1000
}

export function getStoredUserInfo(): UserInfo | null {
  if (!isBrowser()) return null
  const info = localStorage.getItem(USER_INFO_KEY)
  return info ? JSON.parse(info) : null
}

export function setStoredUserInfo(userInfo: UserInfo): void {
  if (!isBrowser()) return
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export function removeStoredUserInfo(): void {
  if (!isBrowser()) return
  localStorage.removeItem(USER_INFO_KEY)
}

export function getRememberMe(): boolean {
  if (!isBrowser()) return false
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
}

export function setRememberMe(remember: boolean): void {
  if (!isBrowser()) return
  localStorage.setItem(REMEMBER_ME_KEY, remember.toString())
}

export function getSavedCredentials(): { username: string; password: string } | null {
  if (!isBrowser()) return null
  const username = localStorage.getItem(SAVED_USERNAME_KEY)
  const password = localStorage.getItem(SAVED_PASSWORD_KEY)
  if (username && password) {
    return { username, password }
  }
  return null
}

export function saveCredentials(username: string, password: string): void {
  if (!isBrowser()) return
  localStorage.setItem(SAVED_USERNAME_KEY, username)
  localStorage.setItem(SAVED_PASSWORD_KEY, encryptPassword(password))
}

export function removeSavedCredentials(): void {
  if (!isBrowser()) return
  localStorage.removeItem(SAVED_USERNAME_KEY)
  localStorage.removeItem(SAVED_PASSWORD_KEY)
  localStorage.removeItem(REMEMBER_ME_KEY)
}

function encryptPassword(password: string): string {
  return btoa(password)
}

function decryptPassword(encrypted: string): string {
  try {
    return atob(encrypted)
  } catch {
    return ''
  }
}

export function getDecryptedCredentials(): { username: string; password: string } | null {
  const creds = getSavedCredentials()
  if (!creds) return null
  return {
    username: creds.username,
    password: decryptPassword(creds.password),
  }
}

export function clearAllAuth(): void {
  removeToken()
  removeRefreshToken()
  removeTokenExpire()
  removeStoredUserInfo()
}

export function clearAllOnLogout(): void {
  clearAllAuth()
  removeSavedCredentials()
}

export function hasPermission(userPermissions: string[], permission: string): boolean {
  if (!userPermissions || userPermissions.length === 0) return false
  if (userPermissions.includes('*')) return true
  return userPermissions.includes(permission)
}

export function hasRole(userRoles: string[], role: string): boolean {
  if (!userRoles || userRoles.length === 0) return false
  return userRoles.includes(role)
}

export function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  if (!userRoles || userRoles.length === 0) return false
  return roles.some(role => userRoles.includes(role))
}

export function hasAllRoles(userRoles: string[], roles: string[]): boolean {
  if (!userRoles || userRoles.length === 0) return false
  return roles.every(role => userRoles.includes(role))
}

export function isAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, 'admin') || hasRole(userRoles, 'super_admin')
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  return !isTokenExpired()
}