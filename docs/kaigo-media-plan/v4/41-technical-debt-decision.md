# 41章 技術負債の最終意思決定(CTO判断・7項目)

- 作成日: 2026-07-05 / 判断者: Claude Fable 5(ユーザー承認前の推奨案。実装着手時は個別に計画提示 → 承認が必要)
- 各項目は「現状の問題 / 放置リスク / タイミング / 推奨対応 / 優先度 / 想定工数 / 影響範囲」で整理
- 工数は Claude Code(軽量モデル)+人間レビュー前提の実作業時間

## 決定サマリー

| # | 項目 | 決定 | 優先度 | 工数 | いつ |
| --- | --- | --- | --- | --- | --- |
| 1 | routeRules / prerender / ISR | **ISR採用**(`isr: true` 基本・/go/ と /api/ は除外) | 高 | 0.5日 | デプロイ前 |
| 2 | @nuxt/content v2 → v3 | **v3へ移行する**(記事0本の今) | 高 | 1〜2日 | デプロイ直後・記事執筆前 |
| 3 | 公開ゲート判定の一元化 | **共有関数へ統合**(pref頁とsitemapの二重実装解消) | 高 | 0.5日 | ガイド記事公開前 |
| 4 | lint群の責務分離 | **3層モデル+実モジュールimport化**(正規表現パース廃止) | 中 | 1日 | P5の一部 |
| 5 | verifiedデータを守る最小CI | **GitHub私有リポジトリ+Actions**(前提: remote作成) | 高 | 0.5日 | デプロイと同時 |
| 6 | C2のクライアントバンドル同梱 | **今は許容・P9の前提条件として解消**(server API化) | 中 | 1日 | P9直前 |
| 7 | raw XLSX のGit管理 | **現方式を継続**(年約1MB)+閾値ポリシーを明文化 | 低 | 0日 | 方針のみ |

---

## §1 Vercel での routeRules / prerender / ISR 方針

- **現状の問題**: `nitro.preset='vercel'` のみで routeRules が一切ない。全ページが毎リクエスト
  サーバレス関数でSSRされる。本サイトのコンテンツは全てデプロイ時に確定する(KB=TS/JSON、
  記事=md)ため、動的レンダリングの必要が原理的にない。
- **放置リスク**: 100万PV時の関数実行コスト(Vercel無料枠を大きく超過)、TTFB劣化による
  CWV悪化(SEOに直撃)、関数コールドスタート起因の計測ノイズ。トラフィックが乗ってからの
  変更は「キャッシュ挙動の検証をトラフィック下で行う」ことになり危険。
- **タイミング**: **今(デプロイ前)**。URL数51未満・トラフィック0の今が検証コスト最小。
- **推奨対応**: フルprerenderではなく **ISR(cache-until-redeploy)** を採用する。
  ```ts
  routeRules: {
    '/**':      { isr: true },   // デプロイまでエッジキャッシュ(コンテンツはデプロイ時確定なので安全)
    '/go/**':   { isr: false },  // アフィリエイト302は都度実行(計測とリンク差し替え即時性)
    '/api/**':  { isr: false },  // sitemapソース等
    '/sitemap.xml': { isr: 3600 },
  }
  ```
  フルprerenderを退ける理由: ①公開ゲートがNuxt Contentクエリに依存し、prerenderのクロール
  設定(全47県URLの明示列挙)が第4のゲート実装地点になってしまう ②ISRなら既存コード無変更で
  コスト特性はprerender同等 ③ビルド時間が記事数に比例して伸びない。
- **優先度**: 高 / **想定工数**: 0.5日(設定+preview環境でキャッシュヘッダ検証)
- **影響範囲**: `nuxt.config.ts` のみ。ページコードは無変更。/go/ の計測挙動を要回帰確認。

## §2 @nuxt/content v2 継続か v3 移行か

- **現状の問題**: `@nuxt/content ^2.13.4`。v2 はレガシー系列で、エコシステムの主流は v3
  (collections / SQLベース / `queryCollection` API)。v2→v3 は API 非互換(`queryContent`
  全書き換え・`serverQueryContent` 廃止・frontmatter は collection schema で型定義)。
- **放置リスク**: 記事500本を書いた後の移行は、全記事のfrontmatter互換確認+全クエリ書き換え
  +全URL回帰テストで数週間規模になる。逆に今は **記事0本・contentクエリ使用箇所は約6ファイル**
  (pages/[cluster]/系・kyuryo系・server/api/__sitemap__/urls.ts)で、移行コストが生涯最小。
  さらに v3 の collection schema(zod)は **publishBlockers の一部を型レベルで強制**でき、
  ゲート設計と相性が良い。
- **タイミング**: **デプロイ直後・最初のガイド記事を書く前**(44章の順序参照)。デプロイを
  待たせないため「v2のままデプロイ→即v3移行」の順とする。
- **推奨対応**: v3へ移行する。手順書(47章・Fable5残タスク)を先に作成し、実装は軽量モデル+
  計画承認で実施。移行時に content-lint の検査対象(frontmatter規則)は変えない。
- **優先度**: 高 / **想定工数**: 1〜2日(手順書があれば軽量モデルで可)
- **影響範囲**: package.json、content設定、queryContent使用の全ページ(約6ファイル)、
  server/api/__sitemap__/urls.ts、types/article.ts(schema化)、content-lint.mjs(読み口のみ)。

## §3 sitemap / noindex / 公開ゲート判定の一元化

- **現状の問題**: 「47県ページのindex可否」の判定が2箇所に独立実装されている。
  ①`pages/kyuryo/pref/[pref].vue` の `indexable`(guideList.length ≥ gate.contextGuideLinksMin)
  ②`server/api/__sitemap__/urls.ts` の `kyuryoGuideCount >= ...`。同一条件であることは
  **コメントで宣言されているだけ**で、機械的保証がない。さらに「公開kyuryoガイドの数え方」
  (クラスタ判定・publishable判定)も両者で別実装。
- **放置リスク**: ガイド記事公開・ゲート値変更・クラスタ追加のタイミングで片方だけ更新され、
  「sitemapには載るがnoindex」(クロールバジェット浪費+GSCエラー)または
  「indexさせたいのにsitemap非掲載」という静かな不整合が起きる。**記事量産期=軽量モデル期に
  最も壊れやすい**種類の負債。
- **タイミング**: **最初のガイド記事を公開する前**(ゲートが初めて「発火」する前)。
- **推奨対応**: `utils/kyuryo.ts` に単一の判定関数を新設し両実装を置換する。
  ```ts
  /** 公開済み kyuryo ガイド数から県ページの index 可否を返す(pref頁 robots と sitemap の唯一の判定) */
  export function prefPagesIndexable(publishedKyuryoGuideCount: number): boolean
  /** ドキュメント配列から「公開ゲート通過済み kyuryo ガイド」を数える(数え方も一元化) */
  export function countPublishedKyuryoGuides(docs: Pick<ArticleDocument, 'cluster'|'sources'|...>[]): number
  ```
  §2のv3移行と同時に実施すると、クエリ書き換えと数え方統一を一度の回帰確認で済ませられる。
- **優先度**: 高 / **想定工数**: 0.5日
- **影響範囲**: utils/kyuryo.ts、pages/kyuryo/pref/[pref].vue、server/api/__sitemap__/urls.ts。

## §4 content-lint / publishBlockers / kb-lint の責務分離

- **現状の問題**: 不変条件が「コメント同期規約」で保たれている箇所が3つ。
  ①`utils/article.ts` の publishBlockers と `scripts/content-lint.mjs` が同一規則を二重実装
  (「変更時は両方を更新すること」とコメントに書いてあるだけ)
  ②`scripts/kb-lint.mjs` が `data/kb/prefectures.ts` 等の**TSソースを正規表現でパース**
  — タプルの書式を変えると黙って検査がスルーされる(false negative)
  ③sitemapゲート(§3)。
- **放置リスク**: lint が「通っているのに守っていない」状態に静かに遷移する。正規表現パースの
  false negative は**発見が構造的に不可能**(エラーが出ないため)。verified データの保全網が
  実は穴だらけ、という最悪の形で顕在化する。
- **タイミング**: P5(品質CI)の一部として。ただし②の正規表現問題は前倒し推奨。
- **推奨対応**: 3層モデルに再編する。
  - **L1 = ランタイム真実**: `utils/article.ts`(publishBlockers)と `utils/kyuryo.ts`(ゲート関数群)。
    規則の実装はここ**のみ**。
  - **L2 = 静的検査**: content-lint / kb-lint は L1 を **jiti(または tsx)で実 import して呼ぶ**。
    規則の複製・正規表現パースを全廃。lint 固有の検査(ファイル名規約・banned phrases 等)のみ独自実装。
  - **L3 = CI**: L2 + typecheck + verify:kyuryo + build を束ねて実行(§5)。
  - 昇格フロー(kb-promote)は人間専用のまま変更しない。
- **優先度**: 中(②のみ高) / **想定工数**: 1日
- **影響範囲**: scripts/content-lint.mjs、scripts/kb-lint.mjs、devDependencies に jiti 追加。
  utils 側は変更なし(=ページへの影響ゼロ)。

## §5 verified データを守る最小CI

- **現状の問題**: テスト0・CI 0・**git remote すら無い**。C2の96件 verified という「守るべき資産」
  が既に存在するのに、回帰網が人間の手動 npm scripts 実行に依存している。
- **放置リスク**: 軽量モデル期に「lint を走らせ忘れたコミット」が混入し、原本照合が壊れた状態で
  記事が量産される。SEOメディアとして最も守るべき「統計値の正しさ」が無防備。
- **タイミング**: **デプロイと同時**(GitHub リポジトリ作成が Vercel Git 連携の前提でもあるため、
  リモート作成は一石二鳥)。
- **推奨対応**:
  1. ユーザー作業: GitHub に**私有リポジトリ**を作成し remote 登録・push(git 操作は kaigo-media 内限定の規約どおり)
  2. `npm run check` を新設(typecheck && kb-lint && content-lint && verify:kyuryo を直列実行)
  3. GitHub Actions: push/PR で `npm ci && npm run check && npm run build`。**verify:kyuryo が
     原本XLSX照合まで行うため、これだけで C2 の完全性が毎コミット保証される**
  4. (任意)ローカル pre-push hook で `npm run check`
- **優先度**: 高 / **想定工数**: 0.5日(yaml 1本+check script)
- **影響範囲**: .github/workflows/、package.json scripts。アプリコード無変更。

## §6 C2データがクライアントバンドルに乗る問題

- **現状の問題**: `utils/kyuryo.ts` が `salary-chingin-kouzou-r7.json` をトップレベル import
  しており、共有 utils のため **C2全96レコード+マスタが全 kyuryo ページのクライアントJSに同梱**
  される。現在は数十KB。
- **放置リスク**: P9(職種拡張)×複数年度で線形増加し、「1県のページを見るのに全国×全職種×
  全年度のデータをダウンロードする」構造になる。CWV(LCP/INP)悪化=SEO直撃。
- **タイミング**: **今はやらない**。96レコードでの転送量は誤差であり、§1のISR化・§2のv3移行の
  方が先。ただし **P9着手の前提条件**として固定する(トリップワイヤ: salary JSON 合計が200KBを
  超える、または年度が2つになった時点で強制着手)。
- **推奨対応**: データアクセスを server 側へ寄せる。
  - `server/utils/kyuryo-data.ts`(server専用・JSON import はここだけ)+ ページは
    `useAsyncData` で県単位の必要データのみ取得(payload には当該県分だけが載る)
  - 決定的テキスト生成(kyuryo-text.ts)も server 側で実行し、結果文字列を payload で渡す
- **優先度**: 中 / **想定工数**: 1日 / **影響範囲**: utils/kyuryo.ts の分割、kyuryo系4ページ、
  sitemap urls.ts(server内なので import 先変更のみ)。

## §7 raw XLSX の Git 管理方針

- **現状の問題**: 原本XLSX 4ファイル約1MBを git 直置き。「問題」というより将来の方針が未定なだけ。
- **放置リスク**: 年1MB・調査追加でも数MB/年のペースであり、10年でも数十MB。**実害は当面ない**。
  リスクが顕在化するのは e-Stat 以外の大容量ソース(PDF集・画像)を扱い始めた場合のみ。
- **タイミング**: 方針明文化のみ今。移行作業は不要。
- **推奨対応**: **現方式(git 直置き)を継続**する。理由: 原本同梱こそが「決定的パイプライン+
  sha256照合」の再現性保証であり、外部フェッチ化は e-Stat のURL永続性という新しい依存を持ち込む。
  閾値ポリシーを定める: **単一ファイル20MB超 or raw合計100MB超**になったら、そのデータセット
  のみ「原本は .gitignore + 取得スクリプト + sources.ts に sha256 固定」方式へ切り替える。
  Git LFS は Vercel 連携との相性問題を持ち込むため採用しない。
- **優先度**: 低 / **想定工数**: 0日(本節が成果物) / **影響範囲**: なし。

---

## 実装時の共通ルール(再掲・上書きなし)

- 本章は**意思決定**であり実装許可ではない。各項目の着手時は従来どおり計画提示→ユーザー承認。
- 実装順は 44章のロードマップが正。
