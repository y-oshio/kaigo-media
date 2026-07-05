import salaryJson from '~/data/kyuryo/salary-chingin-kouzou-r7.json'
import { statSources } from '~/data/kyuryo/sources'
import { prefectures } from '~/data/kb/prefectures'
import { pseoRegistry } from '~/data/kb/pseo-registry'
import type { SalaryStat, StatSource } from '~/types/kyuryo'
import type { Prefecture, PseoRegistryEntry } from '~/types/kb'

/**
 * 給料統計エンジン(P6=実装#7)。C2 レコードの参照と公開ゲート判定の唯一の実装。
 * - 参照できるのは status が verified / published のレコードのみ
 *   (draft は人間承認前 — V3 32章。昇格は npm run kb-promote)
 * - ゲート規則(null率)を変えたら scripts/verify-kyuryo-c2.mjs のレポートも更新する
 */

const allStats = salaryJson as unknown as SalaryStat[]

/** 人間承認済み(サイトから参照してよい)レコードのみ */
const stats = allStats.filter((r) => r.status === 'verified' || r.status === 'published')

/** E7 レジストリ: #1 都道府県×介護職 */
export const PREF_SALARY_REGISTRY: PseoRegistryEntry = pseoRegistry.find(
  (e) => e.id === 'kyuryo-pref-kaigoshoku',
)!

export const KYURYO_JOB_SLUG = 'kaigoshoku'

/** 収録中の最新調査年(参照可能レコードが無い間は null) */
export function latestSurveyYear(): number | null {
  if (stats.length === 0) return null
  return Math.max(...stats.map((r) => r.surveyYear))
}

export function getSalaryStat(prefSlug: string | null, jobSlug: string): SalaryStat | undefined {
  const year = latestSurveyYear()
  if (year === null) return undefined
  return stats.find(
    (r) =>
      r.surveyYear === year &&
      r.jobSlug === jobSlug &&
      (prefSlug === null ? r.prefSlug === undefined : r.prefSlug === prefSlug),
  )
}

export function getStatSource(sourceId: string): StatSource | undefined {
  return statSources.find((s) => s.id === sourceId)
}

/** 公開ゲート条件1(E7: 主要数値フィールドの null 率 ≦ nullRateMax) */
export function passesNullRateGate(rec: SalaryStat): boolean {
  const { primaryFields, nullRateMax } = PREF_SALARY_REGISTRY.gate
  const nulls = primaryFields.filter((f) => rec[f as keyof SalaryStat] === null).length
  return nulls / primaryFields.length <= nullRateMax
}

/** #1 で生成してよい都道府県(承認済みデータあり+null率ゲート通過)。表示順 = 県コード順 */
export function publishablePrefSalary(): { pref: Prefecture; stat: SalaryStat }[] {
  const out: { pref: Prefecture; stat: SalaryStat }[] = []
  for (const pref of prefectures) {
    const stat = getSalaryStat(pref.slug, KYURYO_JOB_SLUG)
    if (stat && passesNullRateGate(stat)) out.push({ pref, stat })
  }
  return out
}

/** monthlyAvg の全国順位(高い順・値のある県のみ)。対象外は null */
export function prefRank(prefSlug: string): { rank: number; total: number } | null {
  const ranked = publishablePrefSalary()
    .filter(({ stat }) => stat.monthlyAvg !== null)
    .sort((a, b) => (b.stat.monthlyAvg ?? 0) - (a.stat.monthlyAvg ?? 0))
  const idx = ranked.findIndex(({ pref }) => pref.slug === prefSlug)
  return idx === -1 ? null : { rank: idx + 1, total: ranked.length }
}

/** 年収の目安(きまって支給×12+年間賞与)。どちらか欠けたら null(推計しない) */
export function estimatedAnnual(rec: SalaryStat): number | null {
  if (rec.monthlyAvg === null || rec.annualBonus === null) return null
  return rec.monthlyAvg * 12 + rec.annualBonus
}

/** 27万7,700円 形式(万未満は円区切りで正確に表示 — 丸めによる誇張をしない) */
export function formatManYen(yen: number): string {
  const man = Math.floor(yen / 10000)
  const rest = yen % 10000
  if (man === 0) return `${rest.toLocaleString('ja-JP')}円`
  return rest === 0 ? `${man}万円` : `${man}万${rest.toLocaleString('ja-JP')}円`
}

/** 約388万円 形式(年収目安など「目安」表示専用。四捨五入を「約」で明示) */
export function formatApproxManYen(yen: number): string {
  return `約${Math.round(yen / 10000)}万円`
}
