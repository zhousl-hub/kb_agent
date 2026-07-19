<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    width?: string
    height?: string
    theme?: string
  }>(),
  {
    width: '100%',
    height: '300px',
    theme: '',
  }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, props.theme)
  chartInstance.setOption(props.option)
}

function resizeChart() {
  chartInstance?.resize()
}

function updateChart() {
  if (chartInstance) {
    chartInstance.setOption(props.option, true)
  }
}

watch(
  () => props.option,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

defineExpose({
  chartInstance,
  resize: resizeChart,
})
</script>

<template>
  <div ref="chartRef" class="echarts-container" :style="{ width, height }"></div>
</template>

<style lang="scss" scoped>
.echarts-container {
  min-height: 200px;
}
</style>