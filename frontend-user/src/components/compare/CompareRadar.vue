<script setup lang="ts">
/**
 * CompareRadar - 英雄属性雷达图组件
 * 基于 ECharts 渲染两个英雄的六维属性对比雷达图
 *
 * Props:
 *  - hero1: 第一个英雄
 *  - hero2: 第二个英雄
 */
import { computed, shallowRef } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import type { Hero, HeroStats } from '@/types'
import { STAT_KEYS, STAT_LABELS, STAT_MAX, type StatKey } from './statsConfig'

// 注册 ECharts 必需模块
use([
  CanvasRenderer,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
])

/**
 * 组件 props 类型
 */
interface Props {
  /** 第一个对比英雄 */
  hero1: Hero
  /** 第二个对比英雄 */
  hero2: Hero
}

const props = defineProps<Props>()

/**
 * 雷达图各指标定义（统一上限便于直观对比）
 */
const indicator = computed(() =>
  STAT_KEYS.map((key: StatKey) => ({
    name: STAT_LABELS[key],
    max: STAT_MAX[key]
  }))
)

/**
 * 将英雄属性转换为雷达图数值数组
 * @param stats - 英雄六维属性
 * @returns 与 indicator 顺序对应的数值数组
 */
const toRadarValues = (stats: HeroStats): number[] => {
  return STAT_KEYS.map((key: StatKey) => stats[key])
}

/**
 * ECharts 配置
 */
const chartOption = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(26, 39, 68, 0.95)',
    borderColor: '#785A28',
    textStyle: { color: '#F0E6D2' }
  },
  legend: {
    data: [props.hero1.name, props.hero2.name],
    top: 10,
    textStyle: { color: '#F0E6D2', fontSize: 14 }
  },
  radar: {
    indicator: indicator.value,
    center: ['50%', '55%'],
    radius: '65%',
    splitNumber: 5,
    axisName: {
      color: '#C8AA6E',
      fontSize: 13,
      fontWeight: 'bold'
    },
    splitLine: {
      lineStyle: { color: 'rgba(120, 90, 40, 0.5)' }
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(26, 39, 68, 0.3)', 'rgba(36, 59, 92, 0.3)']
      }
    },
    axisLine: {
      lineStyle: { color: 'rgba(120, 90, 40, 0.6)' }
    }
  },
  series: [
    {
      type: 'radar',
      emphasis: { focus: 'self' },
      data: [
        {
          value: toRadarValues(props.hero1.stats),
          name: props.hero1.name,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#0BC4E2', width: 2 },
          itemStyle: { color: '#0BC4E2' },
          areaStyle: { color: 'rgba(11, 196, 226, 0.25)' }
        },
        {
          value: toRadarValues(props.hero2.stats),
          name: props.hero2.name,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#E84057', width: 2 },
          itemStyle: { color: '#E84057' },
          areaStyle: { color: 'rgba(232, 64, 87, 0.25)' }
        }
      ]
    }
  ]
}))

// 防止 ECharts 内部对象被深度响应式化
const chartRef = shallowRef<InstanceType<typeof VChart> | null>(null)
</script>

<template>
  <div class="compare-radar">
    <VChart
      ref="chartRef"
      class="chart"
      :option="chartOption"
      autoresize
    />
  </div>
</template>

<style lang="scss" scoped>
.compare-radar {
  width: 100%;
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
}

.chart {
  width: 100%;
  height: 480px;

  @media (max-width: $breakpoint-sm) {
    height: 360px;
  }
}
</style>
