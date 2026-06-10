<script setup lang="ts">
/**
 * CompareTable - 英雄对比表格组件
 * 以表格形式展示两个英雄的每项属性数值和差值
 * 正值标绿、负值标红
 */
import { computed } from 'vue'
import type { Hero, HeroStatsKey, CompareDiffItem } from '@/types'

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
 * 属性单位映射表
 * 为不同属性提供合适的单位后缀
 */
const STATS_UNIT_MAP: Record<HeroStatsKey, string> = {
  maxHp: '',
  attack: '',
  defense: '',
  magic: '',
  moveSpeed: '',
  attackSpeed: '%'
}

interface Props {
  /** 英雄1数据 */
  hero1: Hero
  /** 英雄2数据 */
  hero2: Hero
}

const props = defineProps<Props>()

/**
 * 对比差值数据列表
 * 计算两个英雄在每项属性上的具体数值和差值
 */
const diffItems = computed<CompareDiffItem[]>(() => {
  const keys: HeroStatsKey[] = ['maxHp', 'attack', 'defense', 'magic', 'moveSpeed', 'attackSpeed']
  return keys.map(key => ({
    key,
    label: STATS_LABEL_MAP[key],
    hero1Value: props.hero1.stats[key],
    hero2Value: props.hero2.stats[key],
    diff: props.hero1.stats[key] - props.hero2.stats[key]
  }))
})

/**
 * 获取差值的 CSS 类名
 * 正值返回绿色类名，负值返回红色类名，零值返回中性类名
 * @param diff - 属性差值
 * @returns 对应的 CSS 类名字符串
 */
const getDiffClass = (diff: number): string => {
  if (diff > 0) return 'diff-positive'
  if (diff < 0) return 'diff-negative'
  return 'diff-neutral'
}

/**
 * 格式化差值显示文本
 * 正值前添加 "+" 前缀，零值显示 "-"
 * @param diff - 属性差值
 * @returns 格式化后的差值文本
 */
const formatDiff = (diff: number): string => {
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return '-'
}

/**
 * 格式化属性值显示文本
 * 根据属性类型添加单位后缀
 * @param key - 属性键名
 * @param value - 属性值
 * @returns 格式化后的属性值文本
 */
const formatValue = (key: HeroStatsKey, value: number): string => {
  return `${value}${STATS_UNIT_MAP[key]}`
}
</script>

<template>
  <div class="compare-table">
    <table class="stats-table">
      <thead>
        <tr>
          <th class="col-label">属性</th>
          <th class="col-hero">
            <div class="hero-header">
              <img
                v-if="hero1.avatar"
                :src="hero1.avatar"
                :alt="hero1.name"
                class="hero-avatar"
              />
              <span>{{ hero1.name }}</span>
            </div>
          </th>
          <th class="col-hero">
            <div class="hero-header">
              <img
                v-if="hero2.avatar"
                :src="hero2.avatar"
                :alt="hero2.name"
                class="hero-avatar"
              />
              <span>{{ hero2.name }}</span>
            </div>
          </th>
          <th class="col-diff">差值</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in diffItems"
          :key="item.key"
        >
          <td class="col-label">{{ item.label }}</td>
          <td class="col-hero">{{ formatValue(item.key, item.hero1Value) }}</td>
          <td class="col-hero">{{ formatValue(item.key, item.hero2Value) }}</td>
          <td class="col-diff" :class="getDiffClass(item.diff)">
            {{ formatDiff(item.diff) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.compare-table {
  @include card-style;
  padding: $spacing-md;
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th, td {
    padding: $spacing-sm $spacing-md;
    text-align: center;
    border-bottom: 1px solid $color-border-light;
  }

  th {
    color: $color-primary;
    font-weight: $font-weight-bold;
    font-size: $font-size-base;
    background-color: rgba($color-primary, 0.05);
    position: sticky;
    top: 0;
  }

  tbody tr {
    transition: background-color $transition-fast;

    &:hover {
      background-color: $color-bg-hover;
    }

    &:last-child td {
      border-bottom: none;
    }
  }
}

.col-label {
  text-align: left;
  color: $color-text-secondary;
  font-weight: $font-weight-medium;
  width: 20%;
}

.col-hero {
  color: $color-text-primary;
  font-weight: $font-weight-medium;
  width: 30%;
}

.col-diff {
  font-weight: $font-weight-bold;
  width: 20%;
}

.diff-positive {
  color: $color-success;
}

.diff-negative {
  color: $color-error;
}

.diff-neutral {
  color: $color-text-muted;
}

.hero-header {
  @include flex-center;
  gap: $spacing-xs;
}

.hero-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid $color-border;
  object-fit: cover;
}

@media (max-width: $breakpoint-md) {
  .stats-table {
    font-size: $font-size-xs;

    th, td {
      padding: $spacing-xs $spacing-sm;
    }
  }

  .hero-avatar {
    width: 22px;
    height: 22px;
  }
}
</style>
