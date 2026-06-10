<script setup lang="ts">
/**
 * CompareRadar - 英雄对比雷达图组件
 * 使用 ECharts 雷达图展示两个英雄的六维属性对比
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { Hero, HeroStatsKey } from '@/types'
import type { ComposeOption } from 'echarts/core'
import type { RadarSeriesOption } from 'echarts/charts'
import type { TitleComponentOption, TooltipComponentOption, LegendComponentOption } from 'echarts/components'

type EChartsOption = ComposeOption<
  RadarSeriesOption | TitleComponentOption | TooltipComponentOption | LegendComponentOption
>

use([RadarChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer])

/**
 * 属性标签映射表
 * 将 HeroStats 的键名映射为中文显示标签
 */
const STATS_LABEL_MAP: Record<HeroStatsKey, string> = {
  maxHp: '最大生命',
  attack: '物理攻击',
  defense: '物理防御',
  magic: '法术攻击',
  moveSpeed: '移动速度',
  attackSpeed: '攻击速度'
}

/**
 * 属性最大值映射表
 * 用于雷达图的指示器范围设定，基于所有英雄数据中的合理上限
 */
const STATS_MAX_MAP: Record<HeroStatsKey, number> = {
  maxHp: 8000,
  attack: 300,
  defense: 350,
  magic: 350,
  moveSpeed: 420,
  attackSpeed: 180
}

interface Props {
  /** 英雄1数据 */
  hero1: Hero
  /** 英雄2数据 */
  hero2: Hero
}

const props = defineProps<Props>()

/**
 * 雷达图指示器配置
 * 基于六维属性生成 ECharts radar indicator 数组
 */
const radarIndicators = computed(() => {
  const keys: HeroStatsKey[] = ['maxHp', 'attack', 'defense', 'magic', 'moveSpeed', 'attackSpeed']
  return keys.map(key => ({
    name: STATS_LABEL_MAP[key],
    max: STATS_MAX_MAP[key]
  }))
})

/**
 * ECharts 完整配置项
 * 包含雷达图的双英雄数据系列、样式和交互配置
 */
const chartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(26, 39, 68, 0.9)',
    borderColor: '#785A28',
    textStyle: {
      color: '#F0E6D2'
    }
  },
  legend: {
    data: [props.hero1.name, props.hero2.name],
    bottom: 10,
    textStyle: {
      color: '#A09B8C',
      fontSize: 14
    },
    itemWidth: 20,
    itemHeight: 10
  },
  radar: {
    indicator: radarIndicators.value,
    shape: 'polygon',
    radius: '65%',
    splitNumber: 4,
    axisName: {
      color: '#A09B8C',
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(120, 90, 40, 0.3)'
      }
    },
    splitArea: {
      areaStyle: {
        color: ['rgba(26, 39, 68, 0.2)', 'rgba(26, 39, 68, 0.4)']
      }
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(120, 90, 40, 0.5)'
      }
    }
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [
            props.hero1.stats.maxHp,
            props.hero1.stats.attack,
            props.hero1.stats.defense,
            props.hero1.stats.magic,
            props.hero1.stats.moveSpeed,
            props.hero1.stats.attackSpeed
          ],
          name: props.hero1.name,
          lineStyle: {
            color: '#C8AA6E',
            width: 2
          },
          areaStyle: {
            color: 'rgba(200, 170, 110, 0.25)'
          },
          itemStyle: {
            color: '#C8AA6E'
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [
            props.hero2.stats.maxHp,
            props.hero2.stats.attack,
            props.hero2.stats.defense,
            props.hero2.stats.magic,
            props.hero2.stats.moveSpeed,
            props.hero2.stats.attackSpeed
          ],
          name: props.hero2.name,
          lineStyle: {
            color: '#0ACF83',
            width: 2
          },
          areaStyle: {
            color: 'rgba(10, 207, 131, 0.25)'
          },
          itemStyle: {
            color: '#0ACF83'
          },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }
  ]
}))
</script>

<template>
  <div class="compare-radar">
    <VChart
      class="radar-chart"
      :option="chartOption"
      autoresize
    />
  </div>
</template>

<style lang="scss" scoped>
.compare-radar {
  @include card-style;
  padding: $spacing-md;
  width: 100%;
}

.radar-chart {
  width: 100%;
  height: 420px;

  @media (max-width: $breakpoint-md) {
    height: 320px;
  }
}
</style>
