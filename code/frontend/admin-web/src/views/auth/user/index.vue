<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi, roleApi } from '@/api/auth'
import type { UserInfo, RoleInfo } from '@/types/user'
import { Plus, Edit, Delete, Key, User } from '@element-plus/icons-vue'

const loading = ref(false)
const users = ref<UserInfo[]>([])
const roles = ref<RoleInfo[]>([])
const total = ref(0)
const queryParams = ref({ pageNum: 1, pageSize: 10, keyword: '' })

const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const resetPasswordDialogVisible = ref(false)
const resetPasswordUserId = ref('')
const resetPasswordResult = ref('')

const departments = [
  { id: '1', name: '技术研发部' },
  { id: '2', name: '产品设计部' },
  { id: '3', name: '运营部' },
  { id: '4', name: '市场部' },
  { id: '5', name: '人力资源部' },
]

const defaultFormData = {
  id: '',
  username: '',
  nickname: '',
  email: '',
  phone: '',
  departmentId: '',
  roleIds: [] as string[],
  status: 1,
  password: '',
}

const formData = reactive({ ...defaultFormData })

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 30, message: '昵称最多 30 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' },
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change', type: 'array' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' },
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
}

async function loadUsers() {
  loading.value = true
  try {
    const result = await userApi.getList(queryParams.value)
    users.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载用户列表失败', error)
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  try {
    const result = await roleApi.getList({ pageNum: 1, pageSize: 100 })
    roles.value = result.list
  } catch (error) {
    console.error('加载角色列表失败', error)
  }
}

function handleCreate() {
  dialogType.value = 'create'
  Object.assign(formData, defaultFormData)
  dialogVisible.value = true
}

async function handleEdit(row: UserInfo) {
  dialogType.value = 'edit'
  try {
    const detail = await userApi.getDetail(row.id)
    Object.assign(formData, {
      id: detail.id,
      username: detail.username,
      nickname: detail.nickname,
      email: detail.email,
      phone: detail.phone || '',
      departmentId: detail.departmentId || '',
      roleIds: detail.roles || [],
      status: 1,
      password: '',
    })
    dialogVisible.value = true
  } catch (error) {
    console.error('加载用户详情失败', error)
  }
}

function handleDelete(row: UserInfo) {
  ElMessageBox.confirm(
    `确定要删除用户 "${row.nickname || row.username}" 吗？删除后不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await userApi.delete(row.id)
      ElMessage.success('删除成功')
      loadUsers()
    } catch (error) {
      console.error('删除用户失败', error)
    }
  }).catch(() => {})
}

function handleResetPassword(row: UserInfo) {
  resetPasswordUserId.value = row.id
  resetPasswordResult.value = ''
  resetPasswordDialogVisible.value = true
}

async function submitResetPassword() {
  try {
    const result = await userApi.resetPassword(resetPasswordUserId.value)
    resetPasswordResult.value = result.password
    ElMessage.success('密码重置成功')
    loadUsers()
  } catch (error) {
    console.error('重置密码失败', error)
  }
}

async function submitForm() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    if (dialogType.value === 'create') {
      await userApi.create({
        username: formData.username,
        nickname: formData.nickname,
        email: formData.email,
        phone: formData.phone || undefined,
        departmentId: formData.departmentId || undefined,
        roles: formData.roleIds,
        status: formData.status,
        password: formData.password,
      })
      ElMessage.success('创建成功')
    } else {
      await userApi.update(formData.id, {
        nickname: formData.nickname,
        email: formData.email,
        phone: formData.phone || undefined,
        departmentId: formData.departmentId || undefined,
        roles: formData.roleIds,
        status: formData.status,
      })
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    loadUsers()
  } catch (error) {
    console.error('保存用户失败', error)
  }
}

function handleDialogClose() {
  formRef.value?.resetFields()
}

function copyPassword(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<template>
  <div class="auth-user">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增用户</el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索用户名/邮箱"
          style="width: 200px"
          clearable
          @keyup.enter="loadUsers"
        />
        <el-button type="primary" @click="loadUsers">搜索</el-button>
      </div>

      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="roles" label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role"
              size="small"
              class="role-tag"
              type="primary"
            >
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tenantName" label="租户" width="100" />
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button text :icon="Key" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next"
        @change="loadUsers"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增用户' : '编辑用户'"
      width="560px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择部门" style="width: 100%">
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="dialogType === 'create'" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="400px"
    >
      <div v-if="!resetPasswordResult" class="reset-password-content">
        <el-icon class="warning-icon"><Key /></el-icon>
        <p>确定要重置该用户的密码吗？重置后将生成新密码。</p>
      </div>
      <div v-else class="reset-password-result">
        <el-icon class="success-icon"><User /></el-icon>
        <p>密码重置成功！新密码为：</p>
        <div class="new-password">
          <span>{{ resetPasswordResult }}</span>
          <el-button
            text
            type="primary"
            @click="copyPassword(resetPasswordResult)"
          >
            复制
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">
          {{ resetPasswordResult ? '关闭' : '取消' }}
        </el-button>
        <el-button
          v-if="!resetPasswordResult"
          type="primary"
          @click="submitResetPassword"
        >
          确定重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.auth-user {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .role-tag {
    margin-right: 5px;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .user-form {
    padding-right: 20px;
  }

  .reset-password-content,
  .reset-password-result {
    text-align: center;
    padding: 20px 0;

    .warning-icon {
      font-size: 48px;
      color: var(--el-color-warning);
      margin-bottom: 16px;
    }

    .success-icon {
      font-size: 48px;
      color: var(--el-color-success);
      margin-bottom: 16px;
    }

    p {
      color: #606266;
      margin-bottom: 16px;
    }

    .new-password {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: #f5f7fa;
      padding: 12px 20px;
      border-radius: 4px;

      span {
        font-family: monospace;
        font-size: 16px;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>