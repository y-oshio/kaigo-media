import type { AffiliateLink } from '~/types/affiliate'

/**
 * /go/<slug> マスタ(リダイレクタ = server/routes/go/[...slug].ts — 実装#5=P4)。
 * 未登録・inactive の slug は404になる。
 * **実在のASP契約が成立した案件のみ登録する。架空の案件・仮URLの登録は禁止**(04章)。
 * /go/ へ向かうリンクは全ページで rel="sponsored nofollow" 必須(設計書05章 §3。
 * 記事本文中は components/content/ProseA.vue が自動付与、CTA枠は CtaSlot.vue が付与)。
 */
export const affiliateLinks: AffiliateLink[] = []
