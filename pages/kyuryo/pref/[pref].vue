<script setup lang="ts">
import { findPrefecture } from '~/data/kb/prefectures'
import { SITE_NAME, SITE_URL } from '~/config/site'
import { articlePath } from '~/config/routes'

/**
 * T5 都道府県×介護職の給料ページ(E7: kyuryo-pref-kaigoshoku / V2 25章 §1 #1)。
 * - データは C2(承認済みレコードのみ — utils/kyuryo.ts)。null率ゲート不通過の県は404
 * - 独自ブロック: 全国比・順位・SVGグラフ・統計値から決定的に生成する解説(400字以上)
 * - 関連ガイドへの文脈リンクが gate.contextGuideLinksMin 本に満たない間は noindex
 *   (25章 §4 条件2。sitemap 掲載も server/api/__sitemap__/urls.ts が同じ条件で判定)
 * - 前年差ブロックは複数年度が貯まってから(初年度は表示しない — E7 note)
 */
definePageMeta({
  validate: (route) => /^[a-z0-9-]+$/.test(String(route.params.pref ?? '')),
})

const route = useRoute()
const prefSlug = String(route.params.pref)

const pref = findPrefecture(prefSlug)
const stat = pref ? getSalaryStat(pref.slug, KYURYO_JOB_SLUG) : undefined
const national = getSalaryStat(null, KYURYO_JOB_SLUG)

if (!pref || !stat || !national || !passesNullRateGate(stat)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

const homon = getSalaryStat(pref.slug, 'homonkaigo')
const homonNational = getSalaryStat(null, 'homonkaigo')
const rank = prefRank(pref.slug)
const source = getStatSource(stat.sourceIds[0])
const annual = estimatedAnnual(stat)

const explanation = prefSalaryExplanation({
  prefName: pref.name,
  stat,
  national,
  rank,
  homon,
  homonNational,
})

// 関連ガイド(公開ゲート通過済みの給料ガイド記事)。ゲート本数未満の間は noindex
const { data: guides } = await useAsyncData(`kyuryo-guides-${prefSlug}`, async () => {
  const all = await queryCollection('articles')
    .where('path', 'LIKE', '/kyuryo/%')
    .select('path', 'title', 'description', 'cluster', 'publishedAt', 'sources')
    .all()
  return all
    .filter((doc) => doc.cluster === 'kyuryo' && isPublishable(doc))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 6)
})
const guideList = computed(() => guides.value ?? [])
const indexable = computed(
  () => guideList.value.length >= PREF_SALARY_REGISTRY.gate.contextGuideLinksMin,
)

const canonicalUrl = `${SITE_URL}/kyuryo/pref/${pref.slug}/`
const pageTitle = `${pref.name}の介護職員の給料 — 平均月給${stat.monthlyAvg !== null ? formatManYen(stat.monthlyAvg) : '(調査値なし)'}(令和7年調査)`
const pageDescription =
  `令和7年賃金構造基本統計調査にもとづく${pref.name}の介護職員(医療・福祉施設等)の給料データ。` +
  `きまって支給する現金給与額・所定内給与・年間賞与を全国平均と比較し、統計の読み方も解説します。`

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'article',
  ogUrl: canonicalUrl,
  ...(indexable.value ? {} : { robots: 'noindex' }),
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pageTitle,
        description: pageDescription,
        dateModified: stat.updatedAt,
        mainEntityOfPage: canonicalUrl,
        inLanguage: 'ja',
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      }),
    },
  ],
})

const summaryCards = computed(() => {
  const cards: { label: string; value: string; note?: string }[] = []
  if (stat.monthlyAvg !== null) {
    cards.push({ label: 'きまって支給する現金給与額', value: formatManYen(stat.monthlyAvg), note: '月額・残業代等を含む' })
  }
  if (stat.scheduledMonthly !== null) {
    cards.push({ label: '所定内給与額', value: formatManYen(stat.scheduledMonthly), note: '月額・残業代等を除く' })
  }
  if (stat.annualBonus !== null) {
    cards.push({ label: '年間賞与その他特別給与額', value: formatManYen(stat.annualBonus), note: '年額(前年1年間)' })
  }
  if (annual !== null) {
    cards.push({ label: '年収の目安', value: formatApproxManYen(annual), note: '月給×12+年間賞与の単純計算' })
  }
  return cards
})

const detailRows = computed(() => {
  const row = (label: string, v: number | null, unit: string) =>
    ({ label, value: v === null ? null : `${v.toLocaleString('ja-JP')}${unit}` })
  return [
    { section: '介護職員(医療・福祉施設等)', rows: [
      row('平均年齢', stat.avgAge, '歳'),
      row('平均勤続年数', stat.avgTenureYears, '年'),
      row('所定内実労働時間(月)', stat.scheduledHours, '時間'),
      row('超過実労働時間(月)', stat.overtimeHours, '時間'),
      row('集計対象の労働者数', stat.workerCount, '人'),
    ]},
    ...(homon ? [{ section: '訪問介護従事者(参考)', rows: [
      row('きまって支給する現金給与額', homon.monthlyAvg, '円'),
      row('所定内給与額', homon.scheduledMonthly, '円'),
      row('年間賞与その他特別給与額', homon.annualBonus, '円'),
      row('平均年齢', homon.avgAge, '歳'),
      row('集計対象の労働者数', homon.workerCount, '人'),
    ]}] : []),
  ]
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb
      :items="[
        { name: 'ホーム', path: '/' },
        { name: '給料データ', path: '/kyuryo/' },
        { name: `${pref.name}の介護職員の給料` },
      ]"
    />

    <h1 class="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
      {{ pref.name }}の介護職員の給料
    </h1>
    <p class="mt-2 text-sm text-gray-500">
      令和7年賃金構造基本統計調査(厚生労働省)・男女計
      <template v-if="rank">|全国{{ rank.total }}都道府県中 {{ rank.rank }}位</template>
    </p>

    <!-- サマリーカード -->
    <section class="mt-8 grid gap-3 sm:grid-cols-2" aria-label="給料サマリー">
      <div v-for="card in summaryCards" :key="card.label" class="card">
        <p class="text-xs text-gray-500">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-bold text-brand-700">{{ card.value }}</p>
        <p v-if="card.note" class="mt-1 text-xs text-gray-400">{{ card.note }}</p>
      </div>
    </section>

    <!-- 全国比較グラフ(SVG) -->
    <section class="mt-8 space-y-4" aria-label="全国平均との比較">
      <KyuryoSalaryBarChart
        :title="`月給の全国比較(${pref.name}の介護職員)`"
        :rows="[
          { label: 'きまって支給する現金給与額', pref: stat.monthlyAvg, national: national.monthlyAvg },
          { label: '所定内給与額', pref: stat.scheduledMonthly, national: national.scheduledMonthly },
        ]"
      />
      <KyuryoSalaryBarChart
        title="年間賞与その他特別給与額の全国比較"
        :rows="[{ label: '年間賞与(年額)', pref: stat.annualBonus, national: national.annualBonus }]"
      />
    </section>

    <!-- 編集部解説(統計値から決定的に生成 — utils/kyuryo-text.ts) -->
    <section class="mt-10" aria-label="解説">
      <h2 class="border-l-4 border-brand-600 pl-3 text-xl font-bold">
        {{ pref.name }}の介護職員の給料をどう読むか
      </h2>
      <p v-for="(para, i) in explanation" :key="i" class="mt-4 leading-relaxed text-gray-700">
        {{ para }}
      </p>
    </section>

    <!-- 詳細データ表 -->
    <section class="mt-10" aria-label="詳細データ">
      <h2 class="border-l-4 border-brand-600 pl-3 text-xl font-bold">統計の詳細({{ pref.name }})</h2>
      <div v-for="group in detailRows" :key="group.section" class="mt-4">
        <h3 class="text-sm font-bold text-gray-700">{{ group.section }}</h3>
        <table class="mt-2 w-full border-collapse text-sm">
          <tbody>
            <tr v-for="r in group.rows" :key="r.label" class="border-b border-gray-100">
              <th class="w-1/2 py-2 pr-4 text-left font-normal text-gray-500">{{ r.label }}</th>
              <td class="py-2 text-gray-800">
                <template v-if="r.value !== null">{{ r.value }}</template>
                <template v-else>—(調査値なし)</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-gray-400">
        「—(調査値なし)」は出典統計に値が公表されていない項目です(推計値では埋めません)。
      </p>
    </section>

    <!-- 関連ガイド(公開済みの給料ガイドのみ。0本の間は非表示) -->
    <section v-if="guideList.length" class="mt-10" aria-label="関連ガイド">
      <h2 class="border-l-4 border-brand-600 pl-3 text-xl font-bold">あわせて読みたい給料ガイド</h2>
      <ul class="mt-4 space-y-2">
        <li v-for="doc in guideList" :key="doc.path">
          <NuxtLink
            :to="articlePath('kyuryo', String(doc.path).split('/').pop() ?? '')"
            class="text-brand-700 underline-offset-2 hover:underline"
          >
            {{ doc.title }}
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- CTA(診断のみ — 求人CTAはASP契約まで出さない: P6承認条件8) -->
    <ArticleCtaSlot cluster="kyuryo" />

    <!-- 出典・調査時点・定義注記 -->
    <section v-if="source" class="mt-10 rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-gray-500" aria-label="出典">
      <h2 class="text-sm font-bold text-gray-600">出典・調査時点</h2>
      <p class="mt-2">
        {{ source.surveyName }}({{ source.publisher }})/ 調査時点: {{ source.surveyPoint }} /
        出典確認日: {{ source.checkedAt }} /
        <a :href="source.url" target="_blank" rel="noopener" class="underline">e-Stat 統計表ページ</a>
      </p>
      <p class="mt-2">{{ source.definitionNote }}</p>
    </section>
  </main>
</template>
