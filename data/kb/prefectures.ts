import type { Prefecture } from '~/types/kb'

/**
 * A4 都道府県マスタ(V3 31章 §2 — KB-1)。
 * - slug = id(公開後変更禁止。/kyuryo/pref/<slug>/ 等のURLキー)
 * - jisCode は JIS X 0401(全国地方公共団体コードの都道府県部分)による
 * - 級地(地域区分)は保持しない(市町村単位の告示のため県1値では誤る — パネル K-02)
 * - 最低賃金・介護職員数は消費者(#11 等)の実装時に出典つきで追加する(YAGNIゲート)
 *
 * status の昇格(draft→verified)は人間のみ(V3 32章)。
 */

const CHECKED = '2026-07-05'

/** [jisCode, slug, name, region] */
const PREF_ROWS: [string, string, string, string][] = [
  ['01', 'hokkaido', '北海道', '北海道'],
  ['02', 'aomori', '青森県', '東北'],
  ['03', 'iwate', '岩手県', '東北'],
  ['04', 'miyagi', '宮城県', '東北'],
  ['05', 'akita', '秋田県', '東北'],
  ['06', 'yamagata', '山形県', '東北'],
  ['07', 'fukushima', '福島県', '東北'],
  ['08', 'ibaraki', '茨城県', '関東'],
  ['09', 'tochigi', '栃木県', '関東'],
  ['10', 'gunma', '群馬県', '関東'],
  ['11', 'saitama', '埼玉県', '関東'],
  ['12', 'chiba', '千葉県', '関東'],
  ['13', 'tokyo', '東京都', '関東'],
  ['14', 'kanagawa', '神奈川県', '関東'],
  ['15', 'niigata', '新潟県', '中部'],
  ['16', 'toyama', '富山県', '中部'],
  ['17', 'ishikawa', '石川県', '中部'],
  ['18', 'fukui', '福井県', '中部'],
  ['19', 'yamanashi', '山梨県', '中部'],
  ['20', 'nagano', '長野県', '中部'],
  ['21', 'gifu', '岐阜県', '中部'],
  ['22', 'shizuoka', '静岡県', '中部'],
  ['23', 'aichi', '愛知県', '中部'],
  ['24', 'mie', '三重県', '近畿'],
  ['25', 'shiga', '滋賀県', '近畿'],
  ['26', 'kyoto', '京都府', '近畿'],
  ['27', 'osaka', '大阪府', '近畿'],
  ['28', 'hyogo', '兵庫県', '近畿'],
  ['29', 'nara', '奈良県', '近畿'],
  ['30', 'wakayama', '和歌山県', '近畿'],
  ['31', 'tottori', '鳥取県', '中国'],
  ['32', 'shimane', '島根県', '中国'],
  ['33', 'okayama', '岡山県', '中国'],
  ['34', 'hiroshima', '広島県', '中国'],
  ['35', 'yamaguchi', '山口県', '中国'],
  ['36', 'tokushima', '徳島県', '四国'],
  ['37', 'kagawa', '香川県', '四国'],
  ['38', 'ehime', '愛媛県', '四国'],
  ['39', 'kochi', '高知県', '四国'],
  ['40', 'fukuoka', '福岡県', '九州・沖縄'],
  ['41', 'saga', '佐賀県', '九州・沖縄'],
  ['42', 'nagasaki', '長崎県', '九州・沖縄'],
  ['43', 'kumamoto', '熊本県', '九州・沖縄'],
  ['44', 'oita', '大分県', '九州・沖縄'],
  ['45', 'miyazaki', '宮崎県', '九州・沖縄'],
  ['46', 'kagoshima', '鹿児島県', '九州・沖縄'],
  ['47', 'okinawa', '沖縄県', '九州・沖縄'],
]

export const prefectures: Prefecture[] = PREF_ROWS.map(([jisCode, slug, name, region]) => ({
  id: slug,
  slug,
  name,
  jisCode,
  region,
  // L1 エンティティ(名称・コードのみ)。県コード・名称は JIS X 0401 による(note 参照)
  sourceIds: [],
  checkedAt: CHECKED,
  updatedAt: CHECKED,
  status: 'draft',
  note: '県コード・名称は JIS X 0401(全国地方公共団体コード)による',
}))

/** 地方別グルーピング(ハブの表示順) */
export const PREF_REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄'] as const

export function findPrefecture(slug: string): Prefecture | undefined {
  return prefectures.find((p) => p.slug === slug)
}
