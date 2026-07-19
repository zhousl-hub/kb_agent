import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<ThemeMode>('light')
  const device = ref<'desktop' | 'mobile'>('desktop')
  const size = ref<'default' | 'small' | 'large'>('default')

  const sidebarWidth = computed(() => sidebarCollapsed.value ? 64 : 210)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTheme(val: ThemeMode) {
    theme.value = val
    document.documentElement.classList.toggle('dark', val === 'dark')
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function setDevice(val: 'desktop' | 'mobile') {
    device.value = val
    if (val === 'mobile') {
      sidebarCollapsed.value = true
    }
  }

  function setSize(val: 'default' | 'small' | 'large') {
    size.value = val
  }

  return {
    sidebarCollapsed,
    theme,
    device,
    size,
    sidebarWidth,
    toggleSidebar,
    setTheme,
    toggleTheme,
    setDevice,
    setSize,
  }
}, {
  persist: {
    key: 'kba-app',
    pick: ['sidebarCollapsed', 'theme', 'size'],
  },
})