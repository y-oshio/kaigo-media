<script setup lang="ts">
import { questions } from '~/data/shindan/questions'
import { results, allResultTypes } from '~/data/shindan/results'

/**
 * 介護タイプ診断LP /shindan/(03章 T7 — C7)。このページは index 可。
 * 質問フロー(/shindan/start/)と結果ページ(/shindan/result/<type>/)は noindex(05章 §3)。
 */
useSeoMeta({
  title: '介護タイプ診断(全15問・無料)',
  description:
    '15問の質問に答えるだけで、特養・老健・デイサービス・訪問介護など8タイプから、あなたに向いている介護の職場と働き方の傾向がわかります。無料・登録不要。',
})

const totalQuestions = questions.length
const typeNames = allResultTypes.map((t) => results[t].name)
</script>

<template>
  <main class="container-narrow py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: '介護タイプ診断' }]" />

    <h1 class="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
      介護タイプ診断
    </h1>
    <p class="mt-3 leading-relaxed text-gray-600">
      {{ totalQuestions }}問の質問に答えるだけで、あなたに向いている介護の職場・働き方のタイプがわかります。
      所要時間は約3分。無料・登録不要で、回答内容が保存されることもありません。
    </p>

    <div class="mt-6">
      <NuxtLink to="/shindan/start/" class="btn-primary w-full">
        診断をはじめる(約3分)
      </NuxtLink>
    </div>

    <section class="mt-10">
      <h2 class="text-lg font-bold">診断でわかる8タイプ</h2>
      <ul class="mt-3 grid gap-2 sm:grid-cols-2">
        <li
          v-for="name in typeNames"
          :key="name"
          class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700"
        >
          {{ name }}
        </li>
      </ul>
    </section>

    <section class="mt-10">
      <h2 class="text-lg font-bold">この診断について</h2>
      <ul class="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600">
        <li>経験・希望の働き方・体力面・キャリア志向などの回答から、タイプ別のスコアを集計して判定します。</li>
        <li>結果は一般的な傾向をもとにした参考情報です。実際の転職や就業条件は求人ごとにご確認ください。</li>
        <li>回答はブラウザ内でのみ処理され、当サイトに送信・保存されません。</li>
      </ul>
    </section>
  </main>
</template>
