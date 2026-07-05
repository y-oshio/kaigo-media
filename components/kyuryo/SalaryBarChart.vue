<script setup lang="ts">
/**
 * 県 vs 全国の給与比較バーチャート(T5・25章 §4 条件2のSVGグラフ)。
 * 依存ライブラリなしの純SVG。データが変われば自動で追随する(F-2)。
 * null の項目は描画しない(欠損を0として描かない — 捏造禁止)。
 */
const props = defineProps<{
  title: string
  unit?: string // 既定 '円'
  rows: { label: string; pref: number | null; national: number | null }[]
}>()

const drawable = computed(() =>
  props.rows.filter((r) => r.pref !== null && r.national !== null) as {
    label: string
    pref: number
    national: number
  }[],
)

const max = computed(() => Math.max(...drawable.value.flatMap((r) => [r.pref, r.national]), 1))

// レイアウト定数(viewBox 単位)
const W = 640
const ROW_H = 64
const BAR_H = 18
const LABEL_W = 150
const VALUE_W = 110
const chartW = W - LABEL_W - VALUE_W

const height = computed(() => drawable.value.length * ROW_H + 8)
const barW = (v: number) => Math.max(2, Math.round((v / max.value) * chartW))
const fmt = (v: number) => v.toLocaleString('ja-JP')
</script>

<template>
  <figure v-if="drawable.length" class="card overflow-x-auto">
    <figcaption class="text-sm font-bold text-gray-700">{{ title }}</figcaption>
    <svg
      :viewBox="`0 0 ${W} ${height}`"
      class="mt-3 w-full min-w-[480px]"
      role="img"
      :aria-label="`${title}のグラフ`"
    >
      <g v-for="(row, i) in drawable" :key="row.label" :transform="`translate(0, ${i * ROW_H})`">
        <text x="0" :y="ROW_H / 2" dominant-baseline="middle" class="fill-gray-700 text-[13px] font-bold">
          {{ row.label }}
        </text>
        <!-- 当県 -->
        <rect :x="LABEL_W" :y="ROW_H / 2 - BAR_H - 3" :width="barW(row.pref)" :height="BAR_H" rx="2" class="fill-brand-600" />
        <text :x="LABEL_W + barW(row.pref) + 8" :y="ROW_H / 2 - BAR_H / 2 - 3" dominant-baseline="middle" class="fill-gray-800 text-[12px]">
          {{ fmt(row.pref) }}{{ unit ?? '円' }}
        </text>
        <!-- 全国 -->
        <rect :x="LABEL_W" :y="ROW_H / 2 + 3" :width="barW(row.national)" :height="BAR_H" rx="2" class="fill-gray-300" />
        <text :x="LABEL_W + barW(row.national) + 8" :y="ROW_H / 2 + BAR_H / 2 + 3" dominant-baseline="middle" class="fill-gray-500 text-[12px]">
          {{ fmt(row.national) }}{{ unit ?? '円' }}(全国)
        </text>
      </g>
    </svg>
    <div class="mt-2 flex gap-4 text-xs text-gray-500">
      <span class="inline-flex items-center gap-1"><span class="inline-block h-3 w-3 rounded-sm bg-brand-600" />当地域</span>
      <span class="inline-flex items-center gap-1"><span class="inline-block h-3 w-3 rounded-sm bg-gray-300" />全国平均</span>
    </div>
  </figure>
</template>
