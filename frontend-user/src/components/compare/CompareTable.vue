<script setup lang="ts">
/**
 * CompareTable - 英雄属性对比表格
 * 列出每项属性的具体数值与差值（hero1 - hero2）
 * 正值标绿、负值标红
 */
import { computed } from 'vue'
import type { Hero } from '@/types'
import {
  STAT_KEYS,
  STAT_LABELS,
  STAT_UNITS,
  type StatKey
} from './statsConfig'

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
 * 单行对比数据
 */
interface CompareRow {
  /** 属性键 */
  key: StatKey
  /** 属性中文标签 */
  label: string
  /** 单位 */
  unit: string
  /** 第一个英雄的数值 */
  value1: number
  /** 第二个英雄的数值 */
  value2: number
  /** hero1 - hero2 的差值 */
  diff: number
}

/**
 * 计算所有属性的对比行
 */
const rows = computed<CompareRow[]>(() =>
  STAT_KEYS.map((key: StatKey) => {
    const value1 = props.hero1.stats[key]
    const value2 = props.hero2.stats[key]
    return {
      key,
      label: STAT_LABELS[key],
      unit: STAT_UNITS[key],
      value1,
      value2,
      diff: value1 - value2
    }
  })
)

/**
 * 根据差值返回带正负号的字符串
 * @param diff - 差值
 * @returns 格式化字符串，如 "+100"、"-50"、"0"
 */
const formatDiff = (diff: number): string => {
  if (diff > 0) return `+${diff}`
  return `${diff}`
}
</script>

<template>
  <div class="compare-table">
    <table>
      <thead>
        <tr>
          <th class="col-attr">属性</th>
          <th class="col-hero">{{ hero1.name }}</th>
          <th class="col-hero">{{ hero2.name }}</th>
          <th class="col-diff">差值（{{ hero1.name }} - {{ hero2.name }}）</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td class="col-attr">{{ row.label }}</td>
          <td class="col-hero">{{ row.value1 }}{{ row.unit }}</td>
          <td class="col-hero">{{ row.value2 }}{{ row.unit }}</td>
          <td
            class="col-diff"
            :class="{
              positive: row.diff > 0,
              negative: row.diff < 0,
              zero: row.diff === 0
            }"
          >
            {{ formatDiff(row.diff) }}{{ row.unit }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.compare-table {
  width: 100%;
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    color: $color-text-primary;
  }

  th,
  td {
    padding: $spacing-sm;
    text-align: center;
    border-bottom: 1px solid rgba($color-border-light, 0.6);
    font-size: $font-size-md;
  }

  th {
    background-color: rgba($color-primary, 0.1);
    color: $color-primary;
    font-weight: $font-weight-bold;
  }

  tbody tr:hover {
    background-color: rgba($color-primary, 0.05);
  }

  .col-attr {
    color: $color-text-secondary;
    font-weight: $font-weight-medium;
  }

  .col-diff {
    font-weight: $font-weight-bold;

    &.positive {
      color: $color-success;
    }

    &.negative {
      color: $color-error;
    }

    &.zero {
      color: $color-text-secondary;
    }
  }
}
</style>
