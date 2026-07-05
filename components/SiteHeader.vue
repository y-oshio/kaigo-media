<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

/**
 * グローバルヘッダー(設計書03章 §5。項目は V2 21章のクラスタ構成)。
 * 未実装セクションはリンクにせず「準備中」表示(実装され次第 to を設定):
 * 試験・学習=/shiken/(P8) 給料=/kyuryo/(P6) 転職ガイド=/tenshoku/(P3) 診断=/shindan/(P7・aff-v1移植)
 */
const navItems: { label: string; to: string | null; emphasis?: boolean }[] = [
  { label: '試験・学習', to: null },
  { label: '給料', to: null },
  { label: '転職ガイド', to: null },
  { label: '診断', to: null, emphasis: true },
]

const menuOpen = ref(false)
</script>

<template>
  <header class="border-b border-gray-100 bg-white">
    <div class="container-page flex h-14 items-center justify-between">
      <NuxtLink to="/" class="text-lg font-bold text-brand-700">{{ SITE_NAME }}</NuxtLink>

      <!-- PC ナビ -->
      <nav class="hidden items-center gap-1 sm:flex" aria-label="グローバルナビゲーション">
        <template v-for="item in navItems" :key="item.label">
          <NuxtLink v-if="item.to" :to="item.to" class="btn-ghost">{{ item.label }}</NuxtLink>
          <span
            v-else
            class="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-400"
            :class="item.emphasis ? 'font-semibold' : ''"
          >
            {{ item.label }}
            <span class="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px]">準備中</span>
          </span>
        </template>
      </nav>

      <!-- スマホ: ハンバーガー(ボトム固定CTAは使わない — 03章 §5) -->
      <button
        type="button"
        class="p-2 sm:hidden"
        :aria-expanded="menuOpen"
        aria-label="メニューを開閉"
        @click="menuOpen = !menuOpen"
      >
        <span class="block h-0.5 w-5 bg-gray-700" />
        <span class="mt-1 block h-0.5 w-5 bg-gray-700" />
        <span class="mt-1 block h-0.5 w-5 bg-gray-700" />
      </button>
    </div>

    <nav v-if="menuOpen" class="border-t border-gray-100 sm:hidden" aria-label="モバイルナビゲーション">
      <ul class="container-page divide-y divide-gray-50 py-2">
        <li v-for="item in navItems" :key="item.label" class="py-2">
          <NuxtLink v-if="item.to" :to="item.to" class="text-sm font-semibold text-gray-700">
            {{ item.label }}
          </NuxtLink>
          <span v-else class="text-sm text-gray-400">{{ item.label }}(準備中)</span>
        </li>
      </ul>
    </nav>
  </header>
</template>
