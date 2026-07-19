<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, ArrowDown } from '@element-plus/icons-vue'

interface TagView {
  path: string
  title: string
  name?: string
}

const route = useRoute()
const router = useRouter()

const visitedViews = ref<TagView[]>([
  { path: '/dashboard', title: '工作台', name: 'Dashboard' },
])

function addView() {
  const { path, meta, name } = route
  if (meta.hidden) return
  const title = (meta.title as string) || 'no-name'
  const exists = visitedViews.value.some(v => v.path === path)
  if (!exists) {
    visitedViews.value.push({ path, title, name: name as string })
  }
}

function isActive(tag: TagView) {
  return tag.path === route.path
}

function closeTag(tag: TagView) {
  const index = visitedViews.value.findIndex(v => v.path === tag.path)
  visitedViews.value.splice(index, 1)
  if (isActive(tag)) {
    const next = visitedViews.value[index] || visitedViews.value[index - 1]
    if (next) {
      router.push(next.path)
    } else {
      router.push('/dashboard')
    }
  }
}

function closeOthers() {
  visitedViews.value = visitedViews.value.filter(v => v.path === '/dashboard' || v.path === route.path)
}

function closeAll() {
  visitedViews.value = [{ path: '/dashboard', title: '工作台', name: 'Dashboard' }]
  router.push('/dashboard')
}

watch(() => route.path, addView, { immediate: true })

onMounted(() => {
  addView()
})
</script>

<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :to="tag.path"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @contextmenu.prevent
      >
        {{ tag.title }}
        <el-icon
          v-if="tag.path !== '/dashboard'"
          class="close-icon"
          @click.prevent.stop="closeTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
    </div>
    <div class="tags-actions">
      <el-dropdown @command="(cmd: string) => cmd === 'others' ? closeOthers() : closeAll()">
        <el-button size="small" type="primary" link>
          <el-icon><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="others">关闭其他</el-dropdown-item>
            <el-dropdown-item command="all">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.tags-view-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 0;
  }
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  margin-right: 5px;
  font-size: 12px;
  color: #495060;
  background: #fff;
  border: 1px solid #d8dce5;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: var(--el-color-primary);
  }

  &.active {
    background-color: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);
  }

  .close-icon {
    margin-left: 5px;
    border-radius: 50%;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.tags-actions {
  margin-left: 10px;
}
</style>