import type { ParsedContent } from '@nuxt/content'
import type { ArticleFrontmatter } from '~/types/article'

/** Nuxt Content が返す記事ドキュメント(本文AST + frontmatter) */
export type ArticleDocument = ParsedContent & ArticleFrontmatter

/**
 * 公開ゲート(V2 26章 誠実性原則+P3承認条件)。
 * 記事ページ・一覧・sitemap はすべてこの判定を通す。
 * scripts/content-lint.mjs も同じ規則で検査する(変更時は両方を更新すること)。
 *
 * @returns 公開をブロックする理由の配列(空 = 公開可)
 */
export function publishBlockers(doc: Partial<ArticleDocument>): string[] {
  const blockers: string[] = []
  if (!doc.title) blockers.push('title がありません')
  if (!doc.description) blockers.push('description がありません')
  if (!doc.publishedAt) blockers.push('publishedAt がありません')
  if (!Array.isArray(doc.sources) || doc.sources.length === 0) {
    blockers.push('sources が1件もありません(出典のない記事は公開不可)')
  } else {
    doc.sources.forEach((source, i) => {
      if (!source?.name) blockers.push(`sources[${i}] に name がありません`)
      if (!source?.checkedAt) blockers.push(`sources[${i}] に checkedAt(確認日)がありません`)
    })
  }
  return blockers
}

export function isPublishable(doc: Partial<ArticleDocument>): boolean {
  return publishBlockers(doc).length === 0
}
