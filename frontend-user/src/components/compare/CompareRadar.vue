<script setup lang="ts">
/**
 * CompareRadar - 英雄属性对比雷达图组件
 * @component CompareRadar
 * @description 使用 ECharts 雷达图直观展示两个英雄的六维属性差异
 * @requires echarts, vue-echarts
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { Hero, HeroStats } from '@/types'
import type { EChartsOption } from 'echarts'

use([
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

/**
 * 六维属性键名与中文标签映射
 * @constant
 */
const STAT_LABELS: Record<keyof HeroStats, string> = {
  maxHp: '最大生命',
  attack: '物理攻击',
  defense: '物理防御',
  magic: '法术强度',
  moveSpeed: '移动速度',
  attackSpeed: '攻击速度'
}

/**
 * 六维属性归一化最大值（用于雷达图0-100刻度）
 * 基于所有英雄的属性上限设定
 * @constant
 */
const STAT_MAX: Record<keyof HeroStats, number> = {
  maxHp: 9000,
  attack: 450,
  defense: 220,
  magic: 550,
  moveSpeed: 450,
  attackSpeed: 130
}

/**
 * 组件属性定义
 * @interface Props
 */
interface Props {
  /** 第一个英雄（左侧/蓝色） */
  hero1: Hero | null
  /** 第二个英雄（右侧/橙色） */
  hero2: Hero | null
}

const props = defineProps<Props>()

/**
 * 将英雄原始属性值归一化为0-100的雷达图数值
 * @param {HeroStats} stats - 英雄属性对象
 * @returns {number[]} 归一化后的属性值数组
 */
const normalizeStats = (stats: HeroStats): number[] => {
  const keys: (keyof HeroStats)[] = ['maxHp', 'attack', 'defense', 'magic', 'moveSpeed', 'attackSpeed']
  return keys.map(key => {
    const raw = stats[key]
    const max = STAT_MAX[key]
    return Math.round((raw / max) * 100)
  })
}

/**
 * 雷达图配置项
 * 响应式计算属性，根据传入英雄动态更新图表
 */
const radarOption = computed<EChartsOption>(() => {
  const indicator = (Object.keys(STAT_LABELS) as (keyof HeroStats)[]).map(key => ({
    name: STAT_LABELS[key],
    max: 100
  }))

  const radarData = []
  if (props.hero1) {
    radarData.push({
      value: normalizeStats(props.hero1.stats),
      name: props.hero1.name,
      areaStyle: { color: 'rgba(78, 145, 255, 0.3)' },
      lineStyle: { color: '#4E91FF', width: 2 },
      itemStyle: { color: '#4E91FF' }
    })
  }
  if (props.hero2) {
    radarData.push({
      value: normalizeStats(props.hero2.stats),
      name: props.hero2.name,
      areaStyle: { color: 'rgba(255, 149, 64, 0.3)' },
      lineStyle: { color: '#FF9540', width: 2 },
      itemStyle: { color: '#FF9540' }
    })
  }

  const seriesData = [{
    type: 'radar' as const,
    data: radarData
  }]

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(26, 39, 68, 0.95)',
      borderColor: '#C8AA6E',
      borderWidth: 1,
      textStyle: {
        color: '#F0E6D2'
      }
    },
    legend: {
      data: [
        props.hero1?.name ?? '',
        props.hero2?.name ?? ''
      ].filter(Boolean),
      bottom: 10,
      textStyle: {
        color: '#A09B8C',
        fontSize: 14
      },
      itemWidth: 16,
      itemHeight: 10
    },
    radar: {
      indicator,
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#C8AA6E',
        fontSize: 13,
        fontWeight: 500
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(200, 170, 110, 0.2)'
        }
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(200, 170, 110, 0.05)',
            'rgba(200, 170, 110, 0.1)'
          ]
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(200, 170, 110, 0.3)'
        }
      }
    },
    series: seriesData
  }
})
</script>

<template>
  <div class="compare-radar">
    <h3 class="radar-title">属性雷达图</h3>
    <div class="radar-chart-wrapper">
      <VChart
        v-if="hero1 && hero2"
        class="radar-chart"
        :option="radarOption"
        autoresize
      />
      <div v-else class="radar-placeholder">
        <p>请选择两位英雄进行对比</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.compare-radar {
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
}

.radar-title {
  text-align: center;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-primary;
  margin: 0 0 $spacing-md 0;
}

.radar-chart-wrapper {
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-chart {
  width: 100%;
  height: 450px;
}

.radar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: $color-text-secondary;
  font-size: $font-size-md;
}

@media (max-width: $breakpoint-md) {
  .radar-chart {
    height: 350px;
  }
}
</style>
