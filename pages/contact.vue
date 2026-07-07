<script setup lang="ts">
import { SITE_NAME, CONTACT_FORM_URL } from '~/config/site'

useSeoMeta({
  title: 'お問い合わせ',
  description: `${SITE_NAME}へのお問い合わせは専用フォームから受け付けています。`,
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: 'お問い合わせ' }]" />
    <h1 class="mt-4 text-2xl font-bold">お問い合わせ</h1>

    <section class="mt-8">
      <p class="leading-relaxed text-gray-700">
        お問い合わせは、以下のフォームから受け付けています。
      </p>
      <a
        :href="CONTACT_FORM_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-secondary mt-4 inline-flex"
      >
        お問い合わせフォームを開く
      </a>
      <p class="mt-4 leading-relaxed text-gray-700">
        掲載内容の誤りのご指摘、記事監修に関するご連絡、その他のご意見を歓迎します。
        誤りのご指摘をいただいた場合の対応方針は
        <NuxtLink to="/editorial-policy/" class="text-brand-700 underline underline-offset-2">編集ポリシー</NuxtLink>
        の「訂正の方針」をご覧ください。
      </p>
    </section>
  </main>
</template>
