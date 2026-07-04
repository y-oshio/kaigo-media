/**
 * 文脈リンク対応表(設計書06章 §1)。
 * 過去問1問ページの4本目の内部リンク「文脈に合う記事」を科目→記事で管理する(03章 §3)。
 * 記事が公開され始めたら(実装#3 以降)投入する。
 */
export interface InternalLinkRule {
  subjectSlug: string // 科目(data/kakomon/subjects.ts 参照)
  articlePath: string // '/shikaku/<slug>/' 等、リンク先記事のURLパス
  anchorText: string // クエリ語彙に寄せたアンカーテキスト(「こちら」禁止 — 03章 §3)
}

export const internalLinkMap: InternalLinkRule[] = []
