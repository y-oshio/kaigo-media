import type { ContentCluster } from './routes'

/**
 * クラスタ別CTA設定(設計書07章・実装#5=P4)。
 * 記事テンプレートの CtaSlot がこの表を参照して描画する。
 *
 * 運用規則:
 * - `to.type: 'go'` は data/affiliate-links.ts に登録済み(active)の slug のみ有効。
 *   未登録なら CtaSlot は何も表示しない(壊れたCTAを出さない)。
 * - `to.type: 'internal'` は実装済みの内部ページのみ指定する。
 * - null = そのクラスタのCTAは未定(何も表示しない)。
 * - **架空の案件・サービス名をここに書かない**(04章)。実契約・実装完了後に設定する。
 */
export interface ClusterCta {
  /** CTA枠の見出し(例: あなたに合う職場を探す) */
  headline: string
  description: string
  buttonLabel: string
  to: { type: 'go'; slug: string } | { type: 'internal'; path: string }
}

export const CLUSTER_CTA: Record<ContentCluster, ClusterCta | null> = {
  // 診断(/shindan/)は aff-v1 から移植後に internal CTA を設定する(P7)
  shikaku: null,
  tenshoku: null,
  shisetsu: null,
  shokushu: null,
  kyuryo: null,
}
