import type { StatSource } from '~/types/kyuryo'

/**
 * 統計出典マスタ(設計書06章 §2-2・§3)。
 * 統計値(salary-*.json)より先にここへ出典を登録し、SalaryStat.sourceId から参照する。
 * 注意: 調査ごとの定義差(「きまって支給する現金給与額」vs「平均給与額」)を
 * definitionNote に必ず書き、異なる調査の数値を同一表に並べない(06章 §3)。
 */
export const statSources: StatSource[] = [
  {
    id: 'chingin-kouzou-r7',
    surveyName: '令和7年賃金構造基本統計調査(一般労働者)都道府県別第3表 職種(特掲)・産業計',
    publisher: '厚生労働省',
    url: 'https://www.e-stat.go.jp/stat-search/files?cycle=0&tclass=000001229518',
    surveyPoint: '令和7年6月分(年間賞与その他特別給与額は令和6年1年間)',
    checkedAt: '2026-07-05',
    nextExpectedRelease: '2027-03(令和8年調査。例年3月下旬公表 — data/update-calendar.ts)',
    definitionNote:
      '「きまって支給する現金給与額」= 労働協約・就業規則等で定められた支給条件により令和7年6月分として支給された現金給与額(所定内給与+超過労働給与。所得税・社会保険料等を控除する前の額)。「所定内給与額」= きまって支給する現金給与額から超過労働給与額を除いた額。対象は常用労働者10人以上の民営事業所に勤める一般労働者(短時間労働者を除く)・産業計・男女計。「平均給与額」を集計する介護従事者処遇状況等調査とは定義・対象が異なるため、同一の表・グラフに並べない(06章 §3)。',
  },
]
