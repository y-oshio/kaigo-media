/**
 * /go/<slug> アフィリエイトリダイレクタの型定義。
 * リダイレクタ本体は実装#4 で aff-v1 から移植する(移植時に robots.txt Disallow と
 * リンク側 rel="sponsored nofollow" を追加 — 設計書05章 §3・10章 実装#4)。
 */
export interface AffiliateLink {
  slug: string // /go/<slug> の slug
  name: string // 案件名(管理用)
  url: string // 遷移先(ASPのアフィリエイトURL)
  active: boolean // false なら 404(掲載終了案件)
}
