<script setup lang="ts">
import { SITE_NAME } from '~/config/site'

useSeoMeta({
  title: '編集ポリシー・広告掲載方針',
  description: `${SITE_NAME}の編集ポリシー。情報の正確性の担保、監修体制、AI活用の方針、広告掲載方針、訂正の方針について説明します。`,
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: '編集ポリシー' }]" />
    <h1 class="mt-4 text-2xl font-bold">編集ポリシー・広告掲載方針</h1>
    <p class="mt-3 text-sm text-gray-500">制定日: 2026年7月5日</p>

    <section class="mt-8">
      <h2 class="text-lg font-bold">1. 編集方針</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        {{ SITE_NAME }}は、介護の仕事に関わる読者の意思決定(働き方・資格取得・転職)に役立つ、
        正確で誠実な情報を提供することを編集の目的とします。
        検索されやすさよりも、読者にとっての正確さと有用さを優先します。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">2. 情報の正確性</h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>給料・制度・試験など検証可能な事実は、一次情報(政府統計・法令・公的機関の発表)を出典とし、<strong>出典名と確認日を明記</strong>します。</li>
        <li>出典に存在しない粒度のデータを推計・創作で補うことはしません。</li>
        <li>統計は調査ごとに定義が異なるため、異なる調査の数値を同一の表・グラフに並べません。</li>
        <li>制度改定・統計の更新があった場合は、影響するページを特定して更新し、更新日を表示します。</li>
      </ul>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">3. 監修体制</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        資格・制度・試験対策など、誤りが読者の不利益に直結する記事には、介護・医療の有資格者による監修を必須とする方針です。
        監修体制は現在整備中であり、監修が必要と定めた記事は監修完了まで公開しません。
        監修者が確定した記事には、監修者の氏名・保有資格・監修日を表示します。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">4. AI活用の方針</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        当サイトはコンテンツ制作の一部にAI(生成AI)を活用しています。
        ただし、AIの出力をそのまま公開することはせず、事実関係の検証・出典の確認・公開の最終判断は人間が行います。
        学習問題などのオリジナルコンテンツは、既存の著作物を複製しない制作工程で作成します。
      </p>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">5. 広告掲載方針</h2>
      <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-gray-700">
        <li>当サイトは今後、アフィリエイトプログラム等による広告を掲載する場合があります。</li>
        <li>広告・アフィリエイトリンクを含むページには、その旨の表記(PR表記)を行います。</li>
        <li>広告の有無・報酬の多寡は、記事の内容・評価・結論に影響させません。</li>
        <li>広告リンクには rel="sponsored" を付与し、検索エンジンに広告であることを明示します。</li>
      </ul>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-bold">6. 訂正の方針</h2>
      <p class="mt-3 leading-relaxed text-gray-700">
        内容の誤りに気づかれた場合は、<NuxtLink to="/contact/" class="text-brand-700 underline underline-offset-2">お問い合わせ</NuxtLink>からご連絡ください(連絡手段は準備中です)。
        誤りが確認された場合はすみやかに訂正し、更新日を改めます。
      </p>
    </section>
  </main>
</template>
