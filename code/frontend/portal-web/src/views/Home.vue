<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getDecryptedCredentials, setRememberMe, saveCredentials, removeSavedCredentials, getRememberMe } from '@/utils/auth'

const userStore = useUserStore()

const showLoginModal = ref(false)
const showForgotModal = ref(false)
const loginType = ref<'password' | 'sms'>('password')
const countdown = ref(0)

const loginForm = reactive({
  email: '',
  password: '',
  phone: '',
  smsCode: '',
  rememberMe: false,
})

const forgotForm = reactive({
  email: '',
})

const formErrors = reactive({
  email: '',
  password: '',
  phone: '',
  smsCode: '',
})

const isSubmitting = ref(false)

const submitButtonText = computed(() => {
  if (isSubmitting.value) return '登录中...'
  if (userStore.loading) return '处理中...'
  return '登录'
})

const canSendSms = computed(() => {
  return loginForm.phone.length === 11 && countdown.value === 0
})

const smsButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s` : '获取验证码'
})

onMounted(() => {
  if (getRememberMe()) {
    loginForm.rememberMe = true
    const creds = getDecryptedCredentials()
    if (creds) {
      loginForm.email = creds.username
      loginForm.password = creds.password
    }
  }
})

function validateLoginForm(): boolean {
  let isValid = true
  Object.keys(formErrors).forEach((key) => {
    formErrors[key as keyof typeof formErrors] = ''
  })

  if (loginType.value === 'password') {
    if (!loginForm.email.trim()) {
      formErrors.email = '请输入邮箱'
      isValid = false
    } else if (!isValidEmail(loginForm.email)) {
      formErrors.email = '请输入有效的邮箱地址'
      isValid = false
    }

    if (!loginForm.password) {
      formErrors.password = '请输入密码'
      isValid = false
    } else if (loginForm.password.length < 6) {
      formErrors.password = '密码长度至少6位'
      isValid = false
    }
  } else {
    if (!loginForm.phone.trim()) {
      formErrors.phone = '请输入手机号'
      isValid = false
    } else if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
      formErrors.phone = '请输入有效的手机号'
      isValid = false
    }

    if (!loginForm.smsCode.trim()) {
      formErrors.smsCode = '请输入验证码'
      isValid = false
    } else if (loginForm.smsCode.length !== 6) {
      formErrors.smsCode = '验证码为6位数字'
      isValid = false
    }
  }

  return isValid
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleLogin() {
  if (!validateLoginForm()) return

  isSubmitting.value = true

  if (loginForm.rememberMe) {
    setRememberMe(true)
    saveCredentials(loginForm.email, loginForm.password)
  } else {
    removeSavedCredentials()
  }

  const result = await userStore.login(
    loginType.value === 'password' ? loginForm.email : loginForm.phone,
    loginType.value === 'password' ? loginForm.password : loginForm.smsCode,
    loginForm.rememberMe
  )

  isSubmitting.value = false

  if (result.success && result.redirectUrl) {
    showLoginModal.value = false
    window.location.href = result.redirectUrl
  }
}

async function sendSmsCode() {
  if (!canSendSms.value) return

  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    formErrors.phone = '请输入有效的手机号'
    return
  }

  try {
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    // TODO: 调用发送验证码API
    console.log('Sending SMS to:', loginForm.phone)
  } catch (error) {
    console.error('Failed to send SMS:', error)
    countdown.value = 0
  }
}

function handleForgotPassword() {
  if (!forgotForm.email.trim()) {
    formErrors.email = '请输入邮箱地址'
    return
  }
  if (!isValidEmail(forgotForm.email)) {
    formErrors.email = '请输入有效的邮箱地址'
    return
  }

  // TODO: 调用忘记密码API
  console.log('Forgot password for:', forgotForm.email)
  showForgotModal.value = false
  forgotForm.email = ''
}

function goToUserPortal() {
  window.location.href = import.meta.env.VITE_USER_PORTAL_URL || 'http://localhost:5174'
}

function goToAdminPortal() {
  window.location.href = import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5173'
}

function switchLoginType(type: 'password' | 'sms') {
  loginType.value = type
  Object.keys(formErrors).forEach((key) => {
    formErrors[key as keyof typeof formErrors] = ''
  })
}

function openLoginModal() {
  showLoginModal.value = true
  userStore.loginError = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
    <header class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <span class="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">企业级知识管理平台</span>
          </div>
          <button
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5"
            @click="openLoginModal"
          >
            <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            登录
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl w-full space-y-8">
        <div class="text-center">
          <h1 class="text-5xl font-extrabold text-gray-900 sm:text-6xl tracking-tight">
            <span class="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">企业级知识管理平台</span>
          </h1>
          <p class="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            智能、高效、安全的企业知识管理解决方案，助力企业数字化转型
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mt-12">
          <div
            class="group bg-white rounded-3xl shadow-xl p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-cyan-400 relative overflow-hidden"
            @click="goToUserPortal"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div class="relative">
              <div class="text-center">
                <div class="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <svg class="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 class="mt-6 text-3xl font-bold text-gray-900">用户端</h2>
                <p class="mt-2 text-gray-500">面向企业员工的知识访问和使用平台</p>
                <ul class="mt-6 space-y-3 text-left">
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>智能知识检索与问答</span>
                  </li>
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>个性化知识推荐</span>
                  </li>
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>AI助手应用</span>
                  </li>
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>协作与知识共享</span>
                  </li>
                </ul>
                <button class="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5">
                  进入用户端
                </button>
              </div>
            </div>
          </div>

          <div
            class="group bg-white rounded-3xl shadow-xl p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-emerald-400 relative overflow-hidden"
            @click="goToAdminPortal"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div class="relative">
              <div class="text-center">
                <div class="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 class="mt-6 text-3xl font-bold text-gray-900">管理端</h2>
                <p class="mt-2 text-gray-500">面向管理员的平台配置和管理中心</p>
                <ul class="mt-6 space-y-3 text-left">
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>知识源配置与管理</span>
                  </li>
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>模型与应用管理</span>
                  </li>
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>用户与权限管理</span>
                  </li>
                  <li class="flex items-center text-gray-600">
                    <svg class="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>监控与数据分析</span>
                  </li>
                </ul>
                <button class="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
                  进入管理端
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-gray-100">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex justify-center md:justify-start space-x-6">
            <a href="#" class="text-gray-400 hover:text-gray-500 transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-500 transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </a>
          </div>
          <p class="mt-4 md:mt-0 text-center md:text-right text-sm text-gray-400">
            &copy; 2026 企业级知识管理平台. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showLoginModal"
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="showLoginModal = false"
        >
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showLoginModal" class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-8 text-center">
                <div class="mx-auto h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white">欢迎回来</h3>
                <p class="text-cyan-100 mt-1">登录您的账户继续操作</p>
              </div>

              <div class="p-6">
                <div class="flex rounded-xl bg-gray-100 p-1 mb-6">
                  <button
                    class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    :class="loginType === 'password' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'"
                    @click="switchLoginType('password')"
                  >
                    密码登录
                  </button>
                  <button
                    class="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    :class="loginType === 'sms' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'"
                    @click="switchLoginType('sms')"
                  >
                    验证码登录
                  </button>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-4">
                  <template v-if="loginType === 'password'">
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                      <div class="relative">
                        <input
                          id="email"
                          v-model="loginForm.email"
                          type="email"
                          :class="[
                            'block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm transition-all',
                            formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          ]"
                          placeholder="请输入邮箱"
                        />
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">{{ formErrors.email }}</p>
                    </div>
                    <div>
                      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                      <div class="relative">
                        <input
                          id="password"
                          v-model="loginForm.password"
                          type="password"
                          :class="[
                            'block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm transition-all',
                            formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          ]"
                          placeholder="请输入密码"
                        />
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p v-if="formErrors.password" class="mt-1 text-sm text-red-500">{{ formErrors.password }}</p>
                    </div>
                  </template>

                  <template v-else>
                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                      <div class="relative">
                        <input
                          id="phone"
                          v-model="loginForm.phone"
                          type="tel"
                          :class="[
                            'block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm transition-all',
                            formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          ]"
                          placeholder="请输入手机号"
                        />
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <p v-if="formErrors.phone" class="mt-1 text-sm text-red-500">{{ formErrors.phone }}</p>
                    </div>
                    <div>
                      <label for="smsCode" class="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                      <div class="flex gap-3">
                        <div class="relative flex-1">
                          <input
                            id="smsCode"
                            v-model="loginForm.smsCode"
                            type="text"
                            maxlength="6"
                            :class="[
                              'block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent sm:text-sm transition-all',
                              formErrors.smsCode ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            ]"
                            placeholder="请输入验证码"
                          />
                        </div>
                        <button
                          type="button"
                          :disabled="!canSendSms"
                          :class="[
                            'px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                            canSendSms
                              ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          ]"
                          @click="sendSmsCode"
                        >
                          {{ smsButtonText }}
                        </button>
                      </div>
                      <p v-if="formErrors.smsCode" class="mt-1 text-sm text-red-500">{{ formErrors.smsCode }}</p>
                    </div>
                  </template>

                  <div v-if="userStore.loginError" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    {{ userStore.loginError }}
                  </div>

                  <div class="flex items-center justify-between">
                    <label class="flex items-center cursor-pointer group">
                      <input
                        v-model="loginForm.rememberMe"
                        type="checkbox"
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded cursor-pointer"
                      />
                      <span class="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">记住我</span>
                    </label>
                    <button
                      type="button"
                      class="text-sm font-medium text-cyan-600 hover:text-cyan-500 transition-colors"
                      @click="showLoginModal = false; showForgotModal = true"
                    >
                      忘记密码?
                    </button>
                  </div>

                  <button
                    type="submit"
                    :disabled="isSubmitting || userStore.loading"
                    class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {{ submitButtonText }}
                  </button>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showForgotModal"
          class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="showForgotModal = false"
        >
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showForgotModal" class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div class="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-6 text-center">
                <div class="mx-auto h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">重置密码</h3>
                <p class="text-amber-100 mt-1 text-sm">输入您的邮箱地址，我们将发送重置链接</p>
              </div>

              <div class="p-6">
                <form @submit.prevent="handleForgotPassword" class="space-y-4">
                  <div>
                    <label for="forgot-email" class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                    <input
                      id="forgot-email"
                      v-model="forgotForm.email"
                      type="email"
                      :class="[
                        'block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm transition-all',
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      ]"
                      placeholder="请输入注册时的邮箱"
                    />
                    <p v-if="formErrors.email" class="mt-1 text-sm text-red-500">{{ formErrors.email }}</p>
                  </div>

                  <button
                    type="submit"
                    class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5"
                  >
                    发送重置邮件
                  </button>

                  <button
                    type="button"
                    class="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    @click="showForgotModal = false; showLoginModal = true"
                  >
                    返回登录
                  </button>
                </form>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
</style>