# ADR-0005: writerのCTAコンポーネント逸脱を防ぐガードを追加する

- ステータス: Proposed
- 起票日: 2026-07-08
- 関連: [ISSUE-006](../ops/issues-log.md)

## Context

記事3のwriter(haiku)が、本文末尾のCTAとして `::affiliate-link{slug="shindan-intake", cluster="kyuryo", position="footer"}` という、この記事群では使用禁止のコンポーネントを独自に生成した。`docs/kaigo-media-plan/v4/49-kyuryo-guide-articles.md` §0は「`prRelated: false`(/go/ リンクなし。CTAはArticleCtaSlot経由の診断内部誘導で、prRelated不要)」と明記しており、正しくは `::diagnosis-cta{cluster=kyuryo position=footer}` を使うべきだった。`affiliate-link`コンポーネント自体は実在する(`components/AffiliateLink.vue`)ため実行時エラーにはならないが、`prRelated: false` のまま `::affiliate-link` を使うと `check-frontmatter.mjs` のステマ規制チェック(`hasAffLink && !prRelated`)には引っかかる状態だった。今回はLead Editorレビューで発見・修正した。

writer.md / `ai-company/templates/cta-blocks.md` にはCTAコンポーネントの一覧・クラスタ別使用ルールが記載されているが、**「このクラスタでは affiliate-link を使ってはいけない」という明示的な禁止は書かれていない**(許可されているものの列挙はあるが、禁止の明記がない)。

## Decision(提案)

`ai-company/agents/writer.md` の禁止事項に「`prRelated: false` の記事で `::affiliate-link` を使わない(49章等クラスタ別設計書がCTAを明示している場合はそれに従う。診断内部誘導は `::diagnosis-cta` のみ)」を明記する。あわせてcheck-frontmatter.mjsのステマ規制チェックは既に存在する(ISSUE-006はこのチェックに引っかかる**前に**人間が発見したケース)ため、機械チェック自体の変更は不要 — 発生源側(writer.md)への予防的記述の追加のみで足りる。

## Consequences

- writer.mdへの1行追加のみで、コード変更は不要
- 既存の `check-frontmatter.mjs` のステマ規制チェックはセーフティネットとして維持されるため、writer.mdの追記を忘れた場合でも機械的に検出できる(今回のケースでも、もし人間が見落としていればこのチェックが最終防波堤になっていた)

## Alternatives considered

- 機械チェック側だけを強化する(禁止コンポーネントのブラックリストを check-frontmatter.mjs に追加): `::affiliate-link`自体は他クラスタでは正当な用途があるため、単純な禁止リストにはできない(prRelatedとの組み合わせチェックが本質であり、これは既存実装で十分)。writer側の生成そのものを予防する方が実効性が高い
