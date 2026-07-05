import type { ContentCluster } from '~/config/routes'

/**
 * 記事 frontmatter スキーマ(設計書06章 §2-4、V2 26章の誠実性原則を反映)。
 * content/ 配下の Markdown はこのスキーマに従う。
 *
 * 公開ゲート(実装#4=P3): sources が1件以上あり、全件に checkedAt があること。
 * 満たさない記事はページを生成しない(404)— utils/article.ts の publishBlockers() が判定の唯一の実装。
 */

/** 出典(一次情報主義 — 統計・制度への言及は必ず出典と確認日を残す) */
export interface ArticleSource {
  /** 出典名(例: 令和6年度介護従事者処遇状況等調査) */
  name: string
  /** 出典URL(紙資料等でURLがない場合のみ省略可) */
  url?: string
  /** 発行元(例: 厚生労働省) */
  publisher?: string
  /** 内容を確認した日(YYYY-MM-DD)— 必須。無い記事は公開不可 */
  checkedAt: string
}

export interface ArticleFrontmatter {
  title: string
  description: string
  /** 所属クラスタ(配置ディレクトリと一致していること) */
  cluster: ContentCluster
  /** 想定検索クエリ(カニバリ管理用 — 06章 §2-4) */
  targetQueries: string[]
  /**
   * 執筆者・監修者は data/authors.ts の id を参照する。
   * 未設定・未登録の間は AuthorBox が「準備中」表示になる(架空人物の生成は禁止 — 04章)。
   */
  authorId?: string
  supervisorId?: string
  /** 監修日(YYYY-MM-DD)。supervisorId がある場合のみ意味を持つ */
  reviewedAt?: string
  publishedAt: string
  updatedAt?: string
  /** 出典リスト — 1件以上&全件 checkedAt 必須(公開ゲート) */
  sources: ArticleSource[]
  /**
   * アフィリエイト・広告リンクを含む記事は true(07章)。
   * true の記事は本文冒頭にPR表記が自動表示される。
   */
  prRelated?: boolean
}
