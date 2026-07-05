<script setup lang="ts">
import type { ResultDetail } from '~/types/shindan'

/** 診断結果カード(aff-v1 から移植 — 03章 T7)。結果ページの H1 を含む */
interface Props {
  result: ResultDetail
}
defineProps<Props>()
</script>

<template>
  <article class="space-y-5">
    <header class="card text-center">
      <p class="text-xs font-semibold tracking-widest text-brand-700">
        あなたの介護タイプは
      </p>
      <h1 class="mt-2 text-2xl font-bold text-gray-900">
        {{ result.name }}
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-gray-600">
        {{ result.catchphrase }}
      </p>
    </header>

    <section class="card">
      <h2 class="flex items-center gap-2 text-base font-bold text-gray-800">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
        向いている理由
      </h2>
      <ul class="mt-3 space-y-2 text-sm text-gray-700">
        <li v-for="(reason, i) in result.reasons" :key="i" class="flex gap-2">
          <span class="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
          <span>{{ reason }}</span>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2 class="flex items-center gap-2 text-base font-bold text-gray-800">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</span>
        向いている職場の特徴
      </h2>
      <ul class="mt-3 space-y-2 text-sm text-gray-700">
        <li v-for="(feature, i) in result.workplaceFeatures" :key="i" class="flex gap-2">
          <span class="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2 class="flex items-center gap-2 text-base font-bold text-gray-800">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700">!</span>
        注意点
      </h2>
      <ul class="mt-3 space-y-2 text-sm text-gray-700">
        <li v-for="(caution, i) in result.cautions" :key="i" class="flex gap-2">
          <span class="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500" />
          <span>{{ caution }}</span>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2 class="flex items-center gap-2 text-base font-bold text-gray-800">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</span>
        おすすめの転職先条件
      </h2>
      <ul class="mt-3 space-y-2 text-sm text-gray-700">
        <li v-for="(condition, i) in result.recommendedConditions" :key="i" class="flex gap-2">
          <span class="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
          <span>{{ condition }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>
