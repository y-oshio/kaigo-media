/**
 * URL 規則の定数化(設計書03章 §2 を正とする)。
 * 原則: 全URL小文字・ローマ字スラッグ・末尾スラッシュ統一・階層は原則3
 * (過去問の1問ページのみ4を許容)。一度公開したURLは変更しない。
 */

/** コンテンツクラスタ(記事 Markdown を置く第一階層) */
export const CONTENT_CLUSTERS = [
  'shikaku', // C2: 資格・研修
  'tenshoku', // C4: 悩み・退職・転職
  'shisetsu', // C5: 施設種別
  'shokushu', // C6: 職種図鑑
  'kyuryo', // C3: 給料系解説記事(URL は /kyuryo/guide/<slug>/)
] as const

export type ContentCluster = (typeof CONTENT_CLUSTERS)[number]

/**
 * 予約語スラッグ — データ駆動ページとの衝突を防ぐため、
 * 記事スラッグには使用禁止(全クラスタ共通。設計書03章 §2)。
 */
export const RESERVED_SLUGS = ['pref', 'job', 'guide'] as const

/** データ駆動セクションの第一階層 */
export const DATA_SECTIONS = {
  kakomon: '/kakomon/', // C1: 過去問エンジン
  kyuryo: '/kyuryo/', // C3: 給料統計
  shindan: '/shindan/', // C7: 適性診断(aff-v1 から移植予定)
  go: '/go/', // アフィリエイトリダイレクタ(robots Disallow・rel="sponsored nofollow")
} as const
