<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

useSeoMeta({
  title: 'プライバシーポリシー',
  description: `${SITE_NAME}のプライバシーポリシー。個人情報・アクセス解析・広告に関する取り扱いを説明します。`,
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: 'プライバシーポリシー' }]" />
    <h1 class="mt-4 text-2xl font-bold">プライバシーポリシー</h1>
    <p class="mt-3 text-sm text-gray-500">制定日: 2026年7月5日</p>

    <section class="mt-8">
      <h2 class="text-lg font-bold">1. 個人情報の取得</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        記事の閲覧・診断コンテンツの利用にあたり、個人情報の入力は必要ありません。
        <NuxtLink to="/contact/" class="text-brand-700 underline underline-offset-2">お問い合わせ</NuxtLink>には外部フォーム(Googleフォーム)を利用しており、入力された内容はお問い合わせへの対応目的でのみ利用します。
        フォーム自体の個人情報の取り扱いはGoogleのプライバシーポリシーに従います。
        また、公式LINEアカウントを友だち追加された場合、LINEの仕組み上、LINEのユーザーIDなどの情報が当サイト運営者に共有されます。
        この情報は介護の仕事に関する情報提供・ご相談対応の目的でのみ利用し、目的外の利用は行いません。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">2. アクセス解析</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        当サイトは今後、サイト改善のためにアクセス解析ツール(Google Analytics 等)を利用する場合があります。
        アクセス解析ツールはトラフィックデータの収集のために Cookie を使用することがありますが、
        このデータは匿名で収集されており、個人を特定するものではありません。
        利用を開始した場合は本ページに明記します。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">3. 広告について</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        当サイトは今後、アフィリエイトプログラムに参加し広告を掲載する場合があります。
        また、公式LINEアカウントを通じて、提携する求人サービス等の紹介(広告)を行う場合があります。
        広告リンクから遷移した先のサイトにおける個人情報の取り扱いは、各事業者のプライバシーポリシーに従います。
        広告掲載の考え方は<NuxtLink to="/editorial-policy/" class="text-brand-700 underline underline-offset-2">編集ポリシー</NuxtLink>をご覧ください。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">4. 本ポリシーの改定</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        本ポリシーの内容は、法令の変更やサイト機能の追加に応じて改定することがあります。
        重要な変更がある場合は本ページで告知します。
      </p>
    </section>
  </main>
</template>
