<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { authApi, resolveLoginUsername } from '@/api/auth'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value.trim()) {
    ElMessage.warning('请输入用户名或邮箱')
    return
  }
  if (!password.value.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const result = await authApi.login({
      username: resolveLoginUsername(email.value),
      password: password.value,
    })

    if (!result?.token) {
      throw new Error('登录响应异常，未获取到 token')
    }

    userStore.setToken(result.token)
    userStore.setUserInfo({
      id: String(result.user.id),
      username: result.user.username,
      nickname: result.user.realName || result.user.username,
      name: result.user.realName,
      avatar: result.user.avatar || '',
      email: result.user.email || email.value,
      tenantId: result.user.tenantId ? Number(result.user.tenantId) : undefined,
    })

    ElMessage.success('登录成功')
    await nextTick()
    await router.replace({ name: 'Home' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '登录失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <img src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/564a89ae70ca4e39bf726b5df394adcd~tplv-a9rns2rl98-image.image" alt="Logo" />
        </div>
        <h1>知识管理平台</h1>
        <p>AI驱动的知识管理与问答系统</p>
      </div>

      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="email"
            size="large"
            placeholder="请输入用户名或邮箱"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            size="large"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
            class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>还没有账号？</span>
        <a @click="router.push('/register')">立即注册</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
}

.login-container {
  width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.logo img {
  width: 100%;
  height: 100%;
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #0F172A;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

.login-btn {
  width: 100%;
  background-color: #00CFFD;
  border-color: #00CFFD;
  color: #070D19;
  font-weight: 600;
}

.login-btn:hover {
  background-color: #00B8E6;
  border-color: #00B8E6;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #64748B;
}

.login-footer a {
  color: #00CFFD;
  cursor: pointer;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>