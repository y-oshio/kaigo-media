import type { StatSource } from '~/types/kyuryo'

/**
 * 統計出典マスタ(設計書06章 §2-2・§3)。
 * 統計値(salary-*.json)より先にここへ出典を登録し、SalaryStat.sourceId から参照する。
 * 注意: 調査ごとの定義差(「きまって支給する現金給与額」vs「平均給与額」)を
 * definitionNote に必ず書き、異なる調査の数値を同一表に並べない(06章 §3)。
 * 投入は給料統計エンジン実装(実装#10)時に行う。
 */
export const statSources: StatSource[] = []
