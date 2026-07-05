import type { SalaryStat } from '~/types/kyuryo'
import { estimatedAnnual, formatApproxManYen, formatManYen } from '~/utils/kyuryo'

/**
 * 給料pSEOの編集部解説を統計値から決定的に生成する(P6承認条件7)。
 * - 入力(C2レコード)だけから同じ文章が再現される(AI・乱数・外部状態を使わない)
 * - 誇張表現を使わない: 値と差分の事実+読み方の注意のみを述べる
 * - 文章量はゲート条件2(最低400字)を満たすこと(scripts/verify-kyuryo-c2.mjs
 *   ではなくビルド検証で確認 — 数値により文が分岐するため全県で検査する)
 *
 * 統計値が変われば文章も自動で変わる(F-2)。文言を変更したら全県分の
 * 文字数と日本語の自然さを確認してからコミットする。
 */

interface ExplainInput {
  prefName: string // '北海道'
  stat: SalaryStat // 当該県の介護職員
  national: SalaryStat // 全国の介護職員
  rank: { rank: number; total: number } | null
  homon?: SalaryStat // 当該県の訪問介護従事者(データがある場合)
  homonNational?: SalaryStat
}

/** 差分の言い方(±1,000円未満は「ほぼ同じ水準」— 微差を強調しない) */
function diffPhrase(value: number, base: number): string {
  const diff = value - base
  if (Math.abs(diff) < 1000) return 'ほぼ同じ水準です'
  const dir = diff > 0 ? '高い' : '低い'
  return `${formatManYen(Math.abs(diff))}${dir}水準です`
}

export function prefSalaryExplanation(input: ExplainInput): string[] {
  const { prefName, stat, national, rank, homon, homonNational } = input
  const paragraphs: string[] = []

  // 1. 月給と全国比・順位(主要ファクト)
  if (stat.monthlyAvg !== null && national.monthlyAvg !== null) {
    let p =
      `令和7年賃金構造基本統計調査によると、${prefName}の介護職員(医療・福祉施設等、男女計)の` +
      `「きまって支給する現金給与額」は月${formatManYen(stat.monthlyAvg)}で、` +
      `全国平均の月${formatManYen(national.monthlyAvg)}と比べて${diffPhrase(stat.monthlyAvg, national.monthlyAvg)}。`
    if (rank) {
      p += `統計値が公表されている${rank.total}都道府県の中では高い順に${rank.rank}番目にあたります。`
    }
    paragraphs.push(p)
  }

  // 2. 所定内給与・超過労働分(内訳の読み方)
  if (stat.scheduledMonthly !== null && stat.monthlyAvg !== null) {
    const overtimePay = stat.monthlyAvg - stat.scheduledMonthly
    let p =
      `このうち残業代など超過労働分を除いた「所定内給与額」は月${formatManYen(stat.scheduledMonthly)}です。` +
      `きまって支給する現金給与額との差(${formatManYen(overtimePay)})が、夜勤・残業などの超過労働分に相当します。`
    if (stat.overtimeHours !== null) {
      p += `${prefName}の介護職員の超過実労働時間は月${stat.overtimeHours}時間と集計されています。`
    }
    paragraphs.push(p)
  }

  // 3. 賞与と年収の目安(機械的換算であることを明示)
  if (stat.annualBonus !== null && national.annualBonus !== null) {
    let p =
      `年間賞与その他特別給与額は${formatManYen(stat.annualBonus)}で、` +
      `全国平均の${formatManYen(national.annualBonus)}と比べて${diffPhrase(stat.annualBonus, national.annualBonus)}。`
    const annual = estimatedAnnual(stat)
    if (annual !== null) {
      p +=
        `きまって支給する現金給与額の12か月分に年間賞与を足して単純計算すると、年収の目安は${formatApproxManYen(annual)}になります` +
        `(平均値からの機械的な換算であり、個々の給与を示すものではありません)。`
    }
    paragraphs.push(p)
  }

  // 4. 訪問介護従事者との比較(同一調査・同一定義のデータがある県のみ)
  if (homon && homon.monthlyAvg !== null && stat.monthlyAvg !== null) {
    let p =
      `同じ調査では、${prefName}の訪問介護従事者(ホームヘルパー)のきまって支給する現金給与額は` +
      `月${formatManYen(homon.monthlyAvg)}で、施設で働く介護職員と比べて${diffPhrase(homon.monthlyAvg, stat.monthlyAvg)}。`
    if (homonNational && homonNational.avgAge !== null && homon.avgAge !== null) {
      p += `訪問介護従事者は平均年齢${homon.avgAge}歳と施設の介護職員より年齢層が異なる場合が多く、単純な優劣ではなく働き方の違いとして見る必要があります。`
    }
    paragraphs.push(p)
  }

  // 5. 統計の対象・属性と読み方の注意(固定の免責ではなく県の実数で構成)
  {
    const parts: string[] = []
    if (stat.avgAge !== null) parts.push(`平均年齢は${stat.avgAge}歳`)
    if (stat.avgTenureYears !== null) parts.push(`平均勤続年数は${stat.avgTenureYears}年`)
    if (stat.workerCount !== null) parts.push(`集計対象の労働者数は約${stat.workerCount.toLocaleString('ja-JP')}人`)
    let p =
      'この統計の対象は、常用労働者10人以上の民営事業所で働く一般労働者(短時間労働者を除く)です。'
    if (parts.length) p += `${prefName}の介護職員の${parts.join('、')}となっています。`
    p +=
      '平均値は年齢構成・勤続年数・夜勤の有無などの影響を受けるため、実際の求人と比べる際は、基本給と手当の内訳・賞与の支給実績・夜勤回数をあわせて確認してください。'
    paragraphs.push(p)
  }

  return paragraphs
}
