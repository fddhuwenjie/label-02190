<script setup lang="ts">
/**
 * CompareRadar - 英雄对比雷达图组件
 * 使用 ECharts 雷达图展示两个英雄的六维属性对比
 * 
 * Props:
 * - hero1: 第一个英雄数据
 * - hero2: 第二个英雄数据
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
import type { Hero } from '@/types'

use([
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

interface CompareRadarProps {
  hero1: Hero
  hero2: Hero
}

const props = defineProps<CompareRadarProps>()

/**
 * 雷达图指示器配置
 * 包含六维属性的名称和最大值
 */
const radarIndicator = computed(() => [
  { name: '最大生命', max: 10000 },
  { name: '物理攻击', max: 500 },
  { name: '物理防御', max: 300 },
  { name: '法术强度', max: 500 },
  { name: '移动速度', max: 450 },
  { name: '攻击速度', max: 50 }
])

/**
 * 将英雄属性转换为雷达图数据数组
 * @param hero - 英雄数据
 * @returns 属性值数组，顺序与指示器对应
 */
const getStatsValues = (hero: Hero): number[] => {
  return [
    hero.stats.maxHp,
    hero.stats.attack,
    hero.stats.defense,
    hero.stats.magic,
    hero.stats.moveSpeed,
    hero.stats.attackSpeed
  ]
}

/**
 * ECharts 雷达图配置项
 */
const chartOption = computed(() => ({
  title: {
    text: '属性对比雷达图',
    left: 'center',
    textStyle: {
      color: '#F0E6D2',
      fontSize: 18,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(26, 39, 68, 0.95)',
    borderColor: '#785A28',
    borderWidth: 1,
    textStyle: {
      color: '#F0E6D2'
    }
  },
  legend: {
    data: [props.hero1.name, props.hero2.name],
    bottom: 10,
    textStyle: {
      color: '#A09B8C'
    }
  },
  radar: {
    indicator: radarIndicator.value,
    shape: 'polygon',
    splitNumber: 5,
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
      show: true,
      areaStyle: {
        color: [
          'rgba(200, 170, 110, 0.02)',
          'rgba(200, 170, 110, 0.05)'
        ]
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
          value: getStatsValues(props.hero1),
          name: props.hero1.name,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#0BC4E2',
            width: 2
          },
          areaStyle: {
            color: 'rgba(11, 196, 226, 0.2)'
          },
          itemStyle: {
            color: '#0BC4E2'
          }
        },
        {
          value: getStatsValues(props.hero2),
          name: props.hero2.name,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#E84057',
            width: 2
          },
          areaStyle: {
            color: 'rgba(232, 64, 87, 0.2)'
          },
          itemStyle: {
            color: '#E84057'
          }
        }
      ]
    }
  ]
}))
</script>

<template>
  <div class="compare-radar">
    <v-chart class="compare-radar__chart" :option="chartOption" autoresize />
  </div>
</template>

<style lang="scss" scoped>
.compare-radar {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;

  &__chart {
    width: 100%;
    height: 400px;
  }
}
</style>
