/**
 * 適性診断(/shindan/ — C7)の型定義。実装#6=P7 で aff-v1-kaigo-shindan から移植(03章 T7)。
 * データ本体は data/shindan/、スコアリングは utils/shindan.ts。
 */

/** 結果8タイプ(03章 §2 のURL slug と一致 — /shindan/result/<type>/) */
export type ResultType =
  | 'tokuyo'
  | 'rouken'
  | 'dayservice'
  | 'homecare'
  | 'paidhome'
  | 'nightshift'
  | 'beginner'
  | 'caremanager'

export type ScoreMap = Partial<Record<ResultType, number>>

export interface Choice {
  /** 選択肢の表示テキスト */
  label: string
  /** 各タイプへの加算スコア */
  scores: ScoreMap
}

export interface Question {
  id: number
  /** 質問テキスト */
  text: string
  choices: Choice[]
}

export interface ResultDetail {
  type: ResultType
  /** 例: 特別養護老人ホーム向き */
  name: string
  /** キャッチコピー */
  catchphrase: string
  /** 向いている理由 */
  reasons: string[]
  /** 向いている職場の特徴 */
  workplaceFeatures: string[]
  /** 注意点 */
  cautions: string[]
  /** おすすめの転職先条件 */
  recommendedConditions: string[]
}
