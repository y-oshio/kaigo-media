/**
 * 試験・ドリルエンジンの型定義(設計書06章 §2-1 を V2 26章 §4・V3 31章で拡張)。
 * データ本体: 試験マスタ・回次・科目 = data/kakomon/、ドリル = data/drill/(V2 26章 §3)。
 * /kakomon/(過去問転載)は凍結中 — 正式許諾の書面取得までデータ投入・実装をしない(V2)。
 */

import type { KbMeta } from './kb'

/** 試験マスタ */
export interface Exam {
  slug: 'kaigofukushishi' | 'caremane'
  name: string // 「介護福祉士国家試験」
  questionCount: number // 125 / 60
  administeredBy: string // 「公益財団法人社会福祉振興・試験センター」等(出典表記に使用)
  copyrightStatus: 'confirmed' | 'pending' | 'denied' // R-01 の確認状態を型で持つ
}

/** 回次マスタ(試験ハブの「合格点・合格率推移」「ボーダー考察」の源泉 = KB C4) */
export interface ExamRound {
  examSlug: Exam['slug']
  round: number // 第N回
  heldOn: string // '2026-01-25'(実施日)
  passingScore: number | null // 合格基準点(発表前は null)
  sectionScores?: {
    // ケアマネは分野別2本の合格基準(介護支援/保健医療福祉サービス)。介護福祉士は passingScore 単一値のまま
    section: string
    passingScore: number
    maxScore: number
  }[]
  passRate: number | null // 合格率(%)
  applicants: number | null // 受験者数
  partSystem: boolean // 第38回以降の介護福祉士は true(A/B/Cパート合格制度)
  sourceUrl: string // TODO(KB-1): C1/D4 出典マスタ整備後に sourceIds 参照へ移行(V3 31章 §1 移行表)
  checkedAt: string // 確認日
}

/** 科目マスタ(ドリル: /shiken/<exam>/drill/<slug>/、過去問(凍結): /kakomon/<exam>/s/<slug>/ と1:1) */
export interface Subject {
  examSlug: Exam['slug']
  slug: string // 'ningen-no-songen' 等ヘボン式
  name: string // 「人間の尊厳と自立」
  part?: 'A' | 'B' | 'C' // パート区分(介護福祉士・第38回以降の絞り込み軸)
  order: number
}

/**
 * ドリル論点マスタ(KB D3。V2 26章 §4 — 論点ページ /shiken/<exam>/drill/<subject>/<topic>/ と1:1)。
 * 出題基準の項目名を丸写ししない(自分の言葉で再構成 — R-11)。
 * ライフサイクルは KbMeta.status で管理(V2 26章の 'review' は draft→verified の遷移で表現)。
 */
export interface DrillTopic extends KbMeta {
  examSlug: Exam['slug']
  subjectSlug: string
  topicSlug: string // URL・問題データファイル名と1:1
  name: string // 論点名(自分の言葉)
  summary: string // 論点解説の要旨(科目ページの一覧に表示)
  order: number
  tags: string[] // 関連論点リンク(26章 §3 内部リンク③)の素
  examBasisNote?: string // 出題基準のどの項目に対応するかのメモ(内部用・非表示)
  publishedAt?: string
}

/** 1問(過去問 exam-NN.json / ドリル data/drill/<subject>/<topic>.json の要素) */
export interface KakomonQuestion {
  /** 安定ID(V2 26章 §4)。例 'kfs-<subject>-<topic>-001'。
   *  差し替え時は欠番にしてIDを再利用しない(localStorage 学習履歴・正答率集計が壊れるため) */
  id: string
  origin: 'kakomon' | 'original' // original = オリジナルドリル(V2 の主力)。kakomon = 凍結中オプション
  examSlug: Exam['slug']
  round?: number // 第N回(origin: 'kakomon' のみ。実施日等は ExamRound を参照)
  number?: number // 問1〜125(origin: 'kakomon' のみ)
  topicSlug?: string // origin: 'original' のみ(DrillTopic.topicSlug と対応)
  subjectSlug: string
  stem: string // 問題文(過去問は原文。改変禁止。ドリルはクリーンルーム生成 — V2 26章 §5 工程2)
  choices: string[] // 選択肢1〜5
  correctIndex: number // 0-4。過去問は公式正答表と人手突合済みであること
  explanation: {
    why: string // 正解の根拠(300字以上 — 04章 F1 / V2 26章 F1' の定量下限)
    whyNotOthers: string[] // 誤答理由(選択肢順・各1文以上)
    tips?: string // 覚え方
    lawUpdateNote?: string // 制度改定注記(「現行制度では〜」)
  }
  supervisorId?: string // 監修者(data/authors.ts 参照。科目適性のある監修者 — V2 26章 §5 工程5)
  reviewedAt?: string // 監修完了日
  similarityCheckedAt?: string // 類似性チェック完了日(V2 26章 §5 工程4: 機械前段→高類似のみ目視)
  /** 制作工程の状態。KbMeta.status(ライフサイクル)と衝突するため workflowStatus に改名(V3 31章 §1 移行表) */
  workflowStatus: 'draft' | 'fact-checked' | 'reviewed' | 'published' | 'excluded'
  // excluded = 権利処理・差し替え等で非掲載(欠番)。URLを発行せず、一覧に「非掲載」表示(03章)
}
