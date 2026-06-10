<script setup lang="ts">
/**
 * HeroCompare - 英雄对比页面容器组件
 * 提供英雄选择器，组合雷达图和对比表格子组件
 * 支持通过 URL query 参数传递英雄 ID（如 /compare?hero1=1&hero2=2）
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { heroes } from '@/data/heroes'
import type { Hero } from '@/types'
import CompareRadar from '@/components/compare/CompareRadar.vue'
import CompareTable from '@/components/compare/CompareTable.vue'

const route = useRoute()
const router = useRouter()

/**
 * 选中的英雄1 ID
 */
const selectedHero1Id = ref<number | null>(null)

/**
 * 选中的英雄2 ID
 */
const selectedHero2Id = ref<number | null>(null)

/**
 * 英雄1完整数据
 * 根据选中的英雄1 ID 从英雄列表中查找
 */
const hero1 = computed<Hero | null>(() => {
  if (selectedHero1Id.value === null) return null
  return heroes.find(h => h.id === selectedHero1Id.value) ?? null
})

/**
 * 英雄2完整数据
 * 根据选中的英雄2 ID 从英雄列表中查找
 */
const hero2 = computed<Hero | null>(() => {
  if (selectedHero2Id.value === null) return null
  return heroes.find(h => h.id === selectedHero2Id.value) ?? null
})

/**
 * 是否可以进行对比
 * 两个英雄都已选择且不为同一个英雄
 */
const canCompare = computed<boolean>(() => {
  return hero1.value !== null
    && hero2.value !== null
    && hero1.value.id !== hero2.value.id
})

/**
 * 将当前选择同步到 URL query 参数
 * 便于分享和书签
 */
const syncToQuery = (): void => {
  const query: Record<string, string> = {}
  if (selectedHero1Id.value !== null) {
    query.hero1 = String(selectedHero1Id.value)
  }
  if (selectedHero2Id.value !== null) {
    query.hero2 = String(selectedHero2Id.value)
  }
  router.replace({ path: '/compare', query })
}

/**
 * 从 URL query 参数初始化英雄选择
 * 在组件挂载时读取 hero1 和 hero2 参数
 */
const initFromQuery = (): void => {
  const hero1Param = route.query.hero1
  const hero2Param = route.query.hero2
  if (hero1Param && !isNaN(Number(hero1Param))) {
    const id = Number(hero1Param)
    if (heroes.some(h => h.id === id)) {
      selectedHero1Id.value = id
    }
  }
  if (hero2Param && !isNaN(Number(hero2Param))) {
    const id = Number(hero2Param)
    if (heroes.some(h => h.id === id)) {
      selectedHero2Id.value = id
    }
  }
}

/**
 * 处理英雄1选择变更
 * @param event - 选择事件
 */
const handleHero1Change = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  selectedHero1Id.value = target.value ? Number(target.value) : null
  syncToQuery()
}

/**
 * 处理英雄2选择变更
 * @param event - 选择事件
 */
const handleHero2Change = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  selectedHero2Id.value = target.value ? Number(target.value) : null
  syncToQuery()
}

/**
 * 交换两个英雄的选择
 * 点击交换按钮后互换 hero1 和 hero2
 */
const swapHeroes = (): void => {
  const temp = selectedHero1Id.value
  selectedHero1Id.value = selectedHero2Id.value
  selectedHero2Id.value = temp
  syncToQuery()
}

/**
 * 重置选择
 * 清空两个英雄的选择状态
 */
const resetSelection = (): void => {
  selectedHero1Id.value = null
  selectedHero2Id.value = null
  syncToQuery()
}

/**
 * 获取英雄选择器的占位提示文本
 * @param slot - 选择器槽位（1 或 2）
 * @returns 占位提示文本
 */
const getPlaceholder = (slot: 1 | 2): string => {
  return `选择英雄${slot}`
}

watch(
  () => route.query,
  () => {
    initFromQuery()
  }
)

onMounted(() => {
  initFromQuery()
})
</script>

<template>
  <div class="hero-compare">
    <div class="page-header">
      <h1 class="page-title">英雄对比</h1>
      <p class="page-subtitle">选择两位英雄，对比他们的六维属性</p>
    </div>

    <div class="selector-section">
      <div class="selector-group">
        <label class="selector-label">英雄 1</label>
        <select
          :value="selectedHero1Id ?? ''"
          class="hero-select"
          @change="handleHero1Change"
        >
          <option value="">{{ getPlaceholder(1) }}</option>
          <option
            v-for="hero in heroes"
            :key="hero.id"
            :value="hero.id"
            :disabled="hero.id === selectedHero2Id"
          >
            {{ hero.name }} - {{ hero.title }}
          </option>
        </select>
      </div>

      <button
        class="swap-button"
        :disabled="!canCompare"
        @click="swapHeroes"
        aria-label="交换英雄"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 16l-4-4 4-4"></path>
          <path d="M17 8l4 4-4 4"></path>
          <path d="M3 12h18"></path>
        </svg>
      </button>

      <div class="selector-group">
        <label class="selector-label">英雄 2</label>
        <select
          :value="selectedHero2Id ?? ''"
          class="hero-select"
          @change="handleHero2Change"
        >
          <option value="">{{ getPlaceholder(2) }}</option>
          <option
            v-for="hero in heroes"
            :key="hero.id"
            :value="hero.id"
            :disabled="hero.id === selectedHero1Id"
          >
            {{ hero.name }} - {{ hero.title }}
          </option>
        </select>
      </div>

      <button
        class="reset-button"
        @click="resetSelection"
        aria-label="重置选择"
      >
        重置
      </button>
    </div>

    <div v-if="canCompare && hero1 && hero2" class="compare-content">
      <CompareRadar :hero1="hero1" :hero2="hero2" />
      <CompareTable :hero1="hero1" :hero2="hero2" />
    </div>

    <div v-else class="empty-state">
      <div class="empty-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 3h5v5"></path>
          <path d="M21 3l-7 7"></path>
          <path d="M8 21H3v-5"></path>
          <path d="M3 21l7-7"></path>
        </svg>
      </div>
      <h3 class="empty-state__title">请选择两个不同的英雄</h3>
      <p class="empty-state__description">
        在上方选择器中选择两位英雄，即可查看他们的属性对比
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero-compare {
  min-height: 100vh;
  padding: $spacing-md;
  background-color: $color-bg-dark;
}

.page-header {
  text-align: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md 0;
}

.page-title {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  color: $color-primary;
  margin: 0 0 $spacing-xs 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: $font-size-md;
  color: $color-text-secondary;
  margin: 0;
}

.selector-section {
  @include flex-center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    gap: $spacing-sm;
  }
}

.selector-group {
  @include flex-column;
  gap: $spacing-xs;
  flex: 1;
  min-width: 200px;
}

.selector-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-primary;
}

.hero-select {
  padding: $spacing-sm;
  font-size: $font-size-md;
  color: $color-text-primary;
  background-color: $color-bg-dark;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-normal;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A09B8C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;

  &:hover {
    border-color: $color-primary;
  }

  &:focus {
    border-color: $color-primary;
    box-shadow: 0 0 0 2px rgba($color-primary, 0.2);
    outline: none;
  }

  option {
    background-color: $color-bg-dark;
    color: $color-text-primary;
  }
}

.swap-button {
  @include flex-center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid $color-border;
  color: $color-primary;
  cursor: pointer;
  transition: all $transition-normal;
  flex-shrink: 0;
  margin-top: 20px;

  &:hover:not(:disabled) {
    background-color: rgba($color-primary, 0.1);
    border-color: $color-primary;
    transform: rotate(180deg);
  }

  &:active:not(:disabled) {
    transform: rotate(180deg) scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.reset-button {
  padding: $spacing-xs $spacing-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-text-secondary;
  background-color: transparent;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;
  margin-top: 20px;
  flex-shrink: 0;

  &:hover {
    color: $color-primary;
    border-color: $color-primary;
    background-color: rgba($color-primary, 0.1);
  }
}

.compare-content {
  @include flex-column;
  gap: $spacing-lg;
}

.empty-state {
  @include flex-column;
  @include flex-center;
  padding: $spacing-xl * 2;
  text-align: center;
  background-color: $color-bg-card;
  border-radius: $border-radius-lg;
  border: 1px solid $color-border-light;
}

.empty-state__icon {
  color: $color-text-muted;
  margin-bottom: $spacing-md;
  opacity: 0.6;
}

.empty-state__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
}

.empty-state__description {
  margin: 0;
  font-size: $font-size-md;
  color: $color-text-secondary;
  max-width: 400px;
}

@media (max-width: $breakpoint-md) {
  .hero-compare {
    padding: $spacing-sm;
  }

  .page-title {
    font-size: $font-size-xl;
  }

  .selector-section {
    padding: $spacing-sm;
  }

  .hero-select {
    font-size: $font-size-sm;
    padding: $spacing-xs $spacing-sm;
    padding-right: 30px;
  }

  .swap-button {
    margin-top: 0;
  }

  .reset-button {
    margin-top: 0;
  }
}
</style>
