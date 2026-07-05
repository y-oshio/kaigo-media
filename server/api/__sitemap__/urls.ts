import { defineEventHandler } from 'h3'
import { serverQueryContent } from '#content/server'
import { CLUSTER_META, articlePath } from '~~/config/routes'
import type { ContentCluster } from '~~/config/routes'
import { publishBlockers } from '~~/utils/article'
import type { ArticleDocument } from '~~/utils/article'

/**
 * 記事系URLの sitemap ソース(@nuxtjs/sitemap の `sources` から参照)。
 * - 公開ゲート(sources/checkedAt 必須)を通過した記事だけを載せる
 * - クラスタ一覧ページは公開記事が1件以上あるクラスタだけ載せる(空ページを検索に出さない)
 * 固定ページ(/ /about/ など)はモジュールが pages/ から自動収集する。
 */
export default defineEventHandler(async (event) => {
  const docs = await serverQueryContent<ArticleDocument>(event)
    .only(['_path', 'title', 'description', 'cluster', 'publishedAt', 'updatedAt', 'sources'])
    .find()

  // content/<cluster>/<slug>.md 以外(README 等)は対象外
  const published = docs.filter(
    (doc) =>
      /^\/[a-z]+\/[a-z0-9-]+$/.test(String(doc._path ?? '')) &&
      typeof doc.cluster === 'string' &&
      doc.cluster in CLUSTER_META &&
      publishBlockers(doc).length === 0,
  )

  const urls: { loc: string; lastmod?: string }[] = published.map((doc) => {
    const slug = String(doc._path).split('/').pop() as string
    return {
      loc: articlePath(doc.cluster as ContentCluster, slug),
      lastmod: doc.updatedAt ?? doc.publishedAt,
    }
  })

  const clustersWithArticles = [...new Set(published.map((doc) => doc.cluster as ContentCluster))]
  for (const cluster of clustersWithArticles) {
    urls.push({ loc: CLUSTER_META[cluster].indexPath })
  }

  return urls
})
