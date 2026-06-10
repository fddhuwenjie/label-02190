/**
 * 英雄属性对比模块共享配置
 * 定义六维属性的键、显示名、单位以及雷达图统一上限
 */
import type { HeroStats } from '@/types'

/**
 * 属性键，按照雷达图与表格中希望出现的顺序排列
 */
export const STAT_KEYS = [
  'maxHp',
  'attack',
  'defense',
  'magic',
  'moveSpeed',
  'attackSpeed'
] as const

/**
 * 单个属性键的字面量类型
 */
export type StatKey = (typeof STAT_KEYS)[number]

/**
 * 静态校验：StatKey 必须等价于 keyof HeroStats
 */
type AssertSameKeys = StatKey extends keyof HeroStats
  ? keyof HeroStats extends StatKey
    ? true
    : never
  : never
// 仅用于编译期类型断言，运行时无意义
export const __statKeysAssertion__: AssertSameKeys = true

/**
 * 属性中文显示名称
 */
export const STAT_LABELS: Record<StatKey, string> = {
  maxHp: '最大生命',
  attack: '物理攻击',
  defense: '物理防御',
  magic: '法术强度',
  moveSpeed: '移动速度',
  attackSpeed: '攻击速度'
}

/**
 * 属性单位
 */
export const STAT_UNITS: Record<StatKey, string> = {
  maxHp: '',
  attack: '',
  defense: '',
  magic: '',
  moveSpeed: '',
  attackSpeed: '%'
}

/**
 * 雷达图各维度的统一上限（参考所有英雄数据合理设定）
 */
export const STAT_MAX: Record<StatKey, number> = {
  maxHp: 9000,
  attack: 500,
  defense: 450,
  magic: 900,
  moveSpeed: 420,
  attackSpeed: 130
}
