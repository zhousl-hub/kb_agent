<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { roleApi, menuApi } from '@/api/auth'
import type { RoleInfo } from '@/types/user'
import { Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const loading = ref(false)
const roles = ref<RoleInfo[]>([])

const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  status: 1,
})
const rules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '以字母开头，只能包含字母、数字、下划线', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' },
  ],
}

const permDialogVisible = ref(false)
const permTreeRef = ref()
const currentRoleId = ref('')
const permissionTree = ref<{ id: string; name: string; children?: any[] }[]>([])
const checkedPermissions = ref<string[]>([])
const permLoading = ref(false)
const treeProps = {
  children: 'children',
  label: 'name',
}

async function loadRoles() {
  loading.value = true
  try {
    const result = await roleApi.getList({ pageNum: 1, pageSize: 100 })
    roles.value = result.list
  } catch (error) {
    console.error('加载角色列表失败', error)
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogType.value = 'create'
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(row: RoleInfo) {
  dialogType.value = 'edit'
  resetForm()
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.description = row.description || ''
  form.status = (row as any).status ?? 1
  dialogVisible.value = true
}

function resetForm() {
  form.id = ''
  form.name = ''
  form.code = ''
  form.description = ''
  form.status = 1
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const data = {
      name: form.name,
      code: form.code,
      description: form.description,
      status: form.status,
    }
    if (dialogType.value === 'create') {
      await roleApi.create(data)
      ElMessage.success('角色创建成功')
    } else {
      await roleApi.update(form.id, data)
      ElMessage.success('角色更新成功')
    }
    dialogVisible.value = false
    loadRoles()
  } catch (error) {
    console.error('保存角色失败', error)
  }
}

async function handleDelete(row: RoleInfo) {
  try {
    await ElMessageBox.confirm(`确定要删除角色「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await roleApi.delete(row.id)
    ElMessage.success('角色删除成功')
    loadRoles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败', error)
    }
  }
}

async function openPermDialog(row: RoleInfo) {
  currentRoleId.value = row.id
  checkedPermissions.value = [...(row.permissions || [])]
  permDialogVisible.value = true
  await loadPermissionTree()
}

async function loadPermissionTree() {
  permLoading.value = true
  try {
    permissionTree.value = await menuApi.getMenus()
  } catch (error) {
    console.error('加载权限树失败', error)
  } finally {
    permLoading.value = false
  }
}

async function handleAssignPermissions() {
  const checkedNodes = permTreeRef.value?.getCheckedNodes(false, true) || []
  const permissionIds = checkedNodes.map((node: any) => node.id)
  
  try {
    await roleApi.assignPermissions(currentRoleId.value, permissionIds)
    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
    loadRoles()
  } catch (error) {
    console.error('分配权限失败', error)
  }
}

const dialogTitle = computed(() => (dialogType.value === 'create' ? '新增角色' : '编辑角色'))

onMounted(() => {
  loadRoles()
})
</script>

<template>
  <div class="auth-role">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增角色</el-button>
        </div>
      </template>

      <el-table :data="roles" v-loading="loading" stripe>
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="(row as any).status === 1 ? 'success' : 'danger'">
              {{ (row as any).status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Key" @click="openPermDialog(row)">权限</el-button>
            <el-button text :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="角色标识" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色标识" maxlength="30" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permDialogVisible" title="分配权限" width="500px" destroy-on-close>
      <el-tree
        ref="permTreeRef"
        :data="permissionTree"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="checkedPermissions"
        v-loading="permLoading"
        check-strictly
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignPermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.auth-role {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>