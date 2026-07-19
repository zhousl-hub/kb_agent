<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { TreeInstance } from 'element-plus'
import { permissionApi, type PermissionNode, type SecurityLevel } from '@/api/permission'

const loading = ref(false)
const saving = ref(false)
const treeRef = ref<TreeInstance>()

const permissionTree = ref<PermissionNode[]>([])
const securityLevels = ref<SecurityLevel[]>([])
const selectedPermissions = ref<string[]>([])
const selectedSecurityLevels = ref<string[]>([])

const defaultPermissionTree: PermissionNode[] = [
  { id: '1', label: '知识管理', children: [
    { id: '1-1', label: '知识接入' },
    { id: '1-2', label: '知识加工' },
    { id: '1-3', label: '知识检索' },
    { id: '1-4', label: '知识删除' },
  ]},
  { id: '2', label: '报告中心', children: [
    { id: '2-1', label: '报告列表' },
    { id: '2-2', label: '报告编辑' },
    { id: '2-3', label: '版本管理' },
    { id: '2-4', label: '报告导出' },
  ]},
  { id: '3', label: 'Dify应用', children: [
    { id: '3-1', label: '应用管理' },
    { id: '3-2', label: '应用创建' },
    { id: '3-3', label: '应用发布' },
  ]},
  { id: '4', label: '大模型管理', children: [
    { id: '4-1', label: '模型供应商' },
    { id: '4-2', label: '路由策略' },
    { id: '4-3', label: '模型配置' },
  ]},
  { id: '5', label: '系统管理', children: [
    { id: '5-1', label: '用户管理' },
    { id: '5-2', label: '角色管理' },
    { id: '5-3', label: '权限配置' },
    { id: '5-4', label: '系统设置' },
  ]},
]

const defaultSecurityLevels: SecurityLevel[] = [
  { id: 'public', name: '公开', description: '所有人可见', color: '#67C23A' },
  { id: 'internal', name: '内部', description: '仅内部员工可见', color: '#E6A23C' },
  { id: 'confidential', name: '机密', description: '需授权访问', color: '#F56C6C' },
  { id: 'secret', name: '绝密', description: '仅高管可见', color: '#909399' },
]

const currentRoleId = ref('default')

const fetchPermissionTree = async () => {
  try {
    const data = await permissionApi.getPermissionTree()
    permissionTree.value = data && data.length > 0 ? data : defaultPermissionTree
  } catch {
    permissionTree.value = defaultPermissionTree
  }
}

const fetchSecurityLevels = async () => {
  try {
    const data = await permissionApi.getSecurityLevels()
    securityLevels.value = data && data.length > 0 ? data : defaultSecurityLevels
  } catch {
    securityLevels.value = defaultSecurityLevels
  }
}

const fetchRolePermissions = async () => {
  try {
    loading.value = true
    const data = await permissionApi.getRolePermissions(currentRoleId.value)
    selectedPermissions.value = data.permissions || []
    selectedSecurityLevels.value = data.securityLevels || []
    treeRef.value?.setCheckedKeys(selectedPermissions.value)
  } catch {
    selectedPermissions.value = []
    selectedSecurityLevels.value = []
  } finally {
    loading.value = false
  }
}

const handlePermissionCheck = (_data: PermissionNode, { checkedKeys }: { checkedKeys: string[] }) => {
  selectedPermissions.value = checkedKeys as string[]
}

const handleSecurityLevelChange = (levelId: string) => {
  const index = selectedSecurityLevels.value.indexOf(levelId)
  if (index > -1) {
    selectedSecurityLevels.value.splice(index, 1)
  } else {
    selectedSecurityLevels.value.push(levelId)
  }
}

const isLevelSelected = (levelId: string) => {
  return selectedSecurityLevels.value.includes(levelId)
}

const handleSave = async () => {
  if (saving.value) return
  
  const checkedKeys = treeRef.value?.getCheckedKeys(false) as string[]
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() as string[]
  const allPermissionIds = [...checkedKeys, ...halfCheckedKeys]
  
  if (allPermissionIds.length === 0) {
    ElMessage.warning('请至少选择一个权限')
    return
  }

  saving.value = true
  try {
    await permissionApi.updatePermissions({
      roleId: currentRoleId.value,
      permissionIds: allPermissionIds,
      securityLevelIds: selectedSecurityLevels.value,
    })
    ElMessage.success('权限配置保存成功')
    selectedPermissions.value = allPermissionIds
  } catch (error) {
    ElMessage.error('权限配置保存失败，请重试')
    console.error('Save permissions error:', error)
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  treeRef.value?.setCheckedKeys([])
  selectedSecurityLevels.value = []
  ElMessage.info('已重置权限配置')
}

onMounted(async () => {
  await Promise.all([fetchPermissionTree(), fetchSecurityLevels()])
  if (currentRoleId.value) {
    await fetchRolePermissions()
  }
})
</script>

<template>
  <div class="governance-permission" v-loading="loading">
    <div class="header-actions">
      <el-button @click="handleReset">
        重置
      </el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存配置
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>权限配置 (RBAC)</span>
              <span class="selected-count">已选: {{ selectedPermissions.length }} 项</span>
            </div>
          </template>
          <el-tree
            ref="treeRef"
            :data="permissionTree"
            show-checkbox
            default-expand-all
            node-key="id"
            highlight-current
            :check-strictly="false"
            @check="handlePermissionCheck"
          >
            <template #default="{ node }">
              <span class="tree-node">
                <el-icon v-if="node.childNodes.length > 0" class="folder-icon">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M880 298.4H521L403.7 186.2c-5.5-5.2-12.8-8.2-20.3-8.2H144c-17.7 0-32 14.3-32 32v592c0 4.4 3.6 8 8 8h744c4.4 0 8-3.6 8-8V330.4c0-17.7-14.3-32-32-32z"/></svg>
                </el-icon>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>数据密级策略</span>
              <span class="selected-count">已选: {{ selectedSecurityLevels.length }} 项</span>
            </div>
          </template>
          <div class="security-levels">
            <div 
              v-for="level in securityLevels" 
              :key="level.id" 
              class="level-item"
              :class="{ selected: isLevelSelected(level.id) }"
              @click="handleSecurityLevelChange(level.id)"
            >
              <el-checkbox 
                :model-value="isLevelSelected(level.id)"
                @change="handleSecurityLevelChange(level.id)"
              />
              <div class="level-dot" :style="{ backgroundColor: level.color }"></div>
              <div class="level-info">
                <div class="level-name">{{ level.name }}</div>
                <div class="level-desc">{{ level.description }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="permission-summary">
          <template #header>
            <span>权限摘要</span>
          </template>
          <div class="summary-content">
            <div class="summary-item">
              <span class="label">角色ID:</span>
              <span class="value">{{ currentRoleId }}</span>
            </div>
            <div class="summary-item">
              <span class="label">权限数量:</span>
              <span class="value">{{ selectedPermissions.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">密级数量:</span>
              <span class="value">{{ selectedSecurityLevels.length }}</span>
            </div>
            <el-divider />
            <div class="summary-selected" v-if="selectedSecurityLevels.length > 0">
              <div class="label">已选密级:</div>
              <el-tag 
                v-for="id in selectedSecurityLevels" 
                :key="id"
                size="small"
                :color="securityLevels.find(l => l.id === id)?.color"
                class="level-tag"
              >
                {{ securityLevels.find(l => l.id === id)?.name }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.governance-permission {
  .header-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .selected-count {
      font-size: 13px;
      color: #909399;
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 6px;

    .folder-icon {
      width: 16px;
      height: 16px;
      color: #E6A23C;
    }
  }

  .security-levels {
    .level-item {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #409EFF;
        background-color: #f5f7fa;
      }

      &.selected {
        border-color: #409EFF;
        background-color: #ecf5ff;
      }

      .level-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-left: 12px;
        margin-right: 12px;
      }

      .level-info {
        .level-name { 
          font-weight: 500; 
          margin-bottom: 4px; 
        }
        .level-desc { 
          font-size: 13px; 
          color: #909399; 
        }
      }
    }
  }

  .permission-summary {
    margin-top: 20px;

    .summary-content {
      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #606266;
        }

        .value {
          font-weight: 500;
        }
      }

      .summary-selected {
        margin-top: 10px;

        .label {
          margin-bottom: 8px;
          color: #606266;
        }

        .level-tag {
          margin-right: 8px;
          color: #fff;
        }
      }
    }
  }
}
</style>