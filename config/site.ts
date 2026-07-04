/**
 * サイト定数 — サイト名・URL・タイトル規則の唯一の参照点。
 * サイト名やドメインを変更する場合はこのファイルだけを差し替える
 * (テンプレート・OGP・JSON-LD は必ずここを import すること)。
 *
 * サイト名「マモリビ」/ mamoribi.jp は 2026-07-04 ユーザー決定
 * (docs/kaigo-media-plan/03-site-architecture.md §1)。
 */
export const SITE_NAME = 'マモリビ'
export const SITE_URL = 'https://mamoribi.jp'

export const SITE_DESCRIPTION =
  '介護職のための過去問演習・給料データ・転職情報メディア。介護福祉士・ケアマネ試験の過去問解説、都道府県別の給料統計、現場の悩みに寄り添う転職ガイドを届けます。'

/** タイトル規則: `{主クエリを含む見出し}|{サイト名}`(設計書05章 §5) */
export const TITLE_TEMPLATE = `%s|${SITE_NAME}`

/** ブランドカラー(仮 — ブランドデザイン確定後に tailwind.config.ts と同時に差し替え) */
export const THEME_COLOR = '#16a34a'
