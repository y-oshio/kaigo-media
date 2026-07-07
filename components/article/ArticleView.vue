<script setup lang="ts">
import { authors } from '~/data/authors'
import { CLUSTER_META, articlePath } from '~/config/routes'
import type { ContentCluster } from '~/config/routes'
import { SITE_NAME, SITE_URL } from '~/config/site'
import type { ArticleDocument } from '~/utils/article'

/**
 * T6 記事テンプレート本体(03章 §4)。
 * リード(本文冒頭)→ 目次 → 本文 → CTA枠 → 執筆・監修 → 出典の順。
 * 公開ゲート(sources/checkedAt 必須)は呼び出し側ページで通過済みであること。
 */
const props = defineProps<{ doc: ArticleDocument; slug: string }>()

const cluster = computed(() => props.doc.cluster as ContentCluster)
const clusterMeta = computed(() => CLUSTER_META[cluster.value])
const canonicalUrl = computed(() => `${SITE_URL}${articlePath(cluster.value, props.slug)}`)

const author = computed(() => authors.find((a) => a.id === props.doc.authorId))
const supervisor = computed(() =>
  authors.find((a) => a.id === props.doc.supervisorId && a.role === 'supervisor'),
)

useSeoMeta({
  title: props.doc.title,
  description: props.doc.description,
  ogTitle: props.doc.title,
  ogDescription: props.doc.description,
  ogType: 'article',
  ogUrl: canonicalUrl.value,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: props.doc.title,
        description: props.doc.description,
        datePublished: props.doc.publishedAt,
        dateModified: props.doc.updatedAt ?? props.doc.publishedAt,
        mainEntityOfPage: canonicalUrl.value,
        inLanguage: 'ja',
        // 実在の執筆者が data/authors.ts に登録されるまで author は組織名義(架空人物の生成禁止 — 04章)
        author: author.value
          ? { '@type': 'Person', name: author.value.name }
          : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        ...(supervisor.value
          ? {
              reviewedBy: {
                '@type': 'Person',
                name: supervisor.value.name,
                url: `${SITE_URL}/supervisor/${supervisor.value.slug}/`,
              },
            }
          : {}),
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      }),
    },
  ],
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb
      :items="[
        { name: 'ホーム', path: '/' },
        { name: clusterMeta.label, path: clusterMeta.indexPath },
        { name: doc.title },
      ]"
    />

    <ArticlePrNotice v-if="doc.prRelated" class="mt-4" />

    <h1 class="mt-4 text-2xl font-bold leading-snug sm:text-3xl">{{ doc.title }}</h1>
    <p class="mt-2 text-xs text-gray-400">
      公開日: {{ doc.publishedAt }}
      <span v-if="doc.updatedAt">/ 更新日: {{ doc.updatedAt }}</span>
    </p>

    <ArticleToc :links="doc.body?.toc?.links ?? []" />

    <div class="article-body">
      <ContentRenderer :value="doc" />
    </div>

    <ArticleCtaSlot :cluster="cluster" />

    <ArticleAuthorBox
      :author-id="doc.authorId"
      :supervisor-id="doc.supervisorId"
      :reviewed-at="doc.reviewedAt"
    />

    <ArticleSourceList :sources="doc.sources" />
  </main>
</template>
