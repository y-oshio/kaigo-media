<script setup lang="ts">
import type { ResultType } from '~/types/shindan'
import { results } from '~/data/shindan/results'
import { affiliateLinks } from '~/data/affiliate-links'
import { SHINDAN_RESULT_OFFER_SLUG } from '~/config/cta'

/**
 * 診断結果ページ /shindan/result/<type>/(03章 T7)。
 * 2段階方針(05章 §3): 独自本文1,000字+C5記事への文脈リンクを備えるまで noindex。
 * 拡充後に robots を外し、sitemap への追加もそのとき行う。
 */
const route = useRoute()
const typeParam = String(route.params.type)

if (!isResultType(typeParam)) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}

const resultType = typeParam as ResultType
const result = results[resultType]

// 求人CTAは data/affiliate-links.ts に登録済み+active のときだけ表示(P7承認条件1)
const jobOfferRegistered = computed(() =>
  affiliateLinks.some((l) => l.slug === SHINDAN_RESULT_OFFER_SLUG && l.active),
)

useSeoMeta({
  title: `あなたは「${result.name}」|介護タイプ診断`,
  description: `${result.name} - ${result.catchphrase}`,
  ogTitle: `あなたは「${result.name}」|介護タイプ診断`,
  ogDescription: result.catchphrase,
  robots: 'noindex',
})
</script>

<template>
  <main class="container-narrow space-y-6 py-10">
    <ShindanResultCard :result="result" />

    <!-- 上部 CTA -->
    <LineCta :result-type="resultType" />

    <div class="space-y-3">
      <NuxtLink to="/shindan/start/" class="btn-secondary w-full">
        もう一度診断する
      </NuxtLink>
      <NuxtLink to="/" class="btn-ghost w-full">
        トップへ戻る
      </NuxtLink>
    </div>

    <!-- 求人サービス導線(A8で mamoribi.jp の媒体登録+affiliate-links 登録が済むまで非表示) -->
    <div v-if="jobOfferRegistered" class="card space-y-3 text-center">
      <p class="text-sm font-semibold text-brand-800">
        「{{ result.name }}」の求人を実際に探すなら
      </p>
      <p class="text-xs leading-relaxed text-gray-500">
        介護専門の求人サービスで、あなたのタイプに近い求人を無料で探せます。
      </p>
      <AffiliateLink
        :slug="SHINDAN_RESULT_OFFER_SLUG"
        :result-type="resultType"
        position="result"
        label="無料で介護求人を探す"
      />
    </div>

    <!-- 下部 CTA -->
    <LineCta :result-type="resultType" />

    <p class="px-1 text-center text-xs leading-relaxed text-gray-400">
      ※ 本診断は一般的な傾向をもとにした参考情報です。<br />
      実際の転職や就業条件は個別にご確認ください。
    </p>
  </main>
</template>
