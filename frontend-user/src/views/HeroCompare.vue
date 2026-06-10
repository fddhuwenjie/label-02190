<script setup lang="ts">
/**
 * HeroCompare - 英雄对比页面容器
 * 通过路由 query 参数 hero1、hero2 接收两个英雄 ID，
 * 渲染选择器、雷达图与属性对比表格。
 *
 * 路由示例：/compare?hero1=1&hero2=2
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { heroes, getHeroById } from '@/data/heroes'
import type { Hero } from '@/types'
import CompareRadar from '@/components/compare/CompareRadar.vue'
import CompareTable from '@/components/compare/CompareTable.vue'

const route = useRoute()
const router = useRouter()

/**
 * 解析路由 query 中的英雄 ID
 * @param raw - 原始 query 值（可能是字符串、数组或 undefined）
 * @returns 数字形式的英雄 ID，无效时返回 null
 */
const parseHeroId = (raw: unknown): number | null => {
  const str = Array.isArray(raw) ? raw[0] : raw
  if (typeof str !== 'string' && typeof str !== 'number') return null
  const id = Number(str)
  return Number.isFinite(id) && id > 0 ? id : null
}

/**
 * 当前选中的两个英雄 ID
 * 默认从路由 query 读取，若不存在则使用前两个英雄作为默认值
 */
const selectedId1 = ref<number | null>(
  parseHeroId(route.query.hero1) ?? heroes[0]?.id ?? null
)
const selectedId2 = ref<number | null>(
  parseHeroId(route.query.hero2) ?? heroes[1]?.id ?? null
)

/**
 * 根据 ID 计算英雄对象
 */
const hero1 = computed<Hero | undefined>(() =>
  selectedId1.value !== null ? getHeroById(selectedId1.value) : undefined
)
const hero2 = computed<Hero | undefined>(() =>
  selectedId2.value !== null ? getHeroById(selectedId2.value) : undefined
)

/**
 * 是否两个英雄都已成功选择
 */
const canCompare = computed<boolean>(
  () => !!hero1.value && !!hero2.value && hero1.value.id !== hero2.value.id
)

/**
 * 同步当前选择到 URL query，便于分享与刷新
 */
const syncQuery = (): void => {
  if (selectedId1.value === null || selectedId2.value === null) return
  const currentH1 = parseHeroId(route.query.hero1)
  const currentH2 = parseHeroId(route.query.hero2)
  if (
    currentH1 === selectedId1.value &&
    currentH2 === selectedId2.value
  ) {
    return
  }
  router.replace({
    name: 'compare',
    query: {
      hero1: String(selectedId1.value),
      hero2: String(selectedId2.value)
    }
  })
}

// 监听选择变化同步到 URL
watch([selectedId1, selectedId2], syncQuery)

// 监听 URL 变化反向同步本地状态（如浏览器前进/后退）
watch(
  () => [route.query.hero1, route.query.hero2],
  ([q1, q2]) => {
    const id1 = parseHeroId(q1)
    const id2 = parseHeroId(q2)
    if (id1 !== null && id1 !== selectedId1.value) selectedId1.value = id1
    if (id2 !== null && id2 !== selectedId2.value) selectedId2.value = id2
  }
)

/**
 * 一键交换两个英雄
 */
const swapHeroes = (): void => {
  const tmp = selectedId1.value
  selectedId1.value = selectedId2.value
  selectedId2.value = tmp
}
</script>

<template>
  <div class="hero-compare">
    <div class="page-header">
      <h1 class="page-title">英雄对比</h1>
      <p class="page-subtitle">选择两位英雄，查看六维属性差异</p>
    </div>

    <!-- 英雄选择器 -->
    <div class="selector-bar">
      <div class="selector-item">
        <label class="selector-label">英雄一</label>
        <select v-model.number="selectedId1" class="selector">
          <option
            v-for="hero in heroes"
            :key="`h1-${hero.id}`"
            :value="hero.id"
            :disabled="hero.id === selectedId2"
          >
            {{ hero.name }} · {{ hero.title }}
          </option>
        </select>
      </div>

      <button class="swap-button" type="button" @click="swapHeroes">
        ⇄ 交换
      </button>

      <div class="selector-item">
        <label class="selector-label">英雄二</label>
        <select v-model.number="selectedId2" class="selector">
          <option
            v-for="hero in heroes"
            :key="`h2-${hero.id}`"
            :value="hero.id"
            :disabled="hero.id === selectedId1"
          >
            {{ hero.name }} · {{ hero.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- 英雄信息卡片 -->
    <div v-if="hero1 && hero2" class="hero-info-row">
      <div class="hero-info hero-info--left">
        <img :src="hero1.avatar" :alt="hero1.name" class="hero-avatar" />
        <div class="hero-meta">
          <div class="hero-name">{{ hero1.name }}</div>
          <div class="hero-title">{{ hero1.title }}</div>
        </div>
      </div>
      <div class="vs-tag">VS</div>
      <div class="hero-info hero-info--right">
        <img :src="hero2.avatar" :alt="hero2.name" class="hero-avatar" />
        <div class="hero-meta">
          <div class="hero-name">{{ hero2.name }}</div>
          <div class="hero-title">{{ hero2.title }}</div>
        </div>
      </div>
    </div>

    <!-- 对比内容 -->
    <template v-if="canCompare && hero1 && hero2">
      <CompareRadar :hero1="hero1" :hero2="hero2" class="block" />
      <CompareTable :hero1="hero1" :hero2="hero2" class="block" />
    </template>

    <div v-else class="empty-tip">
      请选择两位不同的英雄进行对比。
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero-compare {
  min-height: 100vh;
  padding: $spacing-md;
  background-color: $color-bg-dark;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: $spacing-lg;
}

.page-title {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $color-primary;
  margin: 0 0 $spacing-xs 0;
}

.page-subtitle {
  font-size: $font-size-md;
  color: $color-text-secondary;
  margin: 0;
}

.selector-bar {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: $spacing-md;
  flex-wrap: wrap;
  margin-bottom: $spacing-md;
}

.selector-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  min-width: 220px;
}

.selector-label {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.selector {
  padding: $spacing-xs $spacing-sm;
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-md;
  color: $color-text-primary;
  font-size: $font-size-md;
  outline: none;
  transition: border-color $transition-fast;

  &:hover,
  &:focus {
    border-color: $color-primary;
  }
}

.swap-button {
  padding: $spacing-xs $spacing-sm;
  background-color: transparent;
  border: 1px solid $color-primary;
  color: $color-primary;
  border-radius: $border-radius-md;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  transition: all $transition-fast;

  &:hover {
    background-color: rgba($color-primary, 0.15);
  }
}

.hero-info-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  flex-wrap: wrap;
}

.hero-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-sm $spacing-md;
  min-width: 240px;

  &--right {
    flex-direction: row-reverse;
    text-align: right;
  }
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid $color-primary;
}

.hero-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
}

.hero-title {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.vs-tag {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-primary;
  letter-spacing: 2px;
}

.block {
  margin-bottom: $spacing-md;
}

.empty-tip {
  margin-top: $spacing-lg;
  padding: $spacing-lg;
  text-align: center;
  color: $color-text-secondary;
  background-color: $color-bg-card;
  border: 1px dashed $color-border-light;
  border-radius: $border-radius-lg;
}

@media (max-width: $breakpoint-md) {
  .selector-item {
    min-width: 180px;
  }
}
</style>
