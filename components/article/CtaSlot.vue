<script setup lang="ts">
import { CLUSTER_CTA } from '~/config/cta'
import type { ContentCluster } from '~/config/routes'
import { affiliateLinks } from '~/data/affiliate-links'

/**
 * CTA枠(T6・07章)— config/cta.ts のクラスタ別設定を描画する(実装#5=P4で配線)。
 * 参照先が未定(null)・未登録の /go/ 案件のときは何も表示しない(壊れたCTA・架空CTAを出さない)。
 * /go/ へのリンクは rel="sponsored nofollow" 必須(05章 §3)。
 */
const props = defineProps<{ cluster: string }>()
const { trackEvent } = useAnalytics()

const cta = computed(() => CLUSTER_CTA[props.cluster as ContentCluster] ?? null)

const href = computed(() => {
  if (!cta.value) return null
  if (cta.value.to.type === 'internal') return cta.value.to.path
  // /go/ 案件は登録済み・active のときだけリンクを出す
  const slug = cta.value.to.slug
  const registered = affiliateLinks.some((l) => l.slug === slug && l.active)
  return registered ? `/go/${slug}/` : null
})

const isGo = computed(() => cta.value?.to.type === 'go')

function onClick() {
  if (!cta.value || !href.value) return
  trackEvent('cta_click', {
    cluster: props.cluster,
    cta_slug: cta.value.to.type === 'go' ? cta.value.to.slug : cta.value.to.path,
  })
}
</script>

<template>
  <aside v-if="cta && href" class="card mt-10 border-brand-100 bg-brand-50/50">
    <p class="text-lg font-bold text-gray-800">{{ cta.headline }}</p>
    <p class="mt-2 text-sm text-gray-600">{{ cta.description }}</p>
    <a
      v-if="isGo"
      :href="href"
      rel="sponsored nofollow"
      class="btn-primary mt-4 w-full sm:w-auto"
      @click="onClick"
    >
      {{ cta.buttonLabel }}
    </a>
    <NuxtLink v-else :to="href" class="btn-primary mt-4 w-full sm:w-auto" @click="onClick">
      {{ cta.buttonLabel }}
    </NuxtLink>
  </aside>
  <!-- CTA未設定クラスタでは何も表示しない(P4承認条件7) -->
  <div v-else :data-cta-cluster="cluster" class="hidden" aria-hidden="true" />
</template>
