<script setup lang="ts">
import { affiliateLinks } from '~/data/affiliate-links'
import type { ResultType } from '~/types/shindan'

/**
 * アフィリエイトリンク(/go/<slug>)の汎用ボタン/テキストリンク(aff-v1 から移植)。
 * data/affiliate-links.ts に登録済み+active の slug のときだけ描画する
 * (未契約・未登録の案件のCTAを出さない — P7承認条件1)。
 * rel="sponsored nofollow" は本コンポーネントが必ず付ける(05章 §3)。
 * クリックは useAnalytics の affiliate_click で計測してから遷移する。
 */
interface Props {
  /** /go/<slug> の slug。data/affiliate-links.ts のキーと一致させる */
  slug: string
  label?: string
  /** 設置位置の識別子(07章: lead / body / footer / result) */
  position?: string
  /** 診断結果ページ起点のときの結果タイプ */
  resultType?: ResultType
  /** 記事起点のときのクラスタ */
  cluster?: string
  variant?: 'btn' | 'link'
}
const props = withDefaults(defineProps<Props>(), {
  label: '無料で求人を見てみる',
  position: undefined,
  resultType: undefined,
  cluster: undefined,
  variant: 'btn',
})

const { trackAffiliateClick } = useAnalytics()

const registered = computed(() => affiliateLinks.some((l) => l.slug === props.slug && l.active))
const href = computed(() => `/go/${encodeURIComponent(props.slug)}/`)

function onClick() {
  trackAffiliateClick(props.slug, {
    position: props.position,
    resultType: props.resultType,
    cluster: props.cluster,
  })
}
</script>

<template>
  <!-- /go/ 経由の遷移先は外部のため別タブ。sponsored nofollow は必須(05章 §3) -->
  <a
    v-if="registered"
    :href="href"
    target="_blank"
    rel="sponsored nofollow noopener"
    :class="
      variant === 'btn'
        ? 'btn-primary inline-flex w-full items-center justify-center'
        : 'font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800'
    "
    @click="onClick"
  >
    {{ label }}
  </a>
</template>
