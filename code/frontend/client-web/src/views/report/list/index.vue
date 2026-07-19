<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { Plus, Search, MoreFilled, Edit, Document } from "@element-plus/icons-vue"
import { reportApi } from "@/api/report"
import type { Report } from "@/types"

const router = useRouter()
const loading = ref(false)
const reports = ref<Report[]>([])
const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  keyword: "",
  status: "",
})

const statusOptions = [
  { value: "", text: "全部" },
  { value: 0, text: "草稿" },
  { value: 1, text: "已发布" },
  { value: 2, text: "已归档" },
]

async function loadReports() {
  loading.value = true
  try {
    const result: any = await reportApi.getList(queryParams.value)

    if (result && result.items !== undefined) {
      reports.value = result.items
      total.value = result.total
    } else if (result && result.list) {
      reports.value = result.list
      total.value = result.total || result.list.length
    } else {
      reports.value = result || []
      total.value = result ? result.length : 0
    }
  } catch (error) {
    console.error("加载报告列表失败", error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.value.pageNum = 1
  loadReports()
}

function handleClear() {
  queryParams.value.keyword = ""
  queryParams.value.status = ""
  handleSearch()
}

function handleCreate() {
  router.push("/report/edit")
}

function handleEdit(id: string) {
  router.push(`/report/edit/${id}`)
}

function handleViewVersions(id: string) {
  router.push(`/report/version/${id}`)
}

function getStatusType(
  statusValue: string | number
): "info" | "success" | "warning" | "danger" {
  const stringMap: Record<string, "info" | "success" | "warning" | "danger"> = {
    draft: "info",
    published: "success",
    archived: "warning",
  }

  if (typeof statusValue === "string" && stringMap[statusValue]) {
    return stringMap[statusValue]
  }

  const numValue =
    typeof statusValue === "string" ? parseInt(statusValue) : statusValue

  if (typeof numValue === "number") {
    switch (numValue) {
      case 0:
        return "info"
      case 1:
        return "success"
      case 2:
        return "warning"
    }
  }
  return "info"
}

function getStatusText(statusValue: string | number) {
  const stringMap: Record<string, string> = {
    draft: "草稿",
    published: "已发布",
    archived: "已归档",
  }

  if (typeof statusValue === "string" && stringMap[statusValue]) {
    return stringMap[statusValue]
  }

  const numValue =
    typeof statusValue === "string" ? parseInt(statusValue) : statusValue

  if (typeof numValue === "number") {
    switch (numValue) {
      case 0:
        return "草稿"
      case 1:
        return "已发布"
      case 2:
        return "已归档"
    }
  }
  return typeof statusValue === "string"
    ? statusValue
    : statusValue.toString()
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  return dateStr.replace("T", " ").substring(0, 16)
}

function handlePageChange(page: number) {
  queryParams.value.pageNum = page
  loadReports()
}

onMounted(() => {
  loadReports()
})
</script>

<template>
  <div class="reports-page">
    <div class="page-header mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">报告中心</h1>
        <el-button type="primary" @click="handleCreate" :icon="Plus"
          >新建报告</el-button
        >
      </div>
    </div>

    <el-card class="mb-6">
      <div class="search-controls">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索报告标题"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="queryParams.status"
              placeholder="状态"
              clearable
              @change="handleSearch"
              class="w-full"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.text"
                :value="option.value"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="handleSearch">搜索</el-button>
            <el-button @click="handleClear">清空</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <div class="reports-grid">
      <el-card
        v-for="report in reports"
        :key="report.id"
        class="report-card"
        @click="handleEdit(report.id)"
      >
        <div class="report-header">
          <h3 class="report-title">{{ report.title }}</h3>
          <el-dropdown trigger="click">
            <el-button :icon="MoreFilled" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  @click.stop="handleEdit(report.id)"
                  :icon="Edit"
                  >编辑</el-dropdown-item
                >
                <el-dropdown-item
                  @click.stop="handleViewVersions(report.id)"
                  :icon="Document"
                  >版本</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="report-meta mt-2 text-sm text-gray-500">
          <div>{{ report.authorName || "未知" }} • {{ report.departmentName || "通用" }}</div>
          <div class="mt-1">{{ formatDate(report.updateTime || report.createTime) }}</div>
        </div>

        <div class="report-stats mt-4 flex justify-between items-center">
          <div class="flex gap-2">
            <el-tag :type="getStatusType(report.status)">{{
              getStatusText(report.status)
            }}</el-tag>
            <el-tag type="info">v{{ report.version || 1 }}</el-tag>
          </div>

          <el-button size="small" @click.stop="handleViewVersions(report.id)"
            >版本历史</el-button
          >
        </div>
      </el-card>

      <div
        v-if="reports.length === 0 && !loading"
        class="no-data text-center py-12 text-gray-500"
      >
        暂无报告数据
      </div>
    </div>

    <div
      class="pagination-wrapper mt-8 flex justify-center"
      v-if="!loading && reports.length > 0"
    >
      <el-pagination
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        :total="total"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.reports-page {
  padding: 0;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-controls {
  padding: 16px 0;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.report-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
  height: 180px;
  display: flex;
  flex-direction: column;
}

.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.report-meta {
  line-height: 1.5;
}

.report-stats {
  margin-top: auto;
}
</style>