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
  '介護職のための給料データ・試験対策・転職情報メディア。公的統計にもとづく都道府県別の給料情報、介護福祉士・ケアマネ試験の対策コンテンツ、現場の悩みに寄り添う転職ガイドを届けます。'
// ※「過去問」を約束する文言は使わない(V2: 過去問転載は凍結中・提供物は事実データ+オリジナルドリル)

/** タイトル規則: `{主クエリを含む見出し}|{サイト名}`(設計書05章 §5) */
export const TITLE_TEMPLATE = `%s|${SITE_NAME}`

/** ブランドカラー(仮 — ブランドデザイン確定後に tailwind.config.ts と同時に差し替え) */
export const THEME_COLOR = '#16a34a'

/**
 * LINE公式アカウントの友だち追加URL(07章 — 診断結果・記事からのナーチャリング導線)。
 * aff-v1-kaigo-shindan から引き継いだ実在アカウント(2026-07-05 ユーザー承認)。
 * 空文字にすると LineCta は全ページで非表示になる。
 */
export const LINE_ADD_URL = 'https://lin.ee/YV0F2dA'
