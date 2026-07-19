<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import { Refresh, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const config = ref<Record<string, any>>({})

const configGroups = [
  { key: 'system', label: '系统配置', items: [
    { field: 'siteName', label: '站点名称', type: 'input' },
    { field: 'maxUploadSize', label: '最大上传大小(MB)', type: 'number' },
  ]},
  { key: 'security', label: '安全配置', items: [
    { field: 'sessionTimeout', label: '会话超时(分钟)', type: 'number' },
    { field: 'enableMfa', label: '启用MFA', type: 'switch' },
  ]},
  { key: 'ai', label: 'AI配置', items: [
    { field: 'defaultModel', label: '默认模型', type: 'input' },
    { field: 'maxTokens', label: '最大Token数', type: 'number' },
  ]},
]

async function loadConfig() {
  loading.value = true
  try {
    config.value = await systemApi.getConfig()
  } catch (error) {
    console.error('加载配置失败', error)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  try {
    await systemApi.updateConfig(config.value)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存配置失败', error)
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="system-config">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <div>
            <el-button :icon="Refresh" @click="loadConfig">刷新</el-button>
            <el-button type="primary" :icon="Check" @click="handleSave">保存</el-button>
          </div>
        </div>
      </template>

      <el-collapse v-model="activeNames">
        <el-collapse-item v-for="group in configGroups" :key="group.key" :title="group.label" :name="group.key">
          <el-form label-width="150px">
            <el-form-item v-for="item in group.items" :key="item.field" :label="item.label">
              <el-input v-if="item.type === 'input'" v-model="config[item.field]" />
              <el-input-number v-else-if="item.type === 'number'" v-model="config[item.field]" />
              <el-switch v-else-if="item.type === 'switch'" v-model="config[item.field]" />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return { activeNames: ['system', 'security', 'ai'] }
  }
}
</script>

<style lang="scss" scoped>
.system-config {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>