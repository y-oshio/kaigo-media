import type { Subject } from '~/types/kakomon'

/**
 * 科目マスタ(設計書06章 §2-1)。URL /kakomon/<exam>/s/<slug>/ と1:1 で対応し、
 * スラッグは一度公開したら変更しない(03章 URL原則)。
 * 科目名・パート区分は試験センターの公表資料と突合してから投入する(実装#9)。
 */
export const subjects: Subject[] = []
