/**
 * 給料統計エンジンの型定義(設計書06章 §2-2 を正とする)。
 * データ本体は data/kyuryo/ に置く。
 */

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
 * 一意キー: (prefSlug, jobSlug, surveyYear, sourceId)。過去年度のレコードは削除せず保持し、
 * T5 テンプレートの推移グラフと「前年値との差分レポート」の源泉にする。
 *
 * null 許容が重要: 出典統計に存在しない粒度の数値を推計で埋めない(捏造禁止)。
 * null の場合ページ側は「全国値+当該県の関連情報」で構成する。
 */
export interface SalaryStat {
  prefSlug?: string // 'hokkaido' 等(都道府県軸。将来の pref×job 直交にも対応)
  jobSlug?: string // 'kaigofukushishi' 等(職種・資格軸)。どちらか一方のみなら単軸ページ
  displayName: string
  surveyYear: number // 調査年度(2024 等)。前年比較・推移グラフ・差分レポートの前提
  monthlyAvg: number | null // 平均給与額(円)。出典に値がない場合は null(捏造禁止)
  breakdown?: { base?: number; bonusMonthly?: number }
  sourceId: string // StatSource 参照
  notes?: string
}
