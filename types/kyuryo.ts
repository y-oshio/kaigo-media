/**
 * 給料統計エンジンの型定義(設計書06章 §2-2 を V3 31章で KbMeta 適合に拡張)。
 * データ本体は data/kyuryo/ に置く。
 */

import type { KbMeta } from './kb'

/** 統計出典マスタ */
export interface StatSource {
  id: string // 'shogu-r6'
  surveyName: string // 「令和6年度介護従事者処遇状況等調査」
  publisher: string // 「厚生労働省」
  url: string // 公表ページURL
  surveyPoint: string // 「令和6年9月時点」
  checkedAt: string // 確認日 '2026-07-04'
  nextExpectedRelease?: string // 次回公表見込み(更新カレンダー用)
  definitionNote: string // 「平均給与額=基本給+手当+一時金(4〜9月支給額の1/6)」等の定義差注記
}

/**
 * 都道府県別・職種別の統計値(surveyYear を含む複合キーで履歴を保持 — 年次更新で上書きしない)。
 * 一意キー: (prefSlug, jobSlug, surveyYear, sourceIds[0])。過去年度のレコードは削除せず保持し、
 * T5 テンプレートの推移グラフと「前年値との差分レポート」の源泉にする。
 *
 * null 許容が重要: 出典統計に存在しない粒度の数値を推計で埋めない(捏造禁止)。
 * null の場合ページ側は「全国値+当該県の関連情報」で構成する。
 */
export interface SalaryStat extends KbMeta {
  // id は複合キーからの決定的導出: `c2-<sourceIds[0]>-<prefSlug ?? 'all'>-<jobSlug ?? 'all'>-<surveyYear>`
  // (V3 31章 §1 ID規約。kb-lint が導出規則と一意性を検査する)
  prefSlug?: string // 'hokkaido' 等(都道府県軸 — data/kb/prefectures.ts 参照)
  jobSlug?: string // 'kaigoshoku' 等(職種軸 — data/kb/jobs.ts 参照)。どちらか一方のみなら単軸
  facilitySlug?: string // 施設形態軸(V3 31章 — 処遇状況等調査の施設種別データ用。P6では未使用)
  displayName: string
  surveyYear: number // 調査年(2025 等)。前年比較・推移グラフ・差分レポートの前提
  monthlyAvg: number | null // きまって支給する現金給与額(円)。出典に値がない場合は null(捏造禁止)
  scheduledMonthly: number | null // 所定内給与額(円)
  annualBonus: number | null // 年間賞与その他特別給与額(円)
  avgAge: number | null // 平均年齢(歳)
  avgTenureYears: number | null // 平均勤続年数(年)
  scheduledHours: number | null // 所定内実労働時間数(時間/月)
  overtimeHours: number | null // 超過実労働時間数(時間/月)
  workerCount: number | null // 集計対象の労働者数(人)
}
