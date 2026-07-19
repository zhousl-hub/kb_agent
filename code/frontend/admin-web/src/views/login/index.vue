<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Iphone, Message } from '@element-plus/icons-vue'
import {
  getDecryptedCredentials,
  getRememberMe,
  saveCredentials,
  removeSavedCredentials,
  setRememberMe,
} from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const loginType = ref<'account' | 'sms'>('account')
const countdown = ref(0)

const loginForm = ref({
  username: '',
  password: '',
  phone: '',
  smsCode: '',
  rememberMe: false,
})

const accountRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const smsRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const keycloakConfig = {
  clientId: 'ekds-client',
  redirectUri: encodeURIComponent(window.location.origin + '/login/oauth2/code/keycloak'),
  authorizationUri: 'https://keycloak.tongyuan.cc/auth/realms/master/protocol/openid-connect/auth',
}

function handleKeycloakLogin() {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    redirect_uri: keycloakConfig.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
  })
  window.location.href = `${keycloakConfig.authorizationUri}?${params.toString()}`
}

async function handleSendSms() {
  if (!loginForm.value.phone || !/^1[3-9]\d{9}$/.test(loginForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  try {
    await authApi.sendSmsCode?.(loginForm.value.phone)
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('验证码发送失败')
  }
}

async function handleLogin() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    if (import.meta.env.DEV) {
      const mockToken = 'dev-mock-token-' + Date.now()
      const mockRefreshToken = 'dev-refresh-token-' + Date.now()
      const mockUserInfo = {
        id: '1',
        username: loginForm.value.username || loginForm.value.phone,
        nickname: loginForm.value.username === 'admin' ? '管理员' : '用户',
        email: (loginForm.value.username || 'user') + '@example.com',
        avatar: '',
        roles: loginForm.value.username === 'admin' ? ['admin'] : ['user'],
        tenantId: 'default',
        createdAt: new Date().toISOString(),
      }
      userStore.setToken(mockToken, 3600)
      userStore.setRefreshTokenValue(mockRefreshToken)
      userStore.setUserInfo(mockUserInfo)
      
      handleRememberPassword()
      handleLoginSuccess()
      return
    }

    let result
    if (loginType.value === 'account') {
      result = await authApi.login({
        username: loginForm.value.username,
        password: loginForm.value.password,
      })
    } else {
      result = await authApi.login({
        phone: loginForm.value.phone,
        smsCode: loginForm.value.smsCode,
      })
    }

    userStore.setToken(result.token, result.expiresIn || 3600)
    if (result.refreshToken) {
      userStore.setRefreshTokenValue(result.refreshToken)
    }
    userStore.setUserInfo(result.userInfo)
    
    handleRememberPassword()
    handleLoginSuccess()
  } catch (error: any) {
    console.error('登录失败', error)
    ElMessage.error(error?.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}

function handleRememberPassword() {
  if (loginForm.value.rememberMe && loginType.value === 'account') {
    saveCredentials(loginForm.value.username, loginForm.value.password)
    setRememberMe(true)
  } else {
    removeSavedCredentials()
    setRememberMe(false)
  }
}

function handleLoginSuccess() {
  userStore.scheduleTokenRefresh()
  
  const redirect = route.query.redirect as string
  if (redirect) {
    router.push(redirect)
  } else {
    router.push('/')
  }
}

function loadSavedCredentials() {
  const rememberMe = getRememberMe()
  loginForm.value.rememberMe = rememberMe
  
  if (rememberMe) {
    const creds = getDecryptedCredentials()
    if (creds) {
      loginForm.value.username = creds.username
      loginForm.value.password = creds.password
    }
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
    return
  }
  
  loadSavedCredentials()
})
</script>

<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-section">
        <div class="logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="white" fill-opacity="0.2"/>
            <path d="M20 8L32 16V28L20 36L8 28V16L20 8Z" stroke="white" stroke-width="2" fill="none"/>
            <circle cx="20" cy="22" r="4" fill="white"/>
          </svg>
        </div>
        <h1 class="brand-title">企业级知识管理平台</h1>
        <p class="brand-subtitle">管理控制台</p>
      </div>
      
      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <div class="feature-content">
            <h3>统一知识管理</h3>
            <p>整合企业多源知识资产，构建统一知识体系</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div class="feature-content">
            <h3>智能知识加工</h3>
            <p>AI驱动的知识抽取、分类与结构化处理</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
          </div>
          <div class="feature-content">
            <h3>安全权限管控</h3>
            <p>细粒度权限控制，保障企业知识资产安全</p>
          </div>
        </div>
      </div>

      <div class="copyright">© 2026 企业级知识管理平台 保留所有权利</div>
    </div>

    <div class="login-right">
      <div class="login-box">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>管理控制台</p>
        </div>

        <div class="login-tabs">
          <div
            :class="['tab-item', { active: loginType === 'account' }]"
            @click="loginType = 'account'"
          >
            账号登录
          </div>
          <div
            :class="['tab-item', { active: loginType === 'sms' }]"
            @click="loginType = 'sms'"
          >
            短信登录
          </div>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginType === 'account' ? accountRules : smsRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <template v-if="loginType === 'account'">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item prop="phone">
              <el-input
                v-model="loginForm.phone"
                placeholder="请输入手机号"
                size="large"
                :prefix-icon="Iphone"
              />
            </el-form-item>
            <el-form-item prop="smsCode">
              <el-input
                v-model="loginForm.smsCode"
                placeholder="请输入验证码"
                size="large"
                :prefix-icon="Message"
              >
                <template #append>
                  <el-button
                    :disabled="countdown > 0 || !loginForm.phone"
                    @click="handleSendSms"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </template>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="divider">
          <span>其他登录方式</span>
        </div>

        <div class="other-login">
          <el-tooltip content="企业微信登录" placement="top">
            <div class="login-icon wechat" @click="() => {}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.245 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.036 2.96c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
              </svg>
            </div>
          </el-tooltip>
          <el-tooltip content="钉钉登录" placement="top">
            <div class="login-icon dingtalk" @click="() => {}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.544c-.096.096-.288.192-.48.192-.096 0-.192 0-.288-.096l-1.344-.768c-.384-.192-.672-.48-.864-.864l-.192-.384c-.096-.192-.096-.384-.096-.576 0-.192.096-.384.192-.576l.096-.096c.096-.096.192-.192.384-.192h.096c.192 0 .384.096.48.288l.192.384c.096.192.288.384.48.48l1.344.768c.192.096.288.288.288.48s-.096.384-.288.48zm-3.168-4.128c-.096.096-.288.192-.48.192-.096 0-.192 0-.288-.096l-.384-.192c-.192-.096-.288-.288-.288-.48s.096-.384.288-.48l.384-.192c.192-.096.384-.096.576 0 .192.096.288.288.288.48s-.096.384-.288.48l.192.096c.096.096.192.192.192.384s-.096.288-.192.384v.096zm-4.896 4.128c-.096.096-.288.192-.48.192-.096 0-.192 0-.288-.096l-1.344-.768c-.384-.192-.672-.48-.864-.864l-.192-.384c-.096-.192-.096-.384-.096-.576 0-.192.096-.384.192-.576l.096-.096c.096-.096.192-.192.384-.192h.096c.192 0 .384.096.48.288l.192.384c.096.192.288.384.48.48l1.344.768c.192.096.288.288.288.48s-.096.384-.288.48zm.768-4.128c-.096.096-.288.192-.48.192-.096 0-.192 0-.288-.096l-.384-.192c-.192-.096-.288-.288-.288-.48s.096-.384.288-.48l.384-.192c.192-.096.384-.096.576 0 .192.096.288.288.288.48s-.096.384-.288.48l.192.096c.096.096.192.192.192.384s-.096.288-.192.384v.096zm5.184-2.112c-.384.192-.768.384-1.152.576-.384.192-.672.48-.864.864l-.096.192c-.192.384-.384.768-.384 1.152 0 .384.096.768.288 1.152l.096.192c.096.192.192.288.288.48l-2.4 1.344-2.4-1.344c.096-.192.192-.288.288-.48l.096-.192c.192-.384.288-.768.288-1.152 0-.384-.192-.768-.384-1.152l-.096-.192c-.192-.384-.48-.672-.864-.864-.384-.192-.768-.384-1.152-.576-.384-.192-.768-.384-1.152-.48l.48-2.88c.48.192.96.384 1.44.576.576.288 1.152.48 1.728.48s1.152-.192 1.728-.48c.576-.288 1.152-.576 1.728-.576.576 0 1.152.288 1.728.576.48.192.96.384 1.44.576l.48 2.88c-.384.096-.768.288-1.152.48z"/>
              </svg>
            </div>
          </el-tooltip>
          <el-tooltip content="SSO单点登录" placement="top">
            <div class="login-icon sso" @click="handleKeycloakLogin">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1a1f36 0%, #2d3a5c 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(0, 207, 253, 0.1) 0%, transparent 50%);
  }
}

.brand-section {
  margin-bottom: 60px;

  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 24px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .brand-title {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px;
  }

  .brand-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.features {
  flex: 1;

  .feature-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 32px;

    .feature-icon {
      width: 48px;
      height: 48px;
      background: rgba(0, 207, 253, 0.15);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;

      svg {
        width: 24px;
        height: 24px;
        color: #00cffd;
      }
    }

    .feature-content {
      h3 {
        font-size: 16px;
        font-weight: 500;
        color: #fff;
        margin: 0 0 8px;
      }

      p {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

.copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.login-right {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 40px;
}

.login-box {
  width: 100%;
  max-width: 380px;
}

.login-header {
  margin-bottom: 32px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1f36;
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;

  .tab-item {
    padding: 12px 24px;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    position: relative;
    transition: all 0.3s;

    &:hover {
      color: #00cffd;
    }

    &.active {
      color: #00cffd;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 24px;
        right: 24px;
        height: 2px;
        background: #00cffd;
      }
    }
  }
}

.login-form {
  .login-options {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .login-btn {
    width: 100%;
    background: linear-gradient(135deg, #00cffd 0%, #0096c7 100%);
    border: none;
    height: 44px;
    font-size: 16px;

    &:hover {
      background: linear-gradient(135deg, #00b8e6 0%, #0080b3 100%);
    }
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  span {
    padding: 0 16px;
    font-size: 12px;
    color: #9ca3af;
  }
}

.other-login {
  display: flex;
  justify-content: center;
  gap: 24px;

  .login-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    svg {
      width: 24px;
      height: 24px;
    }

    &.wechat {
      background: #07c160;
      color: #fff;

      &:hover {
        background: #06ae56;
      }
    }

    &.dingtalk {
      background: #0089ff;
      color: #fff;

      &:hover {
        background: #0073d9;
      }
    }

    &.sso {
      background: #6366f1;
      color: #fff;

      &:hover {
        background: #4f46e5;
      }
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
  }
}
</style>