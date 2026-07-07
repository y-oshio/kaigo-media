<script setup lang="ts">
import { PREF_REGIONS } from '~/data/kb/prefectures'
import { SITE_URL } from '~/config/site'
import { articlePath } from '~/config/routes'

/**
 * 給料データハブ /kyuryo/(03章 §2 — /kyuryo/ 直下は給料pSEO)。
 * - 全国サマリー(C2 承認済みレコードのみ)+公開ゲート通過県への一覧リンク
 * - データ未承認の間は「準備中」表示(サイトの他セクションと同じ誠実な状態)
 * - 給料ガイド記事(/kyuryo/guide/)への入口を兼ねる
 */
const national = getSalaryStat(null, KYURYO_JOB_SLUG)
const nationalHomon = getSalaryStat(null, 'homonkaigo')
const prefPages = publishablePrefSalary()
const surveyYear = latestSurveyYear()
const source = national ? getStatSource(national.sourceIds[0]) : undefined

const prefByRegion = computed(() =>
  PREF_REGIONS.map((region) => ({
    region,
    items: prefPages.filter(({ pref }) => pref.region === region),
  })).filter((g) => g.items.length > 0),
)

const { data: guides } = await useAsyncData('kyuryo-hub-guides', async () => {
  const all = await queryCollection('articles')
    .where('path', 'LIKE', '/kyuryo/%')
    .select('path', 'title', 'description', 'cluster', 'publishedAt', 'sources')
    .all()
  return all
    .filter((doc) => doc.cluster === 'kyuryo' && isPublishable(doc))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 4)
})
const guideList = computed(() => guides.value ?? [])

const canonicalUrl = `${SITE_URL}/kyuryo/`
const pageTitle = '介護職の給料データ(都道府県別・公的統計)'
const pageDescription =
  '賃金構造基本統計調査など公的統計にもとづく介護職の給料データ。都道府県別の平均月給・賞与を全国平均と比較できます。出典と調査時点をすべて明記しています。'

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  // 承認済みデータが無い間(準備中表示)は検索に出さない
  ...(national ? {} : { robots: 'noindex' }),
})
</script>

<template>
  <main class="container-page py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: '給料データ' }]" />
    <h1 class="mt-4 text-2xl font-bold sm:text-3xl">介護職の給料データ</h1>
    <p class="mt-3 text-gray-600">
      公的統計にもとづく介護職の給料データです。出典・調査時点をすべて明記し、統計に存在しない数値は掲載しません。
    </p>

    <template v-if="national && surveyYear">
      <!-- 全国サマリー -->
      <section class="mt-8" aria-label="全国平均">
        <h2 class="border-l-4 border-brand-600 pl-3 text-xl font-bold">
          全国平均(令和7年賃金構造基本統計調査・男女計)
        </h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="card">
            <p class="text-xs text-gray-500">介護職員(医療・福祉施設等)</p>
            <p v-if="national.monthlyAvg !== null" class="mt-1 text-2xl font-bold text-brand-700">
              月{{ formatManYen(national.monthlyAvg) }}
            </p>
            <p class="mt-1 text-xs text-gray-400">
              きまって支給する現金給与額
              <template v-if="national.annualBonus !== null">
                / 年間賞与 {{ formatManYen(national.annualBonus) }}
              </template>
            </p>
          </div>
          <div v-if="nationalHomon" class="card">
            <p class="text-xs text-gray-500">訪問介護従事者</p>
            <p v-if="nationalHomon.monthlyAvg !== null" class="mt-1 text-2xl font-bold text-brand-700">
              月{{ formatManYen(nationalHomon.monthlyAvg) }}
            </p>
            <p class="mt-1 text-xs text-gray-400">
              きまって支給する現金給与額
              <template v-if="nationalHomon.annualBonus !== null">
                / 年間賞与 {{ formatManYen(nationalHomon.annualBonus) }}
              </template>
            </p>
          </div>
        </div>
      </section>

      <!-- 都道府県別(公開ゲート通過分のみ) -->
      <section v-if="prefByRegion.length" class="mt-10" aria-label="都道府県別の給料">
        <h2 class="border-l-4 border-brand-600 pl-3 text-xl font-bold">都道府県別の介護職員の給料</h2>
        <div v-for="group in prefByRegion" :key="group.region" class="mt-5">
          <h3 class="text-sm font-bold text-gray-600">{{ group.region }}</h3>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li v-for="{ pref, stat } in group.items" :key="pref.slug">
              <NuxtLink
                :to="`/kyuryo/pref/${pref.slug}/`"
                class="inline-block rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                {{ pref.name }}
                <span v-if="stat.monthlyAvg !== null" class="text-xs text-gray-400">
                  {{ formatManYen(stat.monthlyAvg) }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </section>

      <!-- 出典 -->
      <section v-if="source" class="mt-10 rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-500" aria-label="出典">
        <p>
          出典: {{ source.surveyName }}({{ source.publisher }})/ 調査時点: {{ source.surveyPoint }} /
          出典確認日: {{ source.checkedAt }} /
          <a :href="source.url" target="_blank" rel="noopener" class="underline">e-Stat 統計表ページ</a>
        </p>
      </section>
    </template>

    <p v-else class="mt-8 rounded-lg bg-gray-50 p-6 text-gray-600">
      都道府県別の給料データは現在準備中です。公的統計の確認・検証が完了したものから順次公開します。
    </p>

    <!-- 給料ガイド記事 -->
    <section class="mt-10" aria-label="給料ガイド">
      <h2 class="border-l-4 border-brand-600 pl-3 text-xl font-bold">給料ガイド(解説記事)</h2>
      <template v-if="guideList.length">
        <ul class="mt-4 grid gap-4 sm:grid-cols-2">
          <li v-for="doc in guideList" :key="doc.path" class="card">
            <NuxtLink :to="articlePath('kyuryo', String(doc.path).split('/').pop() ?? '')" class="block">
              <h3 class="font-bold text-brand-700 underline-offset-2 hover:underline">{{ doc.title }}</h3>
              <p class="mt-2 text-sm text-gray-600">{{ doc.description }}</p>
            </NuxtLink>
          </li>
        </ul>
        <p class="mt-3">
          <NuxtLink to="/kyuryo/guide/" class="text-sm text-brand-700 underline-offset-2 hover:underline">
            給料ガイドの一覧へ →
          </NuxtLink>
        </p>
      </template>
      <p v-else class="mt-4 text-sm text-gray-500">解説記事は準備中です。</p>
    </section>

    <ArticleCtaSlot cluster="kyuryo" />
  </main>
</template>
