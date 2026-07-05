# 47章 Nuxt Content v3 移行手順書

- 作成日: 2026-07-05 / 作成: Claude Fable 5
- 目的: 軽量モデルが本章だけを頼りに、@nuxt/content v2(^2.13.4)→ v3 移行を安全に完了できること
- 実施タイミング: 44章 M1 #8(デプロイ後・**最初の記事を書く前**)。着手時は計画提示→ユーザー承認(通常規約)
- 判断根拠: 41章 §2(記事0本・クエリ使用箇所が最小の今が生涯最小コスト)

## §1 現状の v2 利用箇所一覧(2026-07-05 grep 全数調査・これが移行対象の全て)

| # | ファイル | 使用API | 用途 |
| --- | --- | --- | --- |
| 1 | `pages/[cluster]/index.vue` | `queryContent(\`/${cluster}\`).only([...]).find()` | クラスタ記事一覧 |
| 2 | `pages/[cluster]/[slug].vue` | `queryContent().where({ _path }).findOne()` | 記事本文(404ゲート) |
| 3 | `pages/kyuryo/index.vue` | `queryContent('/kyuryo').only([...]).find()` | ハブのガイド4件 |
| 4 | `pages/kyuryo/guide/index.vue` | `queryContent('/kyuryo')...find()` | ガイド一覧 |
| 5 | `pages/kyuryo/guide/[slug].vue` | `queryContent().where({ _path }).findOne()` | ガイド本文(404ゲート) |
| 6 | `pages/kyuryo/pref/[pref].vue` | `queryContent('/kyuryo')...find()` | **indexableゲートの本数計測** |
| 7 | `server/api/__sitemap__/urls.ts` | `serverQueryContent(event)` + `#content/server` | sitemap唯一の源泉 |
| 8 | `components/article/ArticleToc.vue` | `import type { TocLink } from '@nuxt/content'` | 型のみ |
| 9 | `utils/article.ts` | `import type { ParsedContent }` | `ArticleDocument` の基底型 |
| 10 | `nuxt.config.ts` | `content.markdown.anchorLinks: false` | 設定 |
| 11 | `package.json` | `@nuxt/content ^2.13.4` | 依存 |

補助確認: `components/article/ArticleView.vue` の `<ContentRenderer>` / `doc.body.toc` 使用、
`components/content/ProseA.vue`(prose上書き)は v3 でも同名機構が存在(移行時に動作確認)。
`scripts/content-lint.mjs` は **md を直接読むため無関係(変更不要)**。

## §2 v3 で変わる点(本リポジトリに関係するものだけ)

| v2 | v3 | 影響箇所(§1の#) |
| --- | --- | --- |
| `queryContent(path)` | `queryCollection('articles')` + `.where('path', 'LIKE', ...)` | 1,3,4,6 |
| `.where({ _path }).findOne()` | `.path('/kyuryo/xxx').first()` | 2,5 |
| `.only([...])` | `.select(...)`(可変長引数) | 1,3,4,6,7 |
| `.find()` | `.all()` | 1,3,4,6,7 |
| `serverQueryContent(event)` | `queryCollection(event, 'articles')`(`#content/server` import 廃止) | 7 |
| `doc._path` | `doc.path`(**アンダースコア接頭辞の廃止**) | _path参照の全箇所 |
| `ParsedContent` | コレクション生成型(`ArticlesCollectionItem`)| 9 |
| frontmatter 自由形 | **content.config.ts の collection schema(zod)で型定義** | 新規ファイル |
| 内部実装: ファイルスキャン | SQLite ベース(dev はローカルDB・本番はダンプ同梱) | デプロイ検証(§6) |
| `content.markdown.*` 設定 | `content.build.markdown.*` へ移動 | 10 |

変わらないもの: content/ の md 配置・URL 規約・`<ContentRenderer>`・prose コンポーネント機構・
`body.toc`(TocLink 相当の型は v3 も提供 — import 元をビルドエラーに従い修正)。

## §3 collection schema 設計(content.config.ts — 新規作成)

```ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { CONTENT_CLUSTERS } from './config/routes'

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式')

/** 出典 — publishBlockers(utils/article.ts)と同じ必須性を型で表現(L1はあくまで utils 側) */
const articleSource = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  publisher: z.string().optional(),
  checkedAt: DATE, // 公開ゲートの核心 — 型レベルでも必須
})

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      // README.md 等を拾わないようクラスタ直下の md のみに限定(03章 §2 と一致)
      source: '{shikaku,tenshoku,shisetsu,shokushu,kyuryo}/*.md',
      schema: z.object({
        // title / description は type:'page' の組み込み。以下は独自 frontmatter
        cluster: z.enum(CONTENT_CLUSTERS),
        targetQueries: z.array(z.string()).min(1),
        authorId: z.string().optional(),
        supervisorId: z.string().optional(),
        reviewedAt: DATE.optional(),
        publishedAt: DATE,
        updatedAt: DATE.optional(),
        sources: z.array(articleSource).min(1),
        prRelated: z.boolean().optional(),
      }),
    }),
  },
})
```

注意: `CONTENT_CLUSTERS` の import が content.config のバンドラで解決できない場合のみ、
enum をインライン化し「config/routes.ts と同期」コメントを付ける(まず import を試す — 一元化優先)。

## §4 frontmatter 公開ゲートの型強制について(設計判断)

- schema は**入口の型検査**(不適合 frontmatter を dev/build 時に検出)であり、
  **公開ゲートの正は移行後も `utils/article.ts` の publishBlockers**(L1 — 41章 §4)。
  schema があっても publishBlockers・404ゲート・content-lint は**削除しない**(多層防御)。
- 理由: schema 違反時の v3 の挙動(ビルド失敗か・警告か・フィールド欠落か)はバージョンで
  変わりうるため、公開可否の判定をフレームワーク挙動に依存させない。
- 副次効果: `queryCollection('articles')` の戻り値が schema 由来の型を持つため、
  `ArticleDocument` のキャストが不要になり typecheck が実質を検査するようになる。

## §5 移行手順(この順で・1コミット完結)

1. **前提確認**: 作業ツリーがクリーン・`npm run check`(48章導入前なら typecheck+kb-lint+content-lint+verify:kyuryo を個別実行)が全通過
2. ブランチ作成: `git checkout -b migrate-content-v3`
3. `npm install -D @nuxt/content@^3`(package.json / lockfile 更新)
4. `content.config.ts` を §3 のとおり新規作成
5. `nuxt.config.ts`: `content.markdown.anchorLinks` を v3 の設定位置(`content.build.markdown`)へ移動(公式ドキュメントで最新のキー名を確認してから)
6. `types/article.ts`: `ParsedContent` 依存を廃し、`ArticleDocument` をコレクション生成型ベースに変更(`ArticleFrontmatter` interface は content-lint 等の参照があるため**残す**)
7. §1 の #1〜6 を §2 の対応表どおり書き換え。**`_path` → `path` は全文 grep で潰す**(`grep -rn "_path" pages/ components/ utils/ server/` が 0 件になるまで)
8. `server/api/__sitemap__/urls.ts`: `serverQueryContent(event)` → `queryCollection(event, 'articles')`。`#content/server` import を削除。**掲載判定ロジック(publishBlockers・ゲート)は一切変えない**
9. `components/article/ArticleToc.vue` の `TocLink` import をビルドエラーに従い修正
10. **検証(§7)を全実施**
11. 一時検証記事を削除(規約: サンプル記事はコミット禁止)して 1 コミット
12. ユーザー報告 → 承認後 main へマージ

## §6 想定エラーと対処

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| install/dev 時に better-sqlite3 のネイティブビルド失敗 | Node バージョン不一致 | Node LTS(20/22)を確認。`npm rebuild better-sqlite3` |
| Vercel 本番で記事クエリが空/DB エラー | v3 のサーバレスDB構成 | v3 はプリレンダー/サーバレス用に DB ダンプ同梱をサポート。公式の「Deploy > Vercel」手順に従い database 設定を確認。**解決しない場合は移行を中断し rollback(§7)→ 高性能モデル案件化** |
| `doc._path is undefined` 系の実行時エラー | `_path` の書き換え漏れ | §5-7 の grep を再実行 |
| README.md が記事として出る | source パターン誤り | §3 の source をクラスタ直下 `*.md` に限定しているか確認 |
| schema エラーで既存確認用記事が落ちる | frontmatter 不適合 | それは**検出成功**。記事側を直す(schema を緩めない) |
| ProseA の rel="sponsored nofollow" が付かない | prose 上書きの解決差異 | components/content/ProseA.vue の配置規約を v3 ドキュメントで確認。**この検査(§7-6)が通るまでマージ禁止**(法令ガード) |
| sitemap.xml が変わった | urls.ts の書き換えミス | §7-3 の before/after 比較で検出 → 差分箇所を修正 |

## §7 検証方法(全項目必須・結果を数値で報告)

1. `npx nuxt typecheck` — 0 エラー
2. `npm run content-lint` / `npm run kb-lint` / `npm run verify:kyuryo` — 全 OK(移行で結果が変わってはならない)
3. **sitemap 不変性**: 移行前に `curl -s localhost:3000/sitemap.xml > /tmp/.../before.xml` を採取しておき、移行後の出力と diff。**URL 集合が完全一致**(現状: 固定7+/kyuryo/ の8 URL)
4. `npm run build` — 成功
5. dev サーバで手動ルート確認: `/` `/kyuryo/` `/kyuryo/pref/tokyo/` `/kyuryo/guide/`(空一覧)`/shindan/` `/about/` が 200、`/kyuryo/guide/zonzai-shinai/` が 404
6. **公開ゲート回帰(一時記事・コミット前に削除)**: `content/kyuryo/_test.md` を3パターンで作成し確認 — ①完全な frontmatter → `/kyuryo/guide/_test/` が 200・sitemap に載る ②sources の checkedAt を1件削除 → 404・sitemap 非掲載・content-lint NG ③本文に `/go/x` リンク+prRelated なし → content-lint NG。あわせて①の描画で ProseA 経由リンクの rel 属性を目視確認
7. 47県ページが全て noindex のまま(ガイド0本なので)であることを1県で確認

## §8 rollback 手順

- マージ前(ブランチ内): `git checkout main && git branch -D migrate-content-v3` で完全復元
- マージ後に問題発覚: 移行は §5-11 で**1コミット**なので `git revert <migration-commit>` 一発で v2 へ戻る(lockfile も同コミットに含めること)。revert 後 `npm install` → §7-1〜4 を再実行
- Vercel 上の障害時: Vercel の Instant Rollback で前デプロイに戻す(ユーザー操作)→ その後 git revert

## §9 軽量モデルへの依頼プロンプト(このままコピーして使う)

```
docs/kaigo-media-plan/v4/47-content-v3-migration.md(この手順書)に従い、
@nuxt/content v2 → v3 の移行を実施してください。

制約:
- 手順書の §5 の順序どおりに進め、逸脱する場合は理由を提示して停止すること
- 公開ゲートのロジック(utils/article.ts の publishBlockers、server/api/__sitemap__/urls.ts の
  掲載判定、pages の 404 判定・noindex 判定)は 1 文字も変更しないこと
- schema(§3)を「エラーが出るから」という理由で緩めないこと
- §7 の検証 7 項目を全て実施し、結果を数値(エラー0件・URL 8件一致 等)で報告すること
- 検証用一時記事は必ず削除してからコミットすること(サンプル記事コミット禁止規約)
- sitemap.xml の URL 集合が移行前後で 1 件でも異なる場合はコミットせず報告すること
- 想定外の事象(§6 にない症状)が出たら、対処を推測実行せず状況を報告して停止すること
まず実施計画を提示し、承認を得てから着手してください。
```
