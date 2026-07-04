# 05. テクニカルSEO(Nuxt 3 実装方針)

> スタックは projects/ 標準(Nuxt 3 + TypeScript strict + Tailwind + Vercel)を踏襲する。本章は設計のみ。実装は行わない。

## 1. レンダリング戦略

| ページ種別 | 方式 | 理由 |
| --- | --- | --- |
| 記事(`/shikaku/` 等) | **SSG(ビルド時プリレンダー)** | 更新頻度が低く、CWVと安定性が最優先 |
| 過去問(約1,500ページ) | **SSG** | データ由来で完全静的。Nitro の `prerender.routes` にデータから全ルートを列挙 |
| 給料統計(約60ページ) | **SSG** | 同上。統計更新時に再ビルド |
| 診断(`/shindan/`) | SSG + クライアント state | 既存 aff-v1 と同じ方式(回答は ref のみ、永続化なし) |
| `/go/<slug>` | サーバールート(302) | 既存実装を移植。**robots.txt の Disallow のみ**で制御(Disallow と noindex ヘッダの併用は矛盾: クロールされないURLの noindex は読まれない)。リンク側の `rel="sponsored"` が本命の対策(§3) |

- ページ総数 約2,000(Phase 2 終了時点)は Vercel + Nitro プリレンダーで問題なくビルド可能。**ISR は導入しない**(全静的で足りる。ビルド時間が10分を超えたら再検討)。
- 記事本文は Markdown 管理(Nuxt Content)、過去問・統計は TS/JSON データ + 動的ルートの SSG([06章](./06-data-model.md))。

## 2. 構造化データ(JSON-LD)

| ページ | スキーマ | 備考 |
| --- | --- | --- |
| 全ページ | `BreadcrumbList`, `WebSite`(トップのみ) + `Organization`(`/about/` を publisher に) | |
| 記事 | `Article`(author/editor に `Person`、`dateModified` 必須)+ 必要に応じ `FAQPage` | FAQ リッチリザルト表示は2023年以降ほぼ政府・医療サイト限定だが、マークアップ自体は理解補助として維持(表示は期待しない) |
| 過去問1問ページ | `Quiz` / `Question` / `Answer` | **リッチリザルト表示は期待しない**(Google は 2023年9月に Practice Problems リッチリザルトのサポートを廃止済みで、教育系構造化データは縮小トレンド)。実装コストが低い範囲でのみ付与し、表示獲得を目的とした追加工数は投じない【仮説 H-21 は優先度最下位に格下げ】 |
| 監修者ページ | `Person`(jobTitle・hasCredential・sameAs) | E-E-A-T のシグナル補強 |
| 給料統計ページ | `Article` + 表データ(`Dataset` は過剰なので使わない) | 出典は本文中の引用リンクで示す |

- CI で構造化データを検証(自動化ツール #6 → [10章](./10-implementation-order-and-tools.md)。schema-dts で型チェック+Rich Results Test の手動確認を公開フローに組み込む)。

## 3. インデックス制御

- **sitemap.xml を種別分割**: `sitemap-articles.xml` / `sitemap-kakomon.xml` / `sitemap-kyuryo.xml` / `sitemap-static.xml`(インデックス率をGSCで種別ごとに監視するため)。帰属規則: **Markdown(Nuxt Content)由来 = articles、データ駆動SSG = kakomon / kyuryo**(`/kyuryo/guide/` の記事は articles に属する)。
- **アフィリエイトリンクの修飾(必須)**: `/go/` へ向かう `<a>` は全ページで `rel="sponsored nofollow"` を付与する(有料リンクの修飾は Google リンクスパムポリシーの必須要件)。`AffiliateLink` コンポーネントに実装で強制し、CI(ツール#6)で検査する。
- noindex 対象: 検索結果・タグ絞り込み等の動的一覧(そもそも作らない)、診断の途中ページ。**診断結果8ページは2段階方針**: テンプレート+CTA主体のままでは thin affiliate 外形になるため、施設種別解説・キャリアパス等の**独自本文1,000字以上と C5 記事への文脈リンクを備えるまで noindex** とし、拡充後に index へ切り替える(noindex でもリンク先・SNS遷移先・OGP表示は機能する)。
- canonical: 全ページ自己参照。過去問の科目別一覧と回次別一覧は別クエリ対応なので相互 canonical にしない。
- 404: 存在しない回次・問題番号・都道府県スラッグは 404(既存 aff-v1 の `isResultType` ガードと同じパターンをデータ駆動で適用)。

## 4. Core Web Vitals・パフォーマンス予算

| 項目 | 予算 |
| --- | --- |
| LCP | < 2.0s(モバイル4G実測) |
| INP | < 200ms |
| CLS | < 0.1(広告枠を置かないため達成容易。CTA画像は width/height 固定) |
| クライアントJS | 自アプリJS(Nuxt/Vue フレームワーク込み)< 130KB gzip + サードパーティ(gtag.js)は別枠 < 50KB・遅延ロード(Nuxt 3 のベースラインが 70〜100KB あるため 100KB 一律予算は非現実的)。**過去問の正解・解説は初期HTMLに含め、開閉はCSS制御にする**(独自価値部分をクローラーに確実に渡す。hidden content はモバイルファースト以降ペナルティなし) |
| フォント | システムフォントのみ(Webフォント不使用。既存 aff-v1 と同一方針) |
| 画像 | `nuxt/image` 等で WebP/AVIF 化 + 遅延読み込み。アイキャッチはSVG/軽量イラスト中心 |

- サードパーティは GA4 のみ(タグマネージャも入れない)。ASP の計測タグが必要な案件は `/go/` リダイレクタ方式で回避(既存設計を踏襲)。

## 5. メタ情報・OGP

- タイトル規則: `{主クエリを含む見出し}|{サイト名}`。過去問は「第37回 介護福祉士国家試験 問1(人間の尊厳と自立)の過去問解説|サイト名」のようにデータから機械生成。
- 全ページ `useSeoMeta` でタイプ別OGを出す(既存 aff-v1 の `result/[type]` で実証済みのパターンを全テンプレートに拡張)。
- OGP画像: テンプレート+動的テキストの自動生成(ビルド時に satori 等で生成。Phase 2 以降の改善項目)。

## 6. その他の技術要件

- ページネーション: 問題一覧は125問を1ページに収める(分割しない。ページ分割はクロール効率と回遊の両方に不利)。
- パンくず・内部リンクはすべて `<NuxtLink>`(プリフェッチ有効)。
- robots.txt: `/go/` を Disallow。AI クローラー(GPTBot 等)は**ブロックしない**(AI Overviews / LLM 経由の言及・引用も流入源とみなす方針。方針転換の判断材料は [09章 R-05](./09-hypotheses-and-risks.md#r-05))。
- 開発時から Lighthouse CI をビルドに組み込み、パフォーマンス予算の回帰を検知(自動化ツール #6)。

---

- 前: [04. コンテンツ戦略・編集ガイドライン](./04-content-strategy.md)
- 次: [06. データモデル設計](./06-data-model.md)
