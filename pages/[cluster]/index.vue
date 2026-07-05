<script setup lang="ts">
import { CONTENT_CLUSTERS, CLUSTER_META, articlePath } from '~/config/routes'
import type { ContentCluster } from '~/config/routes'
import type { ArticleDocument } from '~/utils/article'

/**
 * クラスタ一覧ページ /<cluster>/(shikaku / tenshoku / shisetsu / shokushu)。
 * 公開ゲートを通過した記事だけを新しい順に並べる。0件の間は「準備中」表示。
 * 本格的なハブページ設計(03章 T2)は記事が貯まってから拡張する。
 */
definePageMeta({
  validate: (route) => {
    const cluster = String(route.params.cluster)
    return (CONTENT_CLUSTERS as readonly string[]).includes(cluster) && cluster !== 'kyuryo'
  },
})

const route = useRoute()
const cluster = String(route.params.cluster) as ContentCluster
const meta = CLUSTER_META[cluster]

// 公開ゲートは useAsyncData 内で通す(未公開記事の情報を payload に載せないため)
const { data: docs } = await useAsyncData(`articles-${cluster}`, async () => {
  const all = await queryContent<ArticleDocument>(`/${cluster}`)
    .only(['_path', 'title', 'description', 'cluster', 'publishedAt', 'updatedAt', 'sources'])
    .find()
  return all
    .filter((doc) => doc.cluster === cluster && isPublishable(doc))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
})

const articles = computed(() => docs.value ?? [])

const slugOf = (doc: { _path?: string }) => String(doc._path ?? '').split('/').pop() ?? ''

useSeoMeta({
  title: meta.label,
  description: `${meta.label}に関する記事の一覧です。`,
})
</script>

<template>
  <main class="container-page py-10">
    <AppBreadcrumb :items="[{ name: 'ホーム', path: '/' }, { name: meta.label }]" />
    <h1 class="mt-4 text-2xl font-bold sm:text-3xl">{{ meta.label }}</h1>

    <template v-if="articles.length">
      <ul class="mt-8 grid gap-4 sm:grid-cols-2">
        <li v-for="doc in articles" :key="doc._path" class="card">
          <NuxtLink :to="articlePath(cluster, slugOf(doc))" class="block">
            <h2 class="font-bold text-brand-700 underline-offset-2 hover:underline">{{ doc.title }}</h2>
            <p class="mt-2 text-sm text-gray-600">{{ doc.description }}</p>
            <p class="mt-2 text-xs text-gray-400">{{ doc.updatedAt ?? doc.publishedAt }}</p>
          </NuxtLink>
        </li>
      </ul>
    </template>
    <p v-else class="mt-8 text-gray-600">
      このカテゴリの記事は準備中です。公開までしばらくお待ちください。
    </p>
  </main>
</template>
