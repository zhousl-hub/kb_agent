const REMEMBER_ME_KEY = 'portal-remember-me'
const CREDENTIALS_KEY = 'portal-credentials'

export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
}

export function setRememberMe(value: boolean): void {
  localStorage.setItem(REMEMBER_ME_KEY, String(value))
}

export function saveCredentials(username: string, password: string): void {
  const encoded = btoa(`${username}:${password}`)
  localStorage.setItem(CREDENTIALS_KEY, encoded)
}

export function getDecryptedCredentials(): { username: string; password: string } | null {
  const encoded = localStorage.getItem(CREDENTIALS_KEY)
  if (!encoded) return null
  try {
    const decoded = atob(encoded)
    const [username, password] = decoded.split(':')
    return { username, password }
  } catch {
    return null
  }
}

export function removeSavedCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY)
  localStorage.removeItem(REMEMBER_ME_KEY)
}