<script setup lang="ts">
/**
 * CompareTable - 英雄属性对比表格组件
 * @component CompareTable
 * @description 以表格形式列出两位英雄每项属性的具体数值和差值
 *              正值（hero2 > hero1）标绿，负值（hero2 < hero1）标红
 */
import { computed } from 'vue'
import type { Hero, HeroStats } from '@/types'

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
 * 属性顺序定义（表格行的显示顺序）
 * @constant
 */
const STAT_ORDER: (keyof HeroStats)[] = [
  'maxHp', 'attack', 'defense', 'magic', 'moveSpeed', 'attackSpeed'
]

/**
 * 组件属性定义
 * @interface Props
 */
interface Props {
  /** 第一个英雄（左侧/基准） */
  hero1: Hero | null
  /** 第二个英雄（右侧/对比） */
  hero2: Hero | null
}

const props = defineProps<Props>()

/**
 * 对比行数据接口
 * @interface CompareRow
 */
interface CompareRow {
  /** 属性键名 */
  key: keyof HeroStats
  /** 属性中文标签 */
  label: string
  /** 英雄1属性值 */
  value1: number
  /** 英雄2属性值 */
  value2: number
  /** 差值（value2 - value1） */
  diff: number
  /** 差值是否为正 */
  isPositive: boolean
  /** 差值是否为负 */
  isNegative: boolean
}

/**
 * 计算对比表格数据行
 * @returns {CompareRow[]} 格式化后的对比数据行数组
 */
const compareRows = computed<CompareRow[]>(() => {
  if (!props.hero1 || !props.hero2) return []

  return STAT_ORDER.map(key => {
    const value1 = props.hero1!.stats[key]
    const value2 = props.hero2!.stats[key]
    const diff = value2 - value1

    return {
      key,
      label: STAT_LABELS[key],
      value1,
      value2,
      diff,
      isPositive: diff > 0,
      isNegative: diff < 0
    }
  })
})

/**
 * 格式化属性数值显示
 * @param {keyof HeroStats} key - 属性键名
 * @param {number} value - 属性原始值
 * @returns {string} 格式化后的数值字符串
 */
const formatValue = (key: keyof HeroStats, value: number): string => {
  if (key === 'attackSpeed') {
    return `${value}%`
  }
  return value.toLocaleString()
}

/**
 * 格式化差值显示
 * @param {number} diff - 差值（value2 - value1）
 * @param {keyof HeroStats} key - 属性键名
 * @returns {string} 格式化后的差值字符串，带正负号
 */
const formatDiff = (diff: number, key: keyof HeroStats): string => {
  if (diff === 0) return '-'
  const sign = diff > 0 ? '+' : ''
  const suffix = key === 'attackSpeed' ? '%' : ''
  return `${sign}${diff.toLocaleString()}${suffix}`
}
</script>

<template>
  <div class="compare-table">
    <h3 class="table-title">属性详细对比</h3>

    <div v-if="hero1 && hero2" class="table-wrapper">
      <table class="stats-table">
        <thead>
          <tr>
            <th class="attr-col">属性</th>
            <th class="hero-col">
              <div class="hero-header hero1">
                <img :src="hero1.avatar" :alt="hero1.name" class="hero-avatar" />
                <div class="hero-info">
                  <span class="hero-name">{{ hero1.name }}</span>
                  <span class="hero-title">{{ hero1.title }}</span>
                </div>
              </div>
            </th>
            <th class="diff-col">差值</th>
            <th class="hero-col">
              <div class="hero-header hero2">
                <img :src="hero2.avatar" :alt="hero2.name" class="hero-avatar" />
                <div class="hero-info">
                  <span class="hero-name">{{ hero2.name }}</span>
                  <span class="hero-title">{{ hero2.title }}</span>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in compareRows"
            :key="row.key"
            class="stats-row"
          >
            <td class="attr-name">{{ row.label }}</td>
            <td class="hero-value">{{ formatValue(row.key, row.value1) }}</td>
            <td
              class="diff-value"
              :class="{
                'diff-positive': row.isPositive,
                'diff-negative': row.isNegative
              }"
            >
              {{ formatDiff(row.diff, row.key) }}
            </td>
            <td class="hero-value">{{ formatValue(row.key, row.value2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="table-placeholder">
      <p>请选择两位英雄查看详细属性对比</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.compare-table {
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
}

.table-title {
  text-align: center;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-primary;
  margin: 0 0 $spacing-md 0;
}

.table-wrapper {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th, td {
    padding: $spacing-sm;
    text-align: center;
    border-bottom: 1px solid $color-border-light;
  }

  thead {
    th {
      background-color: rgba($color-primary, 0.08);
      font-weight: $font-weight-medium;
      color: $color-text-primary;

      &:first-child {
        border-radius: $border-radius-md 0 0 0;
      }

      &:last-child {
        border-radius: 0 $border-radius-md 0 0;
      }
    }
  }

  tbody {
    tr {
      transition: background-color $transition-fast;

      &:hover {
        background-color: rgba($color-primary, 0.05);
      }

      &:last-child {
        td {
          border-bottom: none;
        }
      }
    }
  }
}

.attr-col {
  width: 120px;
  text-align: left !important;
}

.hero-col {
  min-width: 180px;
}

.diff-col {
  width: 100px;
  font-weight: $font-weight-bold;
}

.attr-name {
  text-align: left !important;
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  justify-content: center;

  &.hero1 .hero-avatar {
    border-color: #4E91FF;
  }

  &.hero2 .hero-avatar {
    border-color: #FF9540;
  }
}

.hero-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid;
  object-fit: cover;
}

.hero-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.hero-name {
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
}

.hero-title {
  font-size: $font-size-xs;
  color: $color-text-secondary;
}

.hero-value {
  color: $color-text-primary;
  font-size: $font-size-md;
  font-variant-numeric: tabular-nums;
}

.diff-value {
  font-size: $font-size-md;
  color: $color-text-secondary;
  font-variant-numeric: tabular-nums;

  &.diff-positive {
    color: #4ADE80;
  }

  &.diff-negative {
    color: #F87171;
  }
}

.table-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: $color-text-secondary;
  font-size: $font-size-md;
}

@media (max-width: $breakpoint-md) {
  .hero-info {
    display: none;
  }

  .hero-avatar {
    width: 36px;
    height: 36px;
  }

  .attr-col {
    width: 80px;
  }

  .diff-col {
    width: 80px;
  }

  .hero-value,
  .diff-value {
    font-size: $font-size-sm;
  }
}
</style>
