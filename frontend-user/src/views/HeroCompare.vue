<script setup lang="ts">
/**
 * HeroCompare - 英雄对比页面容器组件
 * 提供英雄选择功能，整合雷达图和对比表格展示
 * 支持通过 URL query 参数传递英雄 ID（如 /compare?hero1=1&hero2=2）
 * 
 * Features:
 * - 从 URL query 参数读取英雄 ID
 * - 提供下拉选择器更换对比英雄
 * - 整合雷达图和对比表格
 * - 空状态处理
 */
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { heroes } from '@/data/heroes'
import type { Hero } from '@/types'
import CompareRadar from '@/components/compare/CompareRadar.vue'
import CompareTable from '@/components/compare/CompareTable.vue'

const route = useRoute()
const router = useRouter()

/**
 * 从 URL query 参数中获取第一个英雄的 ID
 */
const hero1Id = computed(() => {
  const id = Number(route.query.hero1)
  return isNaN(id) ? 1 : id
})

/**
 * 从 URL query 参数中获取第二个英雄的 ID
 */
const hero2Id = computed(() => {
  const id = Number(route.query.hero2)
  return isNaN(id) ? 2 : id
})

/**
 * 根据 ID 查找第一个英雄
 */
const hero1 = computed<Hero | undefined>(() => {
  return heroes.find(h => h.id === hero1Id.value)
})

/**
 * 根据 ID 查找第二个英雄
 */
const hero2 = computed<Hero | undefined>(() => {
  return heroes.find(h => h.id === hero2Id.value)
})

/**
 * 是否有有效的对比数据
 */
const hasValidHeroes = computed(() => {
  return hero1.value !== undefined && hero2.value !== undefined
})

/**
 * 更换第一个对比英雄
 * @param heroId - 英雄 ID
 */
const changeHero1 = (heroId: number): void => {
  router.replace({
    path: '/compare',
    query: {
      hero1: String(heroId),
      hero2: String(hero2Id.value)
    }
  })
}

/**
 * 更换第二个对比英雄
 * @param heroId - 英雄 ID
 */
const changeHero2 = (heroId: number): void => {
  router.replace({
    path: '/compare',
    query: {
      hero1: String(hero1Id.value),
      hero2: String(heroId)
    }
  })
}

/**
 * 交换两个对比英雄的位置
 */
const swapHeroes = (): void => {
  router.replace({
    path: '/compare',
    query: {
      hero1: String(hero2Id.value),
      hero2: String(hero1Id.value)
    }
  })
}

// 监听路由变化，确保参数有效
watch(
  () => route.query,
  () => {
    // 如果没有有效的 hero1 或 hero2，设置默认值
    if (!route.query.hero1 || !route.query.hero2) {
      router.replace({
        path: '/compare',
        query: {
          hero1: route.query.hero1 ? String(route.query.hero1) : '1',
          hero2: route.query.hero2 ? String(route.query.hero2) : '2'
        }
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="hero-compare">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">英雄对比</h1>
      <p class="page-subtitle">选择两个英雄，直观对比属性差异</p>
    </div>

    <!-- 英雄选择区域 -->
    <div class="hero-selector">
      <div class="hero-select hero-select--left">
        <label class="hero-select__label">选择英雄 1</label>
        <select 
          class="hero-select__select"
          :value="hero1Id"
          @change="(e) => changeHero1(Number((e.target as HTMLSelectElement).value))"
        >
          <option v-for="hero in heroes" :key="hero.id" :value="hero.id">
            {{ hero.name }} - {{ hero.title }}
          </option>
        </select>
      </div>

      <button 
        class="swap-btn"
        @click="swapHeroes"
        aria-label="交换英雄"
        title="交换英雄"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m17 3 4 4-4 4"/>
          <path d="M3 7h14"/>
          <path d="m7 21-4-4 4-4"/>
          <path d="M21 17H7"/>
        </svg>
      </button>

      <div class="hero-select hero-select--right">
        <label class="hero-select__label">选择英雄 2</label>
        <select 
          class="hero-select__select"
          :value="hero2Id"
          @change="(e) => changeHero2(Number((e.target as HTMLSelectElement).value))"
        >
          <option v-for="hero in heroes" :key="hero.id" :value="hero.id">
            {{ hero.name }} - {{ hero.title }}
          </option>
        </select>
      </div>
    </div>

    <!-- 对比内容区域 -->
    <div v-if="hasValidHeroes && hero1 && hero2" class="compare-content">
      <!-- 英雄信息卡片 -->
      <div class="hero-cards">
        <div class="hero-info-card hero-info-card--left">
          <img :src="hero1.avatar" :alt="hero1.name" class="hero-avatar" />
          <div class="hero-info">
            <h3 class="hero-name">{{ hero1.name }}</h3>
            <p class="hero-title">{{ hero1.title }}</p>
          </div>
        </div>

        <div class="vs-badge">VS</div>

        <div class="hero-info-card hero-info-card--right">
          <img :src="hero2.avatar" :alt="hero2.name" class="hero-avatar" />
          <div class="hero-info">
            <h3 class="hero-name">{{ hero2.name }}</h3>
            <p class="hero-title">{{ hero2.title }}</p>
          </div>
        </div>
      </div>

      <!-- 雷达图 -->
      <div class="radar-section">
        <CompareRadar :hero1="hero1" :hero2="hero2" />
      </div>

      <!-- 对比表格 -->
      <div class="table-section">
        <CompareTable :hero1="hero1" :hero2="hero2" />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-state__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>
      <h3 class="empty-state__title">无法加载对比数据</h3>
      <p class="empty-state__description">请确保选择了两个有效的英雄进行对比</p>
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
}

// 英雄选择器
.hero-selector {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: $spacing-md;
  max-width: 800px;
  margin: 0 auto $spacing-lg;

  .hero-select {
    flex: 1;
    max-width: 300px;

    &__label {
      display: block;
      font-size: $font-size-sm;
      color: $color-text-secondary;
      margin-bottom: $spacing-xs / 2;
      font-weight: $font-weight-medium;
    }

    &__select {
      width: 100%;
      padding: $spacing-sm $spacing-md;
      font-size: $font-size-md;
      color: $color-text-primary;
      background-color: $color-bg-card;
      border: 1px solid $color-border-light;
      border-radius: $border-radius-md;
      cursor: pointer;
      transition: all $transition-fast;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A09B8C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right $spacing-sm center;
      padding-right: $spacing-lg;

      &:hover {
        border-color: $color-primary;
      }

      &:focus {
        outline: none;
        border-color: $color-primary;
        box-shadow: 0 0 0 2px rgba($color-primary, 0.2);
      }

      &--left {
        .hero-select__select {
          &:hover, &:focus {
            border-color: #0BC4E2;
            box-shadow: 0 0 0 2px rgba(11, 196, 226, 0.2);
          }
        }
      }

      &--right {
        .hero-select__select {
          &:hover, &:focus {
            border-color: #E84057;
            box-shadow: 0 0 0 2px rgba(232, 64, 87, 0.2);
          }
        }
      }
    }
  }

  .swap-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    padding: 0;
    background-color: $color-bg-card;
    border: 1px solid $color-border-light;
    border-radius: 50%;
    color: $color-primary;
    cursor: pointer;
    transition: all $transition-fast;
    flex-shrink: 0;
    margin-bottom: 2px;

    &:hover {
      background-color: $color-primary;
      color: $color-bg-dark;
      transform: rotate(180deg);
      border-color: $color-primary;
    }

    &:active {
      transform: rotate(180deg) scale(0.95);
    }
  }
}

// 对比内容区域
.compare-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

// 英雄卡片
.hero-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;

  .hero-info-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background-color: $color-bg-card;
    border-radius: $border-radius-lg;
    border: 1px solid $color-border-light;

    &--left {
      border-color: rgba(11, 196, 226, 0.3);

      .hero-name {
        color: #0BC4E2;
      }
    }

    &--right {
      border-color: rgba(232, 64, 87, 0.3);

      .hero-name {
        color: #E84057;
      }
    }

    .hero-avatar {
      width: 64px;
      height: 64px;
      border-radius: $border-radius-md;
      object-fit: cover;
      border: 2px solid $color-border;
    }

    .hero-info {
      .hero-name {
        margin: 0;
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
      }

      .hero-title {
        margin: 4px 0 0 0;
        font-size: $font-size-sm;
        color: $color-text-secondary;
      }
    }
  }

  .vs-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-primary;
    background-color: rgba($color-primary, 0.1);
    border: 2px solid $color-primary;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

// 雷达图区域
.radar-section {
  width: 100%;
}

// 表格区域
.table-section {
  width: 100%;
}

// 空状态
.empty-state {
  @include flex-column;
  @include flex-center;
  max-width: 500px;
  margin: $spacing-xl auto;
  padding: $spacing-xl * 2;
  text-align: center;
  background-color: $color-bg-card;
  border-radius: $border-radius-lg;
  border: 1px solid $color-border-light;

  &__icon {
    color: $color-text-muted;
    margin-bottom: $spacing-md;
    opacity: 0.6;
  }

  &__title {
    margin: 0 0 $spacing-xs 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }

  &__description {
    margin: 0;
    font-size: $font-size-md;
    color: $color-text-secondary;
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .hero-compare {
    padding: $spacing-sm;
  }

  .page-header {
    .page-title {
      font-size: $font-size-xl;
    }
  }

  .hero-selector {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-sm;

    .hero-select {
      max-width: 100%;
    }

    .swap-btn {
      align-self: center;
      transform: rotate(90deg);
      margin: 0;

      &:hover {
        transform: rotate(270deg);
      }
    }
  }

  .hero-cards {
    flex-direction: column;
    gap: $spacing-sm;

    .vs-badge {
      transform: rotate(90deg);
    }
  }
}
</style>
