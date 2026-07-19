<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Back } from '@element-plus/icons-vue'

const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">403</h1>
      <h2 class="error-title">权限不足</h2>
      <p class="error-desc">抱歉，您没有权限访问此页面</p>
      <el-button type="primary" :icon="Back" @click="router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .error-content {
    text-align: center;

    .error-code {
      font-size: 120px;
      font-weight: bold;
      color: #F56C6C;
      margin: 0;
      line-height: 1;
    }

    .error-title {
      font-size: 32px;
      color: #303133;
      margin: 20px 0 10px;
    }

    .error-desc {
      font-size: 16px;
      color: #909399;
      margin-bottom: 30px;
    }
  }
}
</style>