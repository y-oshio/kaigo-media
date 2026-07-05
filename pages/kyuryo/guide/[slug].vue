<script setup lang="ts">
import { RESERVED_SLUGS } from '~/config/routes'
import type { ArticleDocument } from '~/utils/article'

/**
 * 給料ガイド記事 /kyuryo/guide/<slug>/(03章 §2)。
 * Markdown は content/kyuryo/<slug>.md に置く(guide はURL上の予約語で、ディレクトリには作らない)。
 * /kyuryo/ 直下・/kyuryo/pref/ 等は給料pSEO(P6)の予約領域。
 */
definePageMeta({
  validate: (route) => {
    const slug = String(route.params.slug)
    return !(RESERVED_SLUGS as readonly string[]).includes(slug) && /^[a-z0-9-]+$/.test(slug)
  },
})

const route = useRoute()
const slug = String(route.params.slug)

const { data: doc } = await useAsyncData(`article-kyuryo-${slug}`, () =>
  queryContent<ArticleDocument>().where({ _path: `/kyuryo/${slug}` }).findOne(),
)

if (!doc.value || doc.value.cluster !== 'kyuryo' || !isPublishable(doc.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}
</script>

<template>
  <ArticleView v-if="doc" :doc="doc" :slug="slug" />
</template>
