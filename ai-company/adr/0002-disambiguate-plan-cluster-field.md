# ADR-0002: article-plan.schema.json の `cluster` フィールド名を分離する

- ステータス: Proposed
- 起票日: 2026-07-08
- 関連: [ISSUE-005](../ops/issues-log.md)

## Context

`ai-company/schemas/article-plan.schema.json` の `cluster` フィールドは `enum: ["c2","c3","c4","c5","c6"]` というSEOファネル階層コードを表す(content-architect.md参照)。一方、サイト実装側の記事frontmatterにも `cluster` というフィールドがあり、こちらは `content.config.ts` の `CONTENT_CLUSTERS`(`shikaku`/`tenshoku`/`shisetsu`/`shokushu`/`kyuryo`)を表す、全く別概念のフィールドである。

記事2実行時、writer(haiku)がarticle-planの `cluster: "c3"` を字面だけでfrontmatterにコピーし、`cluster: c3` という無効な値を書いてしまった(`content.config.ts`のzod schemaでは通らない値。ビルド時エラーになる実害があった)。記事3実行時はcontent-architectへの事前注記(「両者は別概念」と明記させる)で回避できたが、これは**その場しのぎの注記であり、スキーマ設計自体の同名衝突は残ったまま**である。

## Decision(提案)

`article-plan.schema.json` の `cluster` フィールド名を、サイトの `ContentCluster` と衝突しない名前に変更する。案: `funnelTier`(`enum: ["c2","c3","c4","c5","c6"]` はそのまま)。あわせて `content-architect.md` の該当記述と、この出力を読む後続工程(writer.md)の記述も合わせて更新する。

## Consequences

- `article-plan.schema.json` を変更すると、スキーマの後方互換性が壊れる(既存の `work/guide-*/plans/*.plan.json` に残る古い `cluster` キーは新スキーマでは検証エラーになる)。ただしこれらはコミット対象外のwork内ファイルであり実害は小さい
- writerが両者を混同する余地が構造的になくなり、今回のような「事前に注記して回避する」運用の手間が不要になる

## Alternatives considered

- 現状維持+writer.md/content-architect.mdに「混同しないこと」を明記する運用でカバーし続ける: 実際に記事3では機能したが、注記を毎回人間が明示的に与える前提であり、注記を忘れた回では再発しうる(=記事2で実際に起きた)。名前衝突という構造的原因を放置した対症療法
- サイト側の`cluster`フィールド名を変更する: 影響範囲(content.config.ts / 全pages / utils/article.ts / 既存記事)がはるかに大きく、今回の問題の本質(ai-company側の命名)に対して過剰な変更
