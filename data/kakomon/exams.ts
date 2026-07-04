import type { Exam } from '~/types/kakomon'

/**
 * 試験マスタ(設計書06章 §2-1)。
 * copyrightStatus は T-0a(試験センターへの転載許諾照会)の回答で更新する。
 * 'confirmed' になるまで過去問ページは公開しない(R-01)。
 */
export const exams: Exam[] = [
  {
    slug: 'kaigofukushishi',
    name: '介護福祉士国家試験',
    questionCount: 125,
    administeredBy: '公益財団法人社会福祉振興・試験センター',
    copyrightStatus: 'pending',
  },
  {
    slug: 'caremane',
    name: '介護支援専門員実務研修受講試験(ケアマネ試験)',
    questionCount: 60,
    // 問題作成機関は介護福祉士と同一センター(設計書10章 T-0a)。照会時に正式表記を確認する
    administeredBy: '公益財団法人社会福祉振興・試験センター',
    copyrightStatus: 'pending',
  },
]
