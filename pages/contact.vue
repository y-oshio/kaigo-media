<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

useSeoMeta({
  title: 'お問い合わせ',
  description: `${SITE_NAME}へのお問い合わせについて。連絡手段は現在準備中です。`,
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: 'お問い合わせ' }]" />
    <h1 class="mt-4 text-2xl font-bold">お問い合わせ</h1>

    <section class="mt-8">
      <p class="leading-relaxed text-gray-700">
        お問い合わせの連絡手段(メールアドレス)は現在準備中です。
        サイトの正式公開までに本ページに掲載します。
      </p>
      <p class="mt-4 leading-relaxed text-gray-700">
        掲載内容の誤りのご指摘、記事監修に関するご連絡、その他のご意見を歓迎します。
        誤りのご指摘をいただいた場合の対応方針は
        <NuxtLink to="/editorial-policy/" class="text-brand-700 underline underline-offset-2">編集ポリシー</NuxtLink>
        の「訂正の方針」をご覧ください。
      </p>
    </section>
  </main>
</template>
