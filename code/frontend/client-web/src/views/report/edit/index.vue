<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reportApi } from '@/api/report'
import type { SearchResult } from '@/types'
import { ElMessage } from 'element-plus'
import { ElButton, ElInput, ElButtonGroup, ElCard, ElDialog, ElEmpty, ElSkeleton, ElTag } from 'element-plus'
import { Search, DocumentAdd, CaretRight, Upload, Picture, Finished, VideoPlay, Tickets, Pointer, Close } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const reportId = route.params.id as string
const isNew = !reportId

const title = ref('')
const content = ref('')
const saving = ref(false)
const saveStatus = ref<'saved' | 'saving' | 'offline'>('saved')
let autoSaveTimer: ReturnType<typeof setInterval> | null = null

const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const showSearchPopup = ref(false)

async function loadReport() {
  if (isNew) return
  try {
    const report = await reportApi.getDetail(reportId)
    title.value = report.title
    content.value = report.content
  } catch (error) {
    console.error('加载报告失败', error)
    ElMessage.error('加载报告失败')
    router.push('/report/list')
  }
}

async function handleSave() {
  if (!title.value.trim()) {
    ElMessage.warning('请输入报告标题')
    return
  }

  saveStatus.value = 'saving'
  try {
    if (isNew) {
      const report = await reportApi.create({ title: title.value, content: content.value })
      router.replace(`/report/edit/${report.id}`)
      ElMessage.success('创建成功')
    } else {
      await reportApi.update(reportId, { title: title.value, content: content.value })
      ElMessage.success('保存成功')
    }
    saveStatus.value = 'saved'
  } catch (error) {
    console.error('保存失败', error)
    saveStatus.value = 'offline'
    ElMessage.error('保存失败')
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  try {
    searchResults.value = await reportApi.search(searchQuery.value)
  } catch (error) {
    console.error('检索失败', error)
    ElMessage.error('检索失败')
  } finally {
    isSearching.value = false
  }
}

function insertToEditor(result: SearchResult) {
  const text = result.content
  content.value += `\n\n> **引用来源：${result.sourceTitle}**\n> \n> ${text}\n`
  ElMessage.success('已插入引用内容')
  showSearchPopup.value = false
}

function copyContent(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

function startAutoSave() {
  autoSaveTimer = setInterval(() => {
    if (title.value || content.value) {
      handleSave()
    }
  }, 30000)
}

function stopAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

onMounted(() => {
  loadReport()
  startAutoSave()
})

onUnmounted(() => {
  stopAutoSave()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="fixed top-0 left-0 right-0 bg-white shadow-lg z-10 border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <el-button type="default" @click="router.push('/report/list')" :icon="Close">
              取消
            </el-button>
            <h1 class="text-xl font-semibold text-gray-800">
              {{ isNew ? '新建报告' : '编辑报告' }}
            </h1>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">
              <el-tag :type="saveStatus === 'saved' ? 'success' : saveStatus === 'saving' ? 'warning' : 'info'">
                {{ saveStatus === 'saved' ? '已保存' : saveStatus === 'saving' ? '保存中...' : '离线缓存' }}
              </el-tag>
            </span>
            <el-button 
              type="primary" 
              size="default"
              :loading="saving"
              @click="handleSave"
              :icon="Finished"
            >
              保存
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 pt-20 pb-24 flex flex-col px-6">
      <!-- 标题区域 -->
      <div class="bg-white rounded-lg p-5 mb-5 shadow-sm border border-gray-200">
        <el-input
          v-model="title"
          placeholder="请输入报告标题"
          size="large"
          class="title-input"
          :autosize="{ minRows: 1, maxRows: 3 }"
        />
      </div>

      <!-- 编辑器区域 -->
      <div class="bg-white rounded-lg shadow-sm flex-1 flex flex-col border border-gray-200 overflow-hidden">
        <!-- 工具栏 -->
        <div class="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
          <el-button-group>
            <el-button size="small" plain>H1</el-button>
            <el-button size="small" plain>H2</el-button>
            <el-button size="small" plain>H3</el-button>
          </el-button-group>
          
          <el-button-group>
            <el-button size="small" plain :icon="Tickets" title="粗体">B</el-button>
            <el-button size="small" plain :icon="Tickets" title="斜体">I</el-button>
            <el-button size="small" plain title="下划线">U</el-button>
          </el-button-group>
          
          <el-button-group>
            <el-button size="small" plain :icon="Pointer">引用</el-button>
            <el-button size="small" plain :icon="Picture">图片</el-button>
          </el-button-group>
          
          <el-button-group>
            <el-button size="small" plain :icon="VideoPlay">视频</el-button>
            <el-button size="small" plain :icon="Upload">附件</el-button>
          </el-button-group>
        </div>
        
        <!-- 内容编辑区 -->
        <el-input
          v-model="content"
          type="textarea"
          placeholder="开始编写报告内容..."
          class="flex-1 !p-4 !border-0 resize-none"
          :autosize="{ minRows: 20, maxRows: 30 }"
        />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
      <el-button
        type="primary"
        plain
        :icon="Search"
        class="flex-1"
        @click="showSearchPopup = true"
      >
        检索知识库
      </el-button>
      <el-button
        type="success"
        :icon="DocumentAdd"
        :disabled="!title || !content"
        class="flex-1"
      >
        发布报告
      </el-button>
      <el-button
        v-if="!isNew"
        plain
        :icon="CaretRight"
        class="flex-1"
        @click="router.push(`/report/version/${reportId}`)"
      >
        查看版本
      </el-button>
    </div>

    <!-- 检索知识库弹窗 -->
    <el-dialog
      v-model="showSearchPopup"
      title="检索知识库"
      width="60%"
      destroy-on-close
    >
      <div class="search-dialog-content">
        <el-input
          v-model="searchQuery"
          placeholder="搜索知识库内容"
          size="large"
          class="mb-4"
          @keyup.enter="handleSearch"
          :suffix-icon="Search"
        />
        <el-button
          type="primary"
          :loading="isSearching"
          @click="handleSearch"
          class="w-full mb-4"
        >
          搜索
        </el-button>

        <el-skeleton :loading="isSearching" :rows="4">
          <template #default>
            <div class="results-container max-h-96 overflow-y-auto">
              <el-empty
                v-if="searchResults.length === 0 && !isSearching"
                description="输入关键词检索知识库"
              />

              <el-card
                v-for="result in searchResults"
                :key="result.id"
                class="mb-4 search-result-card"
              >
                <div class="result-content">
                  <h4 class="result-title text-base font-semibold text-gray-800 mb-2">
                    {{ result.sourceTitle }}
                  </h4>
                  <p class="result-abstract text-sm text-gray-600 mb-3">
                    {{ result.content }}
                  </p>
                  
                  <div class="actions flex gap-2">
                    <el-button
                      type="primary"
                      size="small"
                      @click="insertToEditor(result)"
                    >
                      插入报告
                    </el-button>
                    <el-button
                      size="small"
                      @click="copyContent(result.content)"
                    >
                      复制内容
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </template>
        </el-skeleton>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.title-input :deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none;
  font-size: 1.5rem;
  font-weight: 600;
}
.title-input :deep(.el-input__inner) {
  font-size: 1.5rem;
  font-weight: 600;
  border: none;
}

.search-result-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.search-result-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.result-title {
  max-height: 2.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-abstract {
  line-height: 1.5;
  max-height: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.search-dialog-content {
  padding: 0;
}
.results-container {
  padding: 0;
}
</style>