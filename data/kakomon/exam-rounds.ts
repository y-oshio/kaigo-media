import type { ExamRound } from '~/types/kakomon'

/**
 * 回次マスタ(設計書06章 §2-1)。
 * 実施日・合格点・合格率は必ず一次出典(試験センター公表資料)から転記し、
 * sourceUrl と checkedAt を必ず埋める。推計・記憶による記入は禁止(捏造禁止原則)。
 * 投入は過去問エンジン実装(実装#9)時に行う。
 */
export const examRounds: ExamRound[] = []
