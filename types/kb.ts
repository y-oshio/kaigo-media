/**
 * Knowledge Base 共通型(設計書V3 31章 §1 を正とする)。
 * KB = data/ 配下の構造化レコードの総体。全レコードが本エンベロープを持つ。
 * 実データの投入は各KBフェーズ(V3 35章)で行う — 本ファイルは型定義のみ。
 */

/** レコードのライフサイクル(V3 32章 §2)
 *  draft → verified(出典突合済・人間承認) → published(サイト参照中)
 *  → stale(鮮度切れ: CIが自動遷移) / archived(欠番。物理削除はしない) */
export type KbStatus = 'draft' | 'verified' | 'published' | 'stale' | 'archived'

/** データセットID(V3 31章 §2 カタログと1:1。typo防止のためunionで固定) */
export type KbDatasetId =
  // A: エンティティ層
  | 'A1' // 資格マスタ
  | 'A2' // 職種マスタ
  | 'A3' // 施設形態マスタ
  | 'A4' // 都道府県マスタ
  | 'A5' // 監修者・執筆者(data/authors.ts)
  | 'A6' // 求人属性タクソノミ(語彙統一用。求人DBは持たない)
  // B: 制度・法令層
  | 'B1' // 法令マスタ
  | 'B2' // 介護保険制度トピック
  | 'B3' // 加算マスタ(+B3b KasanRate 子レコード)
  | 'B4' // 制度改正イベント
  // C: 統計層
  | 'C1' // 統計出典マスタ(data/kyuryo/sources.ts)
  | 'C2' // 給与統計
  | 'C3' // 労働統計
  | 'C4' // 試験統計(data/kakomon/exam-rounds.ts)
  | 'C5' // 税・社会保険料率
  // D: コンテンツ知識層
  | 'D1' // 用語集(略語含む)
  | 'D2' // FAQ
  | 'D3' // 試験・ドリル(論点・問題)
  | 'D4' // 参考文献マスタ
  | 'D5' // 画像・図表アセット
  | 'D6' // 独自一次データ(正答率・診断集計)
  // E: 運用・関係層
  | 'E1' // キーワード・クエリ台帳
  | 'E2' // 更新カレンダー
  | 'E3' // エンティティ関係グラフ
  | 'E4' // ASP案件マスタ(data/affiliate-links.ts)
  | 'E5' // スクール・講座データ(R-14 対象)
  | 'E6' // 診断定義
  | 'E7' // pSEOページ群レジストリ

/** レコード間参照は常に {dataset, id}。slug 参照は禁止(V3 31章 §1 参照規約) */
export interface KbRef {
  dataset: KbDatasetId
  id: string
}

/**
 * 全KBレコード共通の必須メタ(V3 31章 §1)。
 * - id: 安定ID(不変・欠番運用・再利用禁止)。統計系は複合キーからの決定的導出。
 *   L1 エンティティ(A1〜A4・A6)は slug = id とし公開後変更禁止。
 * - sourceIds: 出典(C1/D4 のID参照)。L2 ファクトは1つ以上必須(出典なしのファクトはCIが弾く)。
 * - 捏造禁止: 出典に存在しない粒度の数値を推計で埋めない(null許容 — V1 06章の原則)。
 */
export interface KbMeta {
  id: string
  sourceIds: string[]
  checkedAt: string // 出典を最後に確認した日 'YYYY-MM-DD'
  validFrom?: string // 制度系: 適用開始
  validUntil?: string // 制度系: 失効日(未設定 = 現行を主張 → 鮮度検知の対象)
  updatedAt: string
  status: KbStatus
  note?: string
}
