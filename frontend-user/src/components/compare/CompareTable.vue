<script setup lang="ts">
/**
 * CompareTable - 英雄属性对比表格组件
 * 以表格形式列出两项英雄的每项属性具体数值和差值
 * 正值标绿（英雄1更高），负值标红（英雄2更高）
 * 
 * Props:
 * - hero1: 第一个英雄数据
 * - hero2: 第二个英雄数据
 */
import { computed } from 'vue'
import type { Hero, HeroStats } from '@/types'

interface CompareTableProps {
  hero1: Hero
  hero2: Hero
}

const props = defineProps<CompareTableProps>()

/**
 * 属性项配置接口
 */
interface StatItem {
  key: keyof HeroStats
  label: string
  unit: string
}

/**
 * 六维属性配置列表
 */
const statItems: StatItem[] = [
  { key: 'maxHp', label: '最大生命', unit: '' },
  { key: 'attack', label: '物理攻击', unit: '' },
  { key: 'defense', label: '物理防御', unit: '' },
  { key: 'magic', label: '法术强度', unit: '' },
  { key: 'moveSpeed', label: '移动速度', unit: '' },
  { key: 'attackSpeed', label: '攻击速度', unit: '%' }
]

/**
 * 计算属性差值（英雄1 - 英雄2）
 * @param key - 属性键名
 * @returns 差值数值
 */
const getDiff = (key: keyof HeroStats): number => {
  return props.hero1.stats[key] - props.hero2.stats[key]
}

/**
 * 获取差值的显示样式类
 * @param diff - 差值
 * @returns CSS 类名
 */
const getDiffClass = (diff: number): string => {
  if (diff > 0) return 'diff-positive'
  if (diff < 0) return 'diff-negative'
  return 'diff-zero'
}

/**
 * 格式化差值显示（带正负号）
 * @param diff - 差值
 * @param unit - 单位
 * @returns 格式化后的差值字符串
 */
const formatDiff = (diff: number, unit: string): string => {
  if (diff > 0) return `+${diff}${unit}`
  if (diff < 0) return `${diff}${unit}`
  return `0${unit}`
}

/**
 * 计算英雄1的优势项数量
 */
const hero1AdvantageCount = computed(() => {
  return statItems.filter(item => props.hero1.stats[item.key] > props.hero2.stats[item.key]).length
})

/**
 * 计算英雄2的优势项数量
 */
const hero2AdvantageCount = computed(() => {
  return statItems.filter(item => props.hero2.stats[item.key] > props.hero1.stats[item.key]).length
})
</script>

<template>
  <div class="compare-table">
    <h3 class="compare-table__title">属性详细对比</h3>
    
    <!-- 优势统计 -->
    <div class="compare-table__summary">
      <div class="summary-item hero1">
        <span class="summary-label">{{ hero1.name }}</span>
        <span class="summary-value">{{ hero1AdvantageCount }} 项占优</span>
      </div>
      <div class="summary-item vs">VS</div>
      <div class="summary-item hero2">
        <span class="summary-label">{{ hero2.name }}</span>
        <span class="summary-value">{{ hero2AdvantageCount }} 项占优</span>
      </div>
    </div>

    <!-- 属性对比表格 -->
    <table class="compare-table__content">
      <thead>
        <tr>
          <th class="col-stat">属性</th>
          <th class="col-hero hero1-col">
            <span class="hero-name">{{ hero1.name }}</span>
          </th>
          <th class="col-hero hero2-col">
            <span class="hero-name">{{ hero2.name }}</span>
          </th>
          <th class="col-diff">差值</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in statItems" :key="item.key" class="stat-row">
          <td class="stat-label">{{ item.label }}</td>
          <td class="stat-value hero1-value">
            {{ hero1.stats[item.key] }}{{ item.unit }}
          </td>
          <td class="stat-value hero2-value">
            {{ hero2.stats[item.key] }}{{ item.unit }}
          </td>
          <td class="stat-diff" :class="getDiffClass(getDiff(item.key))">
            {{ formatDiff(getDiff(item.key), item.unit) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.compare-table {
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;

  &__title {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    text-align: center;
  }

  &__summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    margin-bottom: $spacing-md;
    padding: $spacing-sm;
    background-color: rgba($color-primary, 0.05);
    border-radius: $border-radius-md;

    .summary-item {
      text-align: center;

      &.hero1 {
        .summary-label {
          color: #0BC4E2;
        }
      }

      &.hero2 {
        .summary-label {
          color: #E84057;
        }
      }

      &.vs {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $color-primary;
      }
    }

    .summary-label {
      display: block;
      font-size: $font-size-md;
      font-weight: $font-weight-bold;
      margin-bottom: 4px;
    }

    .summary-value {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }

  &__content {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: $spacing-sm $spacing-md;
      text-align: center;
      border-bottom: 1px solid $color-border-light;
    }

    thead {
      th {
        font-size: $font-size-sm;
        font-weight: $font-weight-bold;
        color: $color-text-secondary;
        background-color: rgba($color-bg-dark, 0.5);

        &.hero1-col .hero-name {
          color: #0BC4E2;
        }

        &.hero2-col .hero-name {
          color: #E84057;
        }
      }
    }

    tbody {
      .stat-row {
        transition: background-color $transition-fast;

        &:hover {
          background-color: $color-bg-hover;
        }

        &:last-child td {
          border-bottom: none;
        }
      }

      .stat-label {
        text-align: left;
        color: $color-text-primary;
        font-weight: $font-weight-medium;
      }

      .stat-value {
        font-size: $font-size-md;
        color: $color-text-primary;
        font-weight: $font-weight-medium;

        &.hero1-value {
          color: #0BC4E2;
        }

        &.hero2-value {
          color: #E84057;
        }
      }

      .stat-diff {
        font-weight: $font-weight-bold;
        font-size: $font-size-md;

        &.diff-positive {
          color: $color-success;
        }

        &.diff-negative {
          color: $color-error;
        }

        &.diff-zero {
          color: $color-text-muted;
        }
      }
    }
  }
}
</style>
