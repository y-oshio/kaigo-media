import type { Author } from '~/types/author'

/**
 * 執筆者・監修者マスタ(設計書06章 §2-3)。
 * 監修必須クラスタの記事は supervisorId が空だと公開できない(品質CI・実装#5)。
 * 監修者(role: supervisor)の確保は未決事項2(監修者予算)の決定後、個別に追加する。
 */
export const authors: Author[] = [
  {
    id: 'mamoribi-editorial',
    slug: 'editorial-team',
    name: 'マモリビ編集部',
    role: 'editor',
    isOrganization: true,
    credentials: ['AI編集部運営(事実確認・出典確認・公開判断は人間が実施)'],
    bio:
      '介護の仕事に関わる読者の意思決定に役立つ、正確で誠実な情報の提供を目的に記事を制作しています。' +
      '給料・制度など検証可能な事実は一次情報(政府統計・法令・公的機関の発表)を出典とし、出典名と確認日を明記します。' +
      'コンテンツ制作の一部にAIを活用していますが、事実関係の検証・出典の確認・公開の最終判断は人間が行います' +
      '(詳しくは編集ポリシーをご覧ください)。',
  },
]
