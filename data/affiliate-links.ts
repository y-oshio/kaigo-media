import type { AffiliateLink } from '~/types/affiliate'

/**
 * /go/<slug> マスタ。リダイレクタ本体・案件登録は実装#4 で aff-v1 から移植する。
 * /go/ へ向かうリンクは全ページで rel="sponsored nofollow" 必須(設計書05章 §3)。
 */
export const affiliateLinks: AffiliateLink[] = []
