/**
 * 過去問エンジンの型定義(設計書06章 §2-1 を正とする)。
 * データ本体は data/kakomon/ に置く。
 */

/** 試験マスタ */
export interface Exam {
  slug: 'kaigofukushishi' | 'caremane'
  name: string // 「介護福祉士国家試験」
  questionCount: number // 125 / 60
  administeredBy: string // 「公益財団法人社会福祉振興・試験センター」等(出典表記に使用)
  copyrightStatus: 'confirmed' | 'pending' | 'denied' // R-01 の確認状態を型で持つ
}

/** 回次マスタ(試験ハブの「合格点・合格率推移」、解答速報・合格点予想記事の源泉) */
export interface ExamRound {
  examSlug: Exam['slug']
  round: number // 第N回
  heldOn: string // '2026-01-25'(実施日)
  passingScore: number | null // 合格基準点(発表前は null)
  passRate: number | null // 合格率(%)
  applicants: number | null // 受験者数
  partSystem: boolean // 第38回以降の介護福祉士は true(A/B/Cパート合格制度)
  sourceUrl: string
  checkedAt: string // 確認日
}

/** 科目マスタ(URL /kakomon/<exam>/s/<slug>/ と1:1) */
export interface Subject {
  examSlug: Exam['slug']
  slug: string // 'ningen-no-songen' 等ヘボン式
  name: string // 「人間の尊厳と自立」
  part?: 'A' | 'B' | 'C' // パート区分(介護福祉士・第38回以降の絞り込み軸)
  order: number
}

/** 1問(exam-NN.json / drills/*.json の要素) */
export interface KakomonQuestion {
  origin: 'kakomon' | 'original' // original = オリジナル一問一答(プランB・非公開試験用)
  examSlug: Exam['slug']
  round?: number // 第N回(origin: 'kakomon' のみ。実施日等は ExamRound を参照)
  number?: number // 問1〜125(origin: 'kakomon' のみ)
  topicSlug?: string // origin: 'original' のみ(/drill/<topic>/ と対応)
  subjectSlug: string
  stem: string // 問題文(過去問は原文。改変禁止)
  choices: string[] // 選択肢1〜5
  correctIndex: number // 0-4。過去問は公式正答表と人手突合済みであること
  explanation: {
    why: string // 正解の根拠(300字以上 — 04章 F1 の定量下限)
    whyNotOthers: string[] // 誤答理由(選択肢順・各1文以上)
    tips?: string // 覚え方
    lawUpdateNote?: string // 制度改定注記(「現行制度では〜」)
  }
  supervisorId?: string // 監修者(data/authors.ts 参照)
  reviewedAt?: string // 監修完了日
  status: 'draft' | 'fact-checked' | 'reviewed' | 'published' | 'excluded'
  // excluded = 第三者著作物を含む等で非掲載(欠番)。URLを発行せず、一覧に「非掲載(権利処理)」表示(03章)
}
