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

/* ------------------------------------------------------------------
 * KB-1(V3 35章 — P6 と同時導入)のエンティティ型。
 * L1 エンティティは slug = id・公開後変更禁止(31章 §1 参照規約)。
 * A1 資格・A3 施設形態は消費者が2つ未満のため未導入(YAGNIゲート)。
 * ------------------------------------------------------------------ */

/** A4 都道府県マスタ(data/kb/prefectures.ts)。級地は保持しない(31章 §2 パネル K-02) */
export interface Prefecture extends KbMeta {
  slug: string // = id。'hokkaido' 等(URL・統計ジョインのキー。公開後変更禁止)
  name: string // '北海道'
  jisCode: string // JIS X 0401 都道府県コード '01'〜'47'
  region: string // ハブの地方別グルーピング表示用('北海道' '東北' '関東' 等)
}

/** A2 職種マスタ最小版(data/kb/jobs.ts — 給料pSEOに必要な範囲のみ) */
export interface JobRole extends KbMeta {
  slug: string // = id。'kaigoshoku' 等
  name: string // '介護職員(医療・福祉施設等)'
  shortName: string // 見出し・パンくず用の短い呼称('介護職員' 等)
  description: string // 業務範囲の要約(自分の言葉 — 逐語コピー禁止)
  /** 統計表上の職種名との対応(調査ごとに名称が違うためジョイン辞書として保持) */
  statLabels: { sourceId: string; label: string }[]
}

/**
 * E7 pSEOページ群レジストリ(data/kb/pseo-registry.ts)。
 * 結合式 J をコードではなくデータとして保持する(V3 34章 §1)。
 * 25章の台帳と1:1。条件0(データ実在確認)の記録もここに残す。
 */
export interface PseoRegistryEntry extends KbMeta {
  slug: string // = id。'kyuryo-pref-kaigoshoku' 等
  ledgerRef: string // V2 25章 台帳の対応('V2-25 §1 #1' 等)
  templateId: string // ページテンプレートの識別子('T5-pref-salary' 等)
  urlPattern: string // '/kyuryo/pref/:prefSlug/' 等(公開後変更禁止)
  datasets: KbDatasetId[] // 参照データセット
  join: string // 結合式の宣言(人間可読。例 'A4 ⋈ C2(jobSlug=kaigoshoku, surveyYear=latest)')
  /** シンコンテンツ公開ゲート(V2 25章 §4)の機械判定パラメータ */
  gate: {
    nullRateMax: number // 条件1: 主要数値フィールドの null 率がこれを超える組み合わせは生成しない
    primaryFields: string[] // null 率の分母になる主要数値フィールド
    uniqueBlockMinChars: number // 条件2: 編集部解説の最低文字数(400)
    contextGuideLinksMin: number // 条件2: 関連ガイドへの文脈リンク本数(満たすまで noindex)
  }
}

/** E2 更新カレンダー(data/update-calendar.ts — 公表予定→更新作業の台帳) */
export interface UpdateCalendarEntry extends KbMeta {
  title: string // '令和8年賃金構造基本統計調査(次回年次更新)' 等
  expectedAt: string // 公表・施行の見込み時期 'YYYY-MM'
  targetDatasets: KbDatasetId[] // 更新対象のKBデータセット
  action: string // 何をするか(手順の要約・参照すべきスクリプト)
}
