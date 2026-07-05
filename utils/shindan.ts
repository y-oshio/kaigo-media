import type { Question, ResultType } from '~/types/shindan'
import { allResultTypes } from '~/data/shindan/results'

/**
 * 診断スコアリング(aff-v1 から移植 — ロジックは同一)。
 * 加点式: 各選択肢が複数タイプに1〜3点を散らし、合計最高点のタイプを結果とする。
 */

/** 回答配列(各要素は選んだ choice の index)からタイプ別スコアを集計する */
export function calculateScores(
  questions: Question[],
  answers: number[],
): Record<ResultType, number> {
  const totals = allResultTypes.reduce(
    (acc, t) => {
      acc[t] = 0
      return acc
    },
    {} as Record<ResultType, number>,
  )

  questions.forEach((q, i) => {
    const chosenIndex = answers[i]
    if (chosenIndex == null) return
    const choice = q.choices[chosenIndex]
    if (!choice) return
    for (const [k, v] of Object.entries(choice.scores) as [ResultType, number][]) {
      totals[k] = (totals[k] ?? 0) + (v ?? 0)
    }
  })

  return totals
}

/** 最もスコアの高いタイプを返す。同点は results 定義順で先に出てきたものが勝つ */
export function pickTopType(scores: Record<ResultType, number>): ResultType {
  let topType: ResultType = allResultTypes[0]
  let topScore = -Infinity
  for (const t of allResultTypes) {
    const s = scores[t] ?? 0
    if (s > topScore) {
      topScore = s
      topType = t
    }
  }
  return topType
}

/** 質問配列+回答配列から診断結果タイプを返す */
export function diagnose(questions: Question[], answers: number[]): ResultType {
  return pickTopType(calculateScores(questions, answers))
}

/** URLパラメータ等の検証用型ガード */
export function isResultType(value: string): value is ResultType {
  return (allResultTypes as string[]).includes(value)
}
