<script setup lang="ts">
/**
 * Nuxt Content の <a> 描画を上書き(実装#5=P4)。
 * - 記事本文中の /go/ リンクに rel="sponsored nofollow" を機械的に付ける(05章 §3 — 手書き忘れ防止)。
 *   /go/ はサーバルートなので NuxtLink ではなく素の <a> で遷移させる。
 * - 外部リンク(http)は rel を noopener+パーサ付与分(nofollow 等)に統一し別タブで開く。
 * - それ以外(内部リンク)は NuxtLink。
 * rel は props として受ける(fallthrough 属性でテンプレートの rel が上書きされるのを防ぐ)。
 */
const props = defineProps<{ href?: string; target?: string; rel?: string }>()

const href = computed(() => props.href ?? '')
const isGo = computed(() => href.value.startsWith('/go/'))
const isExternal = computed(() => /^https?:\/\//.test(href.value))

// パーサが付与した rel(nofollow 等)と noopener をマージ(重複除去)
const externalRel = computed(() =>
  [...new Set([...(props.rel ?? '').split(/\s+/).filter(Boolean), 'noopener'])].join(' '),
)
</script>

<template>
  <a v-if="isGo" :href="href" rel="sponsored nofollow"><slot /></a>
  <a
    v-else-if="isExternal"
    :href="href"
    :rel="externalRel"
    :target="target ?? '_blank'"
  ><slot /></a>
  <NuxtLink v-else :to="href" :target="target" :rel="rel"><slot /></NuxtLink>
</template>
