<script setup lang="ts">
import { SITE_NAME, SITE_DESCRIPTION } from '~/config/site'

// トップはタイトル規則(%s|サイト名)を適用せず単独タイトルにする
useHead({ titleTemplate: null })
useSeoMeta({
  title: `${SITE_NAME}|介護職の給料・試験・転職情報メディア`,
  description: SITE_DESCRIPTION,
  ogTitle: `${SITE_NAME}|介護職の給料・試験・転職情報メディア`,
  ogDescription: SITE_DESCRIPTION,
})

// V2 21章の4層構成に対応(過去問は凍結中のため約束しない)。実装済みセクションのみ to を設定
const sections: { title: string; description: string; to?: string }[] = [
  {
    title: '介護職の給料データ',
    description: '公的統計にもとづく都道府県別・資格別の給料情報(準備中)',
  },
  {
    title: '試験・学習',
    description: '介護福祉士・ケアマネ試験の日程・合格点データとオリジナル練習問題(準備中)',
  },
  {
    title: '転職・キャリアガイド',
    description: '現場の悩み・資格取得・施設選びに寄り添う記事(準備中)',
  },
  {
    title: '介護タイプ診断',
    description: '15問・約3分。あなたに合う施設タイプ・働き方の傾向がわかります(無料・登録不要)',
    to: '/shindan/',
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
      <template v-for="section in sections" :key="section.title">
        <NuxtLink v-if="section.to" :to="section.to" class="card block transition hover:border-brand-300 hover:shadow-md">
          <h2 class="text-lg font-bold text-brand-700">{{ section.title }} →</h2>
          <p class="mt-2 text-sm text-gray-600">{{ section.description }}</p>
        </NuxtLink>
        <div v-else class="card">
          <h2 class="text-lg font-bold text-brand-700">{{ section.title }}</h2>
          <p class="mt-2 text-sm text-gray-600">{{ section.description }}</p>
        </div>
      </template>
    </section>

    <p class="mt-10 text-xs text-gray-400">当サイトは現在準備中です。</p>
  </main>
</template>
