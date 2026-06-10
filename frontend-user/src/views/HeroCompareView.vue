<script setup lang="ts">
/**
 * HeroCompareView - 英雄对比页面容器
 * @page HeroCompareView
 * @description 英雄属性对比功能主页面，支持通过URL query参数传递英雄ID
 *              路径格式: /compare?hero1=1&hero2=2
 *
 * Features:
 * - 从URL query参数读取选中英雄
 * - 下拉选择器选择两位英雄
 * - 一键交换双方英雄位置
 * - 同步选择状态到URL
 * - 响应式布局适配移动端
 */
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { heroes, getHeroById } from '@/data/heroes'
import type { Hero } from '@/types'
import CompareRadar from '@/components/compare/CompareRadar.vue'
import CompareTable from '@/components/compare/CompareTable.vue'
import { Sort, RefreshLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

/**
 * 从URL query参数解析英雄ID
 * @param {string} param - query参数名
 * @returns {number | null} 解析后的英雄ID，无效值返回null
 */
const parseHeroIdFromQuery = (param: string): number | null => {
  const val = route.query[param]
  if (typeof val !== 'string') return null
  const id = parseInt(val, 10)
  if (isNaN(id) || id <= 0) return null
  return getHeroById(id) ? id : null
}

/**
 * 第一个选中英雄的ID（响应式）
 */
const hero1Id = ref<number | null>(parseHeroIdFromQuery('hero1'))

/**
 * 第二个选中英雄的ID（响应式）
 */
const hero2Id = ref<number | null>(parseHeroIdFromQuery('hero2'))

/**
 * 获取第一个英雄对象
 * @returns {Hero | null} 英雄对象或null
 */
const selectedHero1 = computed<Hero | null>(() => {
  return hero1Id.value ? getHeroById(hero1Id.value) ?? null : null
})

/**
 * 获取第二个英雄对象
 * @returns {Hero | null} 英雄对象或null
 */
const selectedHero2 = computed<Hero | null>(() => {
  return hero2Id.value ? getHeroById(hero2Id.value) ?? null : null
})

/**
 * 可选英雄列表（排除已选中的另一个英雄，避免同一英雄对比）
 * @param {number | null} excludeId - 需要排除的英雄ID
 * @returns {Hero[]} 过滤后的英雄列表
 */
const getAvailableHeroes = (excludeId: number | null): Hero[] => {
  if (excludeId === null) return heroes
  return heroes.filter(h => h.id !== excludeId)
}

const availableHeroes1 = computed(() => getAvailableHeroes(hero2Id.value))
const availableHeroes2 = computed(() => getAvailableHeroes(hero1Id.value))

/**
 * 同步选中英雄ID到URL query参数
 * 使用 replace 避免在浏览历史中堆积
 */
const syncQueryParams = (): void => {
  const query: Record<string, string> = {}
  if (hero1Id.value !== null) query.hero1 = String(hero1Id.value)
  if (hero2Id.value !== null) query.hero2 = String(hero2Id.value)

  router.replace({
    path: '/compare',
    query
  })
}

/**
 * 处理英雄1选择变化
 * @param {number | null} val - 新选中的英雄ID
 */
const handleHero1Change = (val: number | null): void => {
  hero1Id.value = val
  syncQueryParams()
}

/**
 * 处理英雄2选择变化
 * @param {number | null} val - 新选中的英雄ID
 */
const handleHero2Change = (val: number | null): void => {
  hero2Id.value = val
  syncQueryParams()
}

/**
 * 交换两个英雄位置
 */
const swapHeroes = (): void => {
  const temp = hero1Id.value
  hero1Id.value = hero2Id.value
  hero2Id.value = temp
  syncQueryParams()
}

/**
 * 重置选择
 */
const resetSelection = (): void => {
  hero1Id.value = null
  hero2Id.value = null
  syncQueryParams()
}

/**
 * 监听路由变化，支持浏览器前进/后退时更新选择
 */
watch(
  () => [route.query.hero1, route.query.hero2],
  () => {
    const newHero1 = parseHeroIdFromQuery('hero1')
    const newHero2 = parseHeroIdFromQuery('hero2')
    if (newHero1 !== hero1Id.value) hero1Id.value = newHero1
    if (newHero2 !== hero2Id.value) hero2Id.value = newHero2
  }
)

/**
 * 判断是否两位英雄均已选中
 */
const bothSelected = computed(() => selectedHero1.value !== null && selectedHero2.value !== null)
</script>

<template>
  <div class="hero-compare-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">英雄对比</h1>
      <p class="page-subtitle">选择两位英雄，直观对比六维属性差异</p>
    </div>

    <!-- 英雄选择区域 -->
    <div class="selectors-section">
      <div class="selector-card hero1-selector">
        <label class="selector-label">英雄 1</label>
        <el-select
          :model-value="hero1Id"
          placeholder="选择第一位英雄"
          clearable
          filterable
          class="hero-select"
          @change="handleHero1Change"
        >
          <el-option
            v-for="hero in availableHeroes1"
            :key="hero.id"
            :label="`${hero.name} · ${hero.title}`"
            :value="hero.id"
          >
            <div class="option-item">
              <img :src="hero.avatar" :alt="hero.name" class="option-avatar" />
              <span class="option-name">{{ hero.name }}</span>
              <span class="option-title">{{ hero.title }}</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <div class="action-buttons">
        <el-button
          class="swap-btn"
          :icon="Sort"
          circle
          :disabled="!bothSelected"
          @click="swapHeroes"
          title="交换双方"
        />
        <el-button
          class="reset-btn"
          :icon="RefreshLeft"
          circle
          :disabled="hero1Id === null && hero2Id === null"
          @click="resetSelection"
          title="重置选择"
        />
      </div>

      <div class="selector-card hero2-selector">
        <label class="selector-label">英雄 2</label>
        <el-select
          :model-value="hero2Id"
          placeholder="选择第二位英雄"
          clearable
          filterable
          class="hero-select"
          @change="handleHero2Change"
        >
          <el-option
            v-for="hero in availableHeroes2"
            :key="hero.id"
            :label="`${hero.name} · ${hero.title}`"
            :value="hero.id"
          >
            <div class="option-item">
              <img :src="hero.avatar" :alt="hero.name" class="option-avatar" />
              <span class="option-name">{{ hero.name }}</span>
              <span class="option-title">{{ hero.title }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- 选中英雄预览 -->
    <div v-if="bothSelected" class="selected-preview">
      <div class="preview-card preview-hero1">
        <img :src="selectedHero1!.avatar" :alt="selectedHero1!.name" class="preview-avatar" />
        <div class="preview-info">
          <span class="preview-name">{{ selectedHero1!.name }}</span>
          <span class="preview-title">{{ selectedHero1!.title }}</span>
        </div>
      </div>

      <div class="vs-badge">VS</div>

      <div class="preview-card preview-hero2">
        <img :src="selectedHero2!.avatar" :alt="selectedHero2!.name" class="preview-avatar" />
        <div class="preview-info">
          <span class="preview-name">{{ selectedHero2!.name }}</span>
          <span class="preview-title">{{ selectedHero2!.title }}</span>
        </div>
      </div>
    </div>

    <!-- 雷达图 -->
    <CompareRadar
      :hero1="selectedHero1"
      :hero2="selectedHero2"
      class="compare-section"
    />

    <!-- 对比表格 -->
    <CompareTable
      :hero1="selectedHero1"
      :hero2="selectedHero2"
      class="compare-section"
    />
  </div>
</template>

<style lang="scss" scoped>
.hero-compare-view {
  min-height: 100vh;
  padding: $spacing-md;
  background-color: $color-bg-dark;
  max-width: 1200px;
  margin: 0 auto;
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

.selectors-section {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: $spacing-md;
  align-items: end;
  margin-bottom: $spacing-lg;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}

.selector-card {
  background-color: $color-bg-card;
  border: 1px solid $color-border-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
}

.selector-label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-primary;
  margin-bottom: $spacing-xs;
}

.hero-select {
  width: 100%;

  :deep(.el-select__wrapper) {
    background-color: rgba($color-bg-dark, 0.5);
    border-color: $color-border-light;
  }
}

.option-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.option-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.option-name {
  font-weight: $font-weight-medium;
  color: $color-text-primary;
}

.option-title {
  font-size: $font-size-xs;
  color: $color-text-secondary;
  margin-left: auto;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding-bottom: $spacing-xs;

  @media (max-width: $breakpoint-md) {
    flex-direction: row;
    justify-content: center;
    padding-bottom: 0;
  }
}

.swap-btn {
  background-color: $color-primary;
  border-color: $color-primary;
  color: $color-bg-dark;

  &:hover:not(:disabled) {
    background-color: $color-primary-light;
    border-color: $color-primary-light;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.reset-btn {
  background-color: transparent;
  border-color: $color-border;
  color: $color-text-secondary;

  &:hover:not(:disabled) {
    border-color: $color-primary;
    color: $color-primary;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.selected-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background-color: $color-bg-card;
  border-radius: $border-radius-lg;
  border: 1px solid $color-border-light;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;

  &.preview-hero1 {
    border: 2px solid #4E91FF;
    background-color: rgba(78, 145, 255, 0.08);
  }

  &.preview-hero2 {
    border: 2px solid #FF9540;
    background-color: rgba(255, 149, 64, 0.08);
  }
}

.preview-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.preview-info {
  display: flex;
  flex-direction: column;
}

.preview-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
}

.preview-title {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.vs-badge {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-primary;
  text-shadow: 0 0 10px rgba($color-primary, 0.5);
}

.compare-section {
  margin-bottom: $spacing-lg;
}

@media (max-width: $breakpoint-md) {
  .hero-compare-view {
    padding: $spacing-sm;
  }

  .page-title {
    font-size: $font-size-xl;
  }

  .selected-preview {
    gap: $spacing-sm;
    padding: $spacing-sm;
  }

  .preview-card {
    padding: $spacing-xs;
  }

  .preview-avatar {
    width: 36px;
    height: 36px;
  }

  .preview-name {
    font-size: $font-size-sm;
  }

  .preview-title {
    display: none;
  }

  .vs-badge {
    font-size: $font-size-md;
  }
}
</style>
