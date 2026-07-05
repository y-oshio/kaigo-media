import { defineEventHandler } from 'h3'
import { serverQueryContent } from '#content/server'
import { CLUSTER_META, articlePath } from '~~/config/routes'
import type { ContentCluster } from '~~/config/routes'
import { publishBlockers } from '~~/utils/article'
import type { ArticleDocument } from '~~/utils/article'
import {
  PREF_SALARY_REGISTRY,
  getSalaryStat,
  KYURYO_JOB_SLUG,
  publishablePrefSalary,
} from '~~/utils/kyuryo'

/**
 * 記事系・給料pSEO系URLの sitemap ソース(@nuxtjs/sitemap の `sources` から参照)。
 * - 公開ゲート(sources/checkedAt 必須)を通過した記事だけを載せる
 * - クラスタ一覧ページは公開記事が1件以上あるクラスタだけ載せる(空ページを検索に出さない)
 * - 給料ハブ /kyuryo/ は承認済みC2データがあるときだけ載せる
 * - /kyuryo/pref/<pref>/ は「null率ゲート通過+関連ガイド本数ゲート(noindex解除)」を
 *   満たすときだけ載せる(pages/kyuryo/pref/[pref].vue の indexable 判定と同一条件)
 * 固定ページもここで列挙する(nuxt.config で excludeAppSources: true —
 * 自動収集はゲートを素通りするため無効化。indexable な固定ページを増やしたらここに追加)。
 */

/** 常時掲載する固定ページ(noindex ページ /shindan/start/ 等は載せない — 05章 §3) */
const STATIC_PAGES = [
  '/',
  '/about/',
  '/editorial-policy/',
  '/privacy/',
  '/terms/',
  '/contact/',
  '/shindan/',
]

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

  const urls: { loc: string; lastmod?: string }[] = STATIC_PAGES.map((loc) => ({ loc }))

  urls.push(...published.map((doc) => {
    const slug = String(doc._path).split('/').pop() as string
    return {
      loc: articlePath(doc.cluster as ContentCluster, slug),
      lastmod: doc.updatedAt ?? doc.publishedAt,
    }
  }))

  const clustersWithArticles = [...new Set(published.map((doc) => doc.cluster as ContentCluster))]
  for (const cluster of clustersWithArticles) {
    urls.push({ loc: CLUSTER_META[cluster].indexPath })
  }

  // 給料pSEO(P6): ハブは承認済みデータがあれば掲載
  if (getSalaryStat(null, KYURYO_JOB_SLUG)) {
    urls.push({ loc: '/kyuryo/' })

    // 都道府県ページは関連ガイド本数ゲートを満たす(=index可)ときのみ掲載
    const kyuryoGuideCount = published.filter((doc) => doc.cluster === 'kyuryo').length
    if (kyuryoGuideCount >= PREF_SALARY_REGISTRY.gate.contextGuideLinksMin) {
      for (const { pref, stat } of publishablePrefSalary()) {
        urls.push({ loc: `/kyuryo/pref/${pref.slug}/`, lastmod: stat.updatedAt })
      }
    }
  }

  return urls
})
