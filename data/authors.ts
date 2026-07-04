import type { Author } from '~/types/author'

/**
 * 執筆者・監修者マスタ(設計書06章 §2-3)。
 * 監修必須クラスタの記事は supervisorId が空だと公開できない(品質CI・実装#5)。
 * 監修者の確保は未決事項2(監修者予算)の決定後。
 */
export const authors: Author[] = []
