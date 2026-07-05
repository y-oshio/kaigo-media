<script setup lang="ts">
import { CONTENT_CLUSTERS, RESERVED_SLUGS } from '~/config/routes'
import type { ArticleDocument } from '~/utils/article'

/**
 * 記事ページ /<cluster>/<slug>/(shikaku / tenshoku / shisetsu / shokushu)。
 * kyuryo クラスタの記事は /kyuryo/guide/<slug>/(pages/kyuryo/guide/[slug].vue)に出る。
 * 公開ゲート: sources(全件 checkedAt つき)がない記事はここで404になり公開されない。
 */
definePageMeta({
  validate: (route) => {
    const cluster = String(route.params.cluster)
    const slug = String(route.params.slug)
    return (
      (CONTENT_CLUSTERS as readonly string[]).includes(cluster) &&
      cluster !== 'kyuryo' &&
      !(RESERVED_SLUGS as readonly string[]).includes(slug) &&
      /^[a-z0-9-]+$/.test(slug)
    )
  },
})

const route = useRoute()
const cluster = String(route.params.cluster)
const slug = String(route.params.slug)

const { data: doc } = await useAsyncData(`article-${cluster}-${slug}`, () =>
  queryContent<ArticleDocument>().where({ _path: `/${cluster}/${slug}` }).findOne(),
)

if (
  !doc.value ||
  doc.value.cluster !== cluster || // 配置ディレクトリと frontmatter の cluster 不一致は公開しない
  !isPublishable(doc.value)
) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}
</script>

<template>
  <ArticleView v-if="doc" :doc="doc" :slug="slug" />
</template>
