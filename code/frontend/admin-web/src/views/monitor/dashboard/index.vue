<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { monitorApi } from '@/api/system'
import { TrendCharts, ChatDotRound, DataAnalysis } from '@element-plus/icons-vue'
import EChart from '@/components/EChart.vue'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'

const metrics = ref({
  qps: 0,
  p95Latency: 0,
  errorRate: 0,
  hitRate: 0,
  embeddingCost: 0,
  retrievalCost: 0,
  llmCost: 0,
})

const invokeTrendData = ref<{ labels: string[]; values: number[] }>({ labels: [], values: [] })

const metricCards = [
  { key: 'qps', label: 'QPS', icon: TrendCharts, color: '#409EFF', unit: 'req/s' },
  { key: 'p95Latency', label: 'P95 延迟', icon: DataAnalysis, color: '#67C23A', unit: 'ms' },
  { key: 'errorRate', label: '错误率', icon: ChatDotRound, color: '#F56C6C', unit: '%' },
  { key: 'hitRate', label: '命中率', icon: TrendCharts, color: '#E6A23C', unit: '%' },
]

const invokeTrendOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: invokeTrendData.value.labels,
    axisLine: { lineStyle: { color: '#E4E7ED' } },
    axisLabel: { color: '#606266' },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#E4E7ED', type: 'dashed' } },
    axisLabel: { color: '#606266' },
  },
  series: [
    {
      name: '调用量',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: '#409EFF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.25)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.02)' },
        ]),
      },
      data: invokeTrendData.value.values,
    },
  ],
}))

const costOption = computed<EChartsOption>(() => {
  const costData = [
    { value: metrics.value.embeddingCost, name: 'Embedding', itemStyle: { color: '#409EFF' } },
    { value: metrics.value.retrievalCost, name: '检索', itemStyle: { color: '#67C23A' } },
    { value: metrics.value.llmCost, name: 'LLM', itemStyle: { color: '#E6A23C' } },
  ].filter((item) => item.value > 0)

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#606266' },
    },
    series: [
      {
        name: '成本分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: costData.length > 0 ? costData : [{ value: 1, name: '暂无数据', itemStyle: { color: '#DCDFE6' } }],
      },
    ],
  }
})

const totalCost = computed(() => {
  return (
    metrics.value.embeddingCost +
    metrics.value.retrievalCost +
    metrics.value.llmCost
  ).toFixed(2)
})

async function loadMetrics() {
  try {
    const [metricsData, trendData] = await Promise.all([
      monitorApi.getMetrics(),
      Promise.resolve({
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        values: [120, 80, 350, 680, 520, 380, 210],
      }),
    ])
    metrics.value = metricsData
    invokeTrendData.value = trendData
  } catch (error) {
    console.error('加载监控指标失败', error)
  }
}

onMounted(() => {
  loadMetrics()
})
</script>

<template>
  <div class="monitor-dashboard">
    <div class="metrics-row">
      <el-card v-for="card in metricCards" :key="card.key" class="metric-card" shadow="hover">
        <div class="metric-content">
          <el-icon :size="32" :color="card.color"><component :is="card.icon" /></el-icon>
          <div class="metric-info">
            <div class="metric-value">{{ metrics[card.key as keyof typeof metrics] }} {{ card.unit }}</div>
            <div class="metric-label">{{ card.label }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>调用量趋势</span>
            </div>
          </template>
          <EChart :option="invokeTrendOption" height="280px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>成本分析</span>
              <span class="total-cost">总计: ¥{{ totalCost }}</span>
            </div>
          </template>
          <EChart :option="costOption" height="280px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>成本明细</span>
            </div>
          </template>
          <div class="cost-detail">
            <div class="cost-item">
              <div class="cost-label">
                <span class="cost-dot" style="background-color: #409EFF;"></span>
                <span>Embedding 成本</span>
              </div>
              <div class="cost-value">¥{{ metrics.embeddingCost.toFixed(2) }}</div>
              <div class="cost-percent">
                {{ totalCost !== '0.00' ? ((metrics.embeddingCost / parseFloat(totalCost)) * 100).toFixed(1) : 0 }}%
              </div>
            </div>
            <div class="cost-item">
              <div class="cost-label">
                <span class="cost-dot" style="background-color: #67C23A;"></span>
                <span>检索成本</span>
              </div>
              <div class="cost-value">¥{{ metrics.retrievalCost.toFixed(2) }}</div>
              <div class="cost-percent">
                {{ totalCost !== '0.00' ? ((metrics.retrievalCost / parseFloat(totalCost)) * 100).toFixed(1) : 0 }}%
              </div>
            </div>
            <div class="cost-item">
              <div class="cost-label">
                <span class="cost-dot" style="background-color: #E6A23C;"></span>
                <span>LLM 调用成本</span>
              </div>
              <div class="cost-value">¥{{ metrics.llmCost.toFixed(2) }}</div>
              <div class="cost-percent">
                {{ totalCost !== '0.00' ? ((metrics.llmCost / parseFloat(totalCost)) * 100).toFixed(1) : 0 }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.monitor-dashboard {
  .metrics-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .metric-card {
    flex: 1;
    .metric-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
    }
    .metric-label {
      font-size: 14px;
      color: #909399;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .total-cost {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }

  .cost-detail {
    .cost-item {
      display: flex;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #EBEEF5;

      &:last-child {
        border-bottom: none;
      }

      .cost-label {
        display: flex;
        align-items: center;
        flex: 1;

        .cost-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 10px;
        }
      }

      .cost-value {
        width: 120px;
        text-align: right;
        font-weight: 500;
        color: #303133;
      }

      .cost-percent {
        width: 60px;
        text-align: right;
        color: #909399;
      }
    }
  }
}
</style>