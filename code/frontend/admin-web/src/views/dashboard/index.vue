<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardApi } from '@/api/system'
import { Document, User, ChatDotRound, Coin, TrendCharts, Plus } from '@element-plus/icons-vue'
import EChart from '@/components/EChart.vue'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'

const router = useRouter()
const loading = ref(false)

const stats = ref({
  knowledgeCount: 0,
  knowledgeGrowth: 0,
  activeUsers: 0,
  userGrowth: 0,
  aiCalls: 0,
  aiCallsGrowth: 0,
  knowledgeSources: 0,
  sourceGrowth: 0,
})

const statCards = computed(() => [
  {
    key: 'knowledgeCount',
    label: '总知识量',
    icon: Document,
    color: '#00CFFD',
    value: stats.value.knowledgeCount.toLocaleString(),
    growth: stats.value.knowledgeGrowth,
    growthLabel: '较上月',
  },
  {
    key: 'activeUsers',
    label: '活跃用户',
    icon: User,
    color: '#BFFF00',
    value: stats.value.activeUsers.toLocaleString(),
    growth: stats.value.userGrowth,
    growthLabel: '较上月',
  },
  {
    key: 'aiCalls',
    label: 'AI助手调用',
    icon: ChatDotRound,
    color: '#FF6B6B',
    value: stats.value.aiCalls.toLocaleString(),
    growth: stats.value.aiCallsGrowth,
    growthLabel: '较上月',
  },
  {
    key: 'knowledgeSources',
    label: '知识源数量',
    icon: Coin,
    color: '#4ECDC4',
    value: stats.value.knowledgeSources.toLocaleString(),
    growth: stats.value.sourceGrowth,
    growthLabel: '本月新增',
  },
])

const trendData = ref<{ labels: string[]; values: number[] }>({ labels: [], values: [] })
const appUsageData = ref<{ name: string; value: number }[]>([])

const trendChartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: '#1E293B',
    textStyle: { color: '#F8FAFC' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: trendData.value.labels,
    axisLine: { lineStyle: { color: '#334155' } },
    axisLabel: { color: '#94A3B8' },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#94A3B8' },
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: '#00CFFD' },
      itemStyle: { color: '#00CFFD' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 207, 253, 0.3)' },
          { offset: 1, color: 'rgba(0, 207, 253, 0.05)' },
        ]),
      },
      data: trendData.value.values,
    },
  ],
}))

const appUsageChartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: '#1E293B',
    textStyle: { color: '#F8FAFC' },
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#CBD5E1' },
  },
  series: [
    {
      name: '应用分布',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#0F172A',
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#F8FAFC' },
      },
      labelLine: { show: false },
      data: appUsageData.value,
      color: ['#00CFFD', '#BFFF00', '#FF6B6B', '#4ECDC4', '#45B7D1'],
    },
  ],
}))

const activities = ref<any[]>([])
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const quickActions = [
  { label: '新增知识源', icon: Plus, route: '/knowledge/ingestion', color: '#00CFFD' },
  { label: '创建AI助手', icon: ChatDotRound, route: '/dify/app', color: '#BFFF00' },
  { label: '查看报告', icon: TrendCharts, route: '/report', color: '#4ECDC4' },
]

async function loadDashboard() {
  loading.value = true
  try {
    const [statsData, trendRes, usageRes, activitiesRes] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getKnowledgeTrend(30),
      dashboardApi.getAppUsage(),
      dashboardApi.getActivities({ pageNum: 1, pageSize: 10 }),
    ])
    stats.value = statsData
    trendData.value = trendRes
    appUsageData.value = usageRes
    activities.value = activitiesRes.list
    pagination.value.total = activitiesRes.total
  } catch (error) {
    console.error('加载仪表盘数据失败', error)
    trendData.value = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      values: [1200, 1900, 3000, 5000, 8000, 12000],
    }
    appUsageData.value = [
      { name: '智能客服', value: 35 },
      { name: '销售助手', value: 25 },
      { name: '研发助手', value: 20 },
      { name: '运营助手', value: 15 },
      { name: '其他', value: 5 },
    ]
  } finally {
    loading.value = false
  }
}

async function handlePageChange(page: number) {
  pagination.value.pageNum = page
  try {
    const res = await dashboardApi.getActivities({
      pageNum: page,
      pageSize: pagination.value.pageSize,
    })
    activities.value = res.list
  } catch (error) {
    console.error('加载活动数据失败', error)
  }
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    success: 'success',
    pending: 'warning',
    failed: 'danger',
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    success: '成功',
    pending: '审核中',
    failed: '失败',
  }
  return map[status] || status
}

function handleQuickAction(route: string) {
  router.push(route)
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="dashboard-container" v-loading="loading">
    <div class="stats-grid">
      <div v-for="card in statCards" :key="card.key" class="stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ card.label }}</span>
          <el-icon :size="24" :color="card.color">
            <component :is="card.icon" />
          </el-icon>
        </div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-footer">
          <span class="growth" :class="{ positive: card.growth > 0 }">
            <el-icon v-if="card.growth > 0"><i class="el-icon-arrow-up" /></el-icon>
            <el-icon v-else><i class="el-icon-arrow-down" /></el-icon>
            {{ Math.abs(card.growth) }}%
          </span>
          <span class="growth-label">{{ card.growthLabel }}</span>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h4 class="card-title">知识访问趋势</h4>
        <EChart :option="trendChartOption" height="280px" />
      </div>
      <div class="chart-card">
        <h4 class="card-title">应用使用分布</h4>
        <EChart :option="appUsageChartOption" height="280px" />
      </div>
    </div>

    <div class="content-row">
      <div class="activity-card">
        <div class="card-header">
          <h4 class="card-title">最近活动</h4>
          <el-button type="primary" link>查看全部</el-button>
        </div>
        <el-table :data="activities" style="width: 100%">
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="type" label="操作类型" width="120">
            <template #default="{ row }">
              <span>{{ row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="detail" label="详情" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <div class="quick-actions-card">
        <h4 class="card-title">快捷操作</h4>
        <div class="quick-actions">
          <div
            v-for="action in quickActions"
            :key="action.route"
            class="quick-action-btn"
            @click="handleQuickAction(action.route)"
          >
            <div class="action-icon" :style="{ backgroundColor: action.color + '20' }">
              <el-icon :size="24" :color="action.color">
                <component :is="action.icon" />
              </el-icon>
            </div>
            <span class="action-label">{{ action.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00CFFD;
    box-shadow: 0 0 15px rgba(0, 207, 253, 0.1);
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .stat-label {
    font-size: 14px;
    color: #CBD5E1;
    font-weight: 500;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 8px;
  }

  .stat-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;

    .growth {
      display: flex;
      align-items: center;
      color: #4ADE80;

      &.positive {
        color: #4ADE80;
      }
    }

    .growth-label {
      color: #94A3B8;
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 8px;
  padding: 20px;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #F8FAFC;
    margin-bottom: 16px;
  }
}

.content-row {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.activity-card {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 8px;
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #F8FAFC;
  }

  :deep(.el-table) {
    background: transparent;
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: #1E293B;
    --el-table-header-text-color: #CBD5E1;
    --el-table-text-color: #F8FAFC;
    --el-table-border-color: #1E293B;
    --el-table-row-hover-bg-color: rgba(0, 207, 253, 0.05);

    .el-table__cell {
      padding: 12px 0;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;

    :deep(.el-pagination) {
      --el-pagination-bg-color: #1E293B;
      --el-pagination-button-bg-color: #1E293B;
      --el-pagination-hover-color: #00CFFD;
    }
  }
}

.quick-actions-card {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 8px;
  padding: 20px;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #F8FAFC;
    margin-bottom: 16px;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .quick-action-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #1E293B;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 207, 253, 0.1);
      transform: translateX(4px);
    }

    .action-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-label {
      font-size: 14px;
      font-weight: 500;
      color: #F8FAFC;
    }
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-row {
    grid-template-columns: 1fr;
  }

  .quick-actions-card {
    order: -1;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>