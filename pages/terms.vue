<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

useSeoMeta({
  title: '利用規約',
  description: `${SITE_NAME}の利用規約。掲載情報の性質と免責事項、著作権、リンクについて定めます。`,
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: '利用規約' }]" />
    <h1 class="mt-4 text-2xl font-bold">利用規約</h1>
    <p class="mt-3 text-sm text-gray-500">制定日: 2026年7月5日</p>

    <section class="mt-8">
      <h2 class="text-lg font-bold">1. 適用</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        本規約は、{{ SITE_NAME }}(以下「当サイト」)の利用に関する条件を定めるものです。
        当サイトを利用された場合、本規約に同意いただいたものとみなします。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">2. 掲載情報の性質と免責</h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>当サイトは掲載情報の正確性・最新性の確保に努めますが、その完全性を保証するものではありません。制度・試験・求人条件などの最新情報は、必ず公式の発表をご確認ください。</li>
        <li>当サイトの情報は、一般的な情報提供を目的とするものであり、医療・法律・税務等の専門的助言ではありません。</li>
        <li>転職・資格取得・受験などの意思決定は、ご自身の判断と責任で行ってください。当サイトの利用により生じた損害について、運営者は責任を負いかねます。</li>
      </ul>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">3. 著作権</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        当サイトに掲載する文章・図表等のコンテンツの著作権は、運営者または正当な権利者に帰属します。
        法令で認められる引用の範囲を超えた無断転載を禁止します。
        引用される場合は、出典として当サイト名と該当ページのURLを明記してください。
        統計データの図表は、出典(当サイトおよび元統計)を明記のうえでの引用・共有を歓迎します。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">4. リンク</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        当サイトへのリンクは原則として自由です。事前の連絡は不要です。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">5. 規約の変更</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        本規約は必要に応じて変更することがあります。変更後の規約は、当サイトに掲載した時点から効力を生じます。
      </p>
    </section>
  </main>
</template>
