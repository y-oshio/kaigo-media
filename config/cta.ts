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
  // C2 資格: 主CTA=かいご畑・講座資料請求(07章)— ASP未契約のため未設定
  shikaku: null,
  // C4 悩み・転職: 主CTA=エージェント直(07章)— ASP未契約の間は補助CTAの診断を暫定表示
  tenshoku: {
    headline: 'あなたに合う施設タイプがわかる「介護タイプ診断」',
    description: '15問・約3分。8タイプから、向いている職場の特徴と転職先選びの目安がわかります(無料・登録不要)。',
    buttonLabel: '介護タイプ診断をはじめる',
    to: { type: 'internal', path: '/shindan/' },
  },
  // C5 施設種別: 主CTA=診断(07章「あなたはどの施設向き?」で自分事化)
  shisetsu: {
    headline: 'この施設タイプ、あなたに合っている?',
    description: '15問・約3分の介護タイプ診断で、8タイプから向いている職場の傾向を確認できます(無料・登録不要)。',
    buttonLabel: '介護タイプ診断で確かめる',
    to: { type: 'internal', path: '/shindan/' },
  },
  // C6 職種図鑑: 主CTA=資格記事へ回遊(07章)— 記事が貯まるまで未設定
  shokushu: null,
  // C3 給料: ASP未契約の間は補助CTAの診断を暫定表示(P6承認条件8 — 求人CTAは契約まで出さない)
  kyuryo: {
    headline: '給料だけで選ばない。あなたに合う職場タイプを知る',
    description:
      '同じ介護職でも、施設タイプによって働き方や手当は変わります。15問・約3分の介護タイプ診断で、向いている職場の傾向を確認できます(無料・登録不要)。',
    buttonLabel: '介護タイプ診断をはじめる',
    to: { type: 'internal', path: '/shindan/' },
  },
}

/**
 * 診断結果ページの求人CTAに使う案件 slug(07章 — aff-v1 では MC介護 = 'mc')。
 * A8.net 側で mamoribi.jp の媒体登録が完了し、data/affiliate-links.ts に実URLが
 * 登録されるまで、結果ページの求人CTAブロックは非表示になる(P7承認条件1)。
 */
export const SHINDAN_RESULT_OFFER_SLUG = 'mc'
