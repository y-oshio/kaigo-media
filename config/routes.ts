/**
 * URL 規則の定数化(設計書03章 §2 を V2 26章 §3 で更新)。
 * 原則: 全URL小文字・ローマ字スラッグ・末尾スラッシュ統一・クリック深度は全ページ3以内
 * (V2 でドリルは論点ページ方式になり、V1 の「過去問1問ページのみ4クリック許容」は失効。
 *  /shiken/ ドリル論点のURL階層は5だが、資格ハブ→科目→論点でクリック深度3 — V2 26章 §3 の明示的例外)。
 * 一度公開したURLは変更しない。
 */

/** コンテンツクラスタ(記事 Markdown を置く第一階層) */
export const CONTENT_CLUSTERS = [
  'shikaku', // C2: 資格・研修
  'tenshoku', // C4: 悩み・退職・転職
  'shisetsu', // C5: 施設種別
  'shokushu', // C6: 職種図鑑
  'kyuryo', // C3: 給料系解説記事(URL は /kyuryo/guide/<slug>/)
] as const

export type ContentCluster = (typeof CONTENT_CLUSTERS)[number]

/**
 * クラスタの表示名と記事URLの基底パス(03章 §2)。
 * kyuryo のみ記事は /kyuryo/guide/ 配下に出る(/kyuryo/ 直下は給料pSEOの予約 — P6)。
 */
export const CLUSTER_META: Record<
  ContentCluster,
  { label: string; articleBase: string; indexPath: string }
> = {
  shikaku: { label: '資格・研修', articleBase: '/shikaku/', indexPath: '/shikaku/' },
  tenshoku: { label: '転職・キャリア', articleBase: '/tenshoku/', indexPath: '/tenshoku/' },
  shisetsu: { label: '施設種別ガイド', articleBase: '/shisetsu/', indexPath: '/shisetsu/' },
  shokushu: { label: '職種図鑑', articleBase: '/shokushu/', indexPath: '/shokushu/' },
  kyuryo: { label: '給料ガイド', articleBase: '/kyuryo/guide/', indexPath: '/kyuryo/guide/' },
}

/** 記事URL(正規形・末尾スラッシュ)を組み立てる。content の _path とは別物な点に注意 */
export function articlePath(cluster: ContentCluster, slug: string): string {
  return `${CLUSTER_META[cluster].articleBase}${slug}/`
}

/**
 * 予約語スラッグ — データ駆動ページとの衝突を防ぐため、
 * 記事スラッグには使用禁止(全クラスタ共通。設計書03章 §2 + V2 26章 §3)。
 */
export const RESERVED_SLUGS = [
  'pref', // 都道府県軸(/kyuryo/pref/<pref>/ 等)
  'job', // 職種軸
  'guide', // 解説記事(/kyuryo/guide/<slug>/)
  's', // 科目軸(/kakomon/<exam>/s/<slug>/ — 凍結中オプション)
  'drill', // ドリル(/shiken/<exam>/drill/...)
  'shiken', // 試験・学習ハブ(C1')
  'tools', // 計算機ツール(C7)
] as const

/** データ駆動セクションの第一階層 */
export const DATA_SECTIONS = {
  shiken: '/shiken/', // C1': 試験・学習ハブ+オリジナルドリル(V2 26章 §3。P8 で実装)
  kakomon: '/kakomon/', // 【凍結・予約】過去問エンジン — 正式許諾の書面取得時のみ有効化(V2)。それまで実装・データ投入をしない
  kyuryo: '/kyuryo/', // C3: 給料統計
  shindan: '/shindan/', // C7: 適性診断(aff-v1 から移植予定)
  tools: '/tools/', // C7: 計算機ツール(手取り・夜勤手当等。V2 25章 T9 規格。P6 で実装)
  go: '/go/', // アフィリエイトリダイレクタ(robots Disallow・rel="sponsored nofollow")
} as const
