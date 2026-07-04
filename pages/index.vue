<script setup lang="ts">
import { SITE_NAME, SITE_DESCRIPTION } from '~/config/site'

// トップはタイトル規則(%s|サイト名)を適用せず単独タイトルにする
useHead({ titleTemplate: null })
useSeoMeta({
  title: `${SITE_NAME}|介護職の過去問・給料・転職情報メディア`,
  description: SITE_DESCRIPTION,
  ogTitle: `${SITE_NAME}|介護職の過去問・給料・転職情報メディア`,
  ogDescription: SITE_DESCRIPTION,
})

const sections = [
  {
    title: '過去問演習',
    description: '介護福祉士・ケアマネ試験の過去問を1問ずつ丁寧に解説(準備中)',
  },
  {
    title: '介護職の給料データ',
    description: '公的統計にもとづく都道府県別・資格別の給料情報(準備中)',
  },
  {
    title: '転職・キャリアガイド',
    description: '現場の悩み・資格取得・施設選びに寄り添う記事(準備中)',
  },
  {
    title: '介護タイプ診断',
    description: 'あなたに合う施設タイプ・働き方がわかる15問診断(準備中)',
  },
]
</script>

<template>
  <main class="container-page py-12">
    <h1 class="text-2xl font-bold leading-snug sm:text-3xl">
      {{ SITE_NAME }} — 介護のしごとに、たしかな情報を
    </h1>
    <p class="mt-4 text-gray-600">
      {{ SITE_DESCRIPTION }}
    </p>

    <section class="mt-10 grid gap-4 sm:grid-cols-2">
      <div v-for="section in sections" :key="section.title" class="card">
        <h2 class="text-lg font-bold text-brand-700">{{ section.title }}</h2>
        <p class="mt-2 text-sm text-gray-600">{{ section.description }}</p>
      </div>
    </section>

    <p class="mt-10 text-xs text-gray-400">当サイトは現在準備中です。</p>
  </main>
</template>
