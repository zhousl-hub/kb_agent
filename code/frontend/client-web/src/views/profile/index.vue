<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Moon, SwitchButton, Edit, ArrowRight } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { post } from '@/api/request'

const router = useRouter()
const userStore = useUserStore()

const showNicknameDialog = ref(false)
const showPasswordDialog = ref(false)
const nickname = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const themeText = computed(() => userStore.theme === 'light' ? '已关闭' : '已开启')

function handleAvatarChange() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过2MB')
      return
    }

    loading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await post<{ url: string }>('/user/avatar', formData)
      if (userStore.userInfo) {
        userStore.setUserInfo({ ...userStore.userInfo, avatar: data.url })
      }
      ElMessage.success('头像更新成功')
    } catch {
      ElMessage.error('头像上传失败')
    } finally {
      loading.value = false
    }
  }
  input.click()
}

function openNicknameDialog() {
  nickname.value = userStore.userInfo?.nickname || ''
  showNicknameDialog.value = true
}

async function saveNickname() {
  if (!nickname.value.trim()) {
    ElMessage.warning('昵称不能为空')
    return
  }

  loading.value = true
  try {
    await post('/user/profile', { nickname: nickname.value })
    if (userStore.userInfo) {
      userStore.setUserInfo({ ...userStore.userInfo, nickname: nickname.value })
    }
    showNicknameDialog.value = false
    ElMessage.success('昵称修改成功')
  } catch {
    ElMessage.error('修改失败')
  } finally {
    loading.value = false
  }
}

function openPasswordDialog() {
  oldPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordDialog.value = true
}

async function savePassword() {
  if (!oldPassword.value.trim()) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!newPassword.value.trim()) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (newPassword.value.length < 6) {
    ElMessage.warning('密码长度不能少于6位')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    ElMessage.warning('两次密码输入不一致')
    return
  }

  loading.value = true
  try {
    await post('/user/password', {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })
    showPasswordDialog.value = false
    ElMessage.success('密码修改成功')
  } catch {
    ElMessage.error('密码修改失败')
  } finally {
    loading.value = false
  }
}

function toggleTheme() {
  userStore.toggleTheme()
  ElMessage.success(userStore.theme === 'dark' ? '已开启深色模式' : '已关闭深色模式')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.logout()
    router.replace('/login')
  } catch {
    // User cancelled
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="user-card card">
      <div class="avatar-wrapper" @click="handleAvatarChange">
        <el-avatar :size="80" :src="userStore.userInfo?.avatar || 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/7c13c77275254956913656617d9f8b40~tplv-a9rns2rl98-image.image'" />
        <div class="avatar-edit">
          <el-icon><Edit /></el-icon>
        </div>
      </div>
      <div class="user-info">
        <div class="nickname">{{ userStore.userInfo?.nickname || '未设置昵称' }}</div>
        <div class="account">{{ userStore.userInfo?.email || userStore.userInfo?.phone || '点击头像更换' }}</div>
      </div>
    </div>

    <div class="section">
      <h4 class="section-title">账户信息</h4>
      <div class="card">
        <div class="setting-item" @click="handleAvatarChange">
          <span class="label">头像</span>
          <div class="value">
            <el-avatar :size="32" :src="userStore.userInfo?.avatar || 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/7c13c77275254956913656617d9f8b40~tplv-a9rns2rl98-image.image'" />
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="setting-item" @click="openNicknameDialog">
          <span class="label">昵称</span>
          <div class="value">
            <span>{{ userStore.userInfo?.nickname || '未设置' }}</span>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="setting-item">
          <span class="label">手机号</span>
          <div class="value">
            <span class="muted">{{ userStore.userInfo?.phone || '未绑定' }}</span>
          </div>
        </div>
        <div class="setting-item">
          <span class="label">邮箱</span>
          <div class="value">
            <span class="muted">{{ userStore.userInfo?.email || '未绑定' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h4 class="section-title">安全设置</h4>
      <div class="card">
        <div class="setting-item" @click="openPasswordDialog">
          <span class="label">
            <el-icon><Lock /></el-icon>
            修改密码
          </span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div class="section">
      <h4 class="section-title">通用设置</h4>
      <div class="card">
        <div class="setting-item" @click="toggleTheme">
          <span class="label">
            <el-icon><Moon /></el-icon>
            深色模式
          </span>
          <span class="muted">{{ themeText }}</span>
        </div>
      </div>
    </div>

    <div class="logout-wrapper">
      <el-button type="danger" plain @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>

    <el-dialog v-model="showNicknameDialog" title="修改昵称" width="400px">
      <el-input v-model="nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
      <template #footer>
        <el-button @click="showNicknameDialog = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="saveNickname">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="原密码">
          <el-input v-model="oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="confirmPassword" type="password" placeholder="请确认新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="savePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 32px;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #00CFFD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #070D19;
}

.user-info {
  margin-left: 24px;
  flex: 1;
}

.nickname {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.account {
  font-size: 14px;
  color: #64748B;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #64748B;
  margin: 0 0 12px 0;
  padding-left: 12px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: #f8fafc;
}

.setting-item .label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item .value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.muted {
  color: #94A3B8;
}

.arrow {
  color: #94A3B8;
}

.logout-wrapper {
  padding: 32px 0;
  display: flex;
  justify-content: center;
}
</style>