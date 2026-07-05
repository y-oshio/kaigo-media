<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

useSeoMeta({
  title: '運営者情報',
  description: `${SITE_NAME}の運営者情報。サイトの目的、情報発信で大切にしていること、運営体制について説明します。`,
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: '運営者情報' }]" />
    <h1 class="mt-4 text-2xl font-bold">運営者情報</h1>

    <section class="mt-8">
      <h2 class="text-lg font-bold">このサイトについて</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        {{ SITE_NAME }}は、介護の現場で働く人・これから介護の仕事を目指す人のための情報メディアです。
        公的統計にもとづく給料データ、介護福祉士などの資格試験に関する情報、
        転職・キャリアの意思決定に役立つ解説を届けることを目的としています。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">大切にしていること</h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>
          <strong>一次情報にもとづくこと</strong> —
          給料・制度・試験に関する数値は、政府統計・法令・公的機関の発表を出典とし、出典名と確認日を明記します。
          出典に存在しないデータを推計で埋めることはしません。
        </li>
        <li>
          <strong>専門家による監修</strong> —
          資格・制度など正確性が特に重要な記事は、介護・医療の有資格者による監修体制を整備中です。
          監修が必要と定めた記事は、監修が完了するまで公開しません。
        </li>
        <li>
          <strong>AIの活用と人間の責任</strong> —
          コンテンツ制作にAIを活用していますが、事実確認・公開の最終判断は人間が行います。
          詳しくは<NuxtLink to="/editorial-policy/" class="text-brand-700 underline underline-offset-2">編集ポリシー</NuxtLink>をご覧ください。
        </li>
      </ul>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">運営者</h2>
      <dl class="mt-3 space-y-2 text-gray-700">
        <div class="flex gap-3">
          <dt class="w-24 shrink-0 font-semibold">名義</dt>
          <dd>準備中(サイト正式公開までに掲載します)</dd>
        </div>
        <div class="flex gap-3">
          <dt class="w-24 shrink-0 font-semibold">連絡先</dt>
          <dd>
            準備中 —
            <NuxtLink to="/contact/" class="text-brand-700 underline underline-offset-2">お問い合わせ</NuxtLink>のページをご覧ください
          </dd>
        </div>
      </dl>
    </section>
  </main>
</template>
