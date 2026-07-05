<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

/** 信頼系ページは必ずフッターに露出する(03章 §5 — 品質評価者が運営者情報へ到達しやすくする) */
const trustLinks = [
  { label: '運営者情報', to: '/about/' },
  { label: '編集ポリシー', to: '/editorial-policy/' },
  { label: 'プライバシーポリシー', to: '/privacy/' },
  { label: '利用規約', to: '/terms/' },
  { label: 'お問い合わせ', to: '/contact/' },
]

/** ハブ(未実装の間は準備中表示) */
const hubItems = ['試験・学習', '給料データ', '転職ガイド', '適性診断']
</script>

<template>
  <footer class="mt-16 border-t border-gray-100 bg-gray-50">
    <div class="container-page py-10">
      <p class="text-base font-bold text-gray-700">{{ SITE_NAME }}</p>
      <p class="mt-1 text-xs text-gray-500">介護のしごとに、たしかな情報を。</p>

      <div class="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 class="text-xs font-bold text-gray-500">コンテンツ</h2>
          <ul class="mt-2 space-y-1.5">
            <li v-for="hub in hubItems" :key="hub" class="text-sm text-gray-400">
              {{ hub }}(準備中)
            </li>
          </ul>
        </div>
        <div>
          <h2 class="text-xs font-bold text-gray-500">サイト情報</h2>
          <ul class="mt-2 space-y-1.5">
            <li v-for="link in trustLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-gray-600 underline-offset-2 hover:underline">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <p class="mt-8 text-xs text-gray-400">© 2026 {{ SITE_NAME }}</p>
    </div>
  </footer>
</template>
