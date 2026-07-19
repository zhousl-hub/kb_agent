<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const keycloakConfig = {
  clientId: 'ekds-client',
  clientSecret: '',
  tokenUri: 'https://keycloak.tongyuan.cc/auth/realms/master/protocol/openid-connect/token',
}

async function handleOAuthCallback() {
  const code = route.query.code as string
  const error = route.query.error as string
  const errorDescription = route.query.error_description as string

  if (error) {
    ElMessage.error(errorDescription || 'OAuth授权失败')
    router.push('/login')
    return
  }

  if (!code) {
    ElMessage.error('无效的授权码')
    router.push('/login')
    return
  }

  try {
    const tokenResponse = await fetch(keycloakConfig.tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: keycloakConfig.clientId,
        code,
        redirect_uri: window.location.origin + '/login/oauth2/code/keycloak',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('获取Token失败')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    userStore.setToken(access_token, expires_in || 3600)
    if (refresh_token) {
      userStore.setRefreshTokenValue(refresh_token)
    }

    const userInfo = await authApi.getCurrentUser()
    userStore.setUserInfo(userInfo)
    
    await userStore.fetchMenusAndPermissions()
    userStore.scheduleTokenRefresh()

    ElMessage.success('登录成功')
    
    const redirect = route.query.state as string || '/'
    router.push(redirect)
  } catch (err: any) {
    console.error('OAuth回调处理失败:', err)
    ElMessage.error(err?.message || '登录失败，请重试')
    router.push('/login')
  }
}

onMounted(() => {
  handleOAuthCallback()
})
</script>

<template>
  <div class="oauth-callback-container">
    <div class="loading-content">
      <el-icon class="loading-icon" :size="48">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" opacity="0.3"/>
          <path d="M12 2C6.48 2 2 6.48 2 12h2c0-4.42 3.58-8 8-8V2z"/>
        </svg>
      </el-icon>
      <p class="loading-text">正在登录，请稍候...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.oauth-callback-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1f36 0%, #2d3a5c 100%);
}

.loading-content {
  text-align: center;
}

.loading-icon {
  color: #00cffd;
  animation: rotate 1.5s linear infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>