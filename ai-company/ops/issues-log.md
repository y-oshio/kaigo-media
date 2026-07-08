# AI編集部 Issueログ

実運用ドライラン・実運転で発見した問題を記録する運用ログ(設計書ではない)。設計変更が必要なものは `ai-company/adr/` にADRとして別途起票し、ここからリンクする。

| ID | 発見箇所 | 概要 | 重大度 | 状態 | 対応 |
| --- | --- | --- | --- | --- | --- |
| ISSUE-001 | `ai-company/scripts/check-frontmatter.mjs` | `authorId` を無条件必須にしており、49章の「登録まで省略可」方針と矛盾 | Medium | 解決済み | commit `0771c17` |
| ISSUE-002 | 同上 | 独自正規表現パーサがYAMLブロック形式のsourcesを検出できず誤検知 | Medium | 解決済み | commit `0771c17`(yamlパッケージに統一) |
| ISSUE-003 | `content.config.ts` / `utils/article.ts` | `draft`フラグがテンプレートにのみ存在し実際の公開ゲートに未実装 | High | 解決済み | commit `0771c17`(publishBlockers()に実装) |
| ISSUE-004 | `ai-company/agents/schema-generator.md` | content記事はArticleView.vue/AppBreadcrumb.vueが自動生成するため、schema-generatorのファイル成果物が実際には使われていなかった | Low | 解決済み | commit `0771c17`(QA専任化) |
| ISSUE-005 | `ai-company/schemas/article-plan.schema.json` / writer実行(記事2) | article-planの`cluster`フィールド(c2〜c6のファネル階層コード)と、サイトfrontmatterの`cluster`(kyuryo等のContentCluster)が同名で意味が異なる。writer(haiku)がplanの`cluster: "c3"`をそのままfrontmatterにコピーし、`content.config.ts`のzodスキーマでは無効な値になっていた(ビルド時にエラーになる実害あり)。記事2実行時にLead Editorレビューで発見・手動修正 | High | 一時対応済み・根本対応は提案中 | 記事2は手動修正。記事3実行時はcontent-architectへの事前注記で回避を確認(再発せず)。恒久対応は [ADR-0002](../adr/0002-disambiguate-plan-cluster-field.md) 参照 |
| ISSUE-006 | writer実行(記事3) | (a) `::affiliate-link{...}`という、この記事群では使用禁止のCTAコンポーネント(prRelated: falseと矛盾しステマ規制に抵触する組み合わせ)をwriterが独自に生成していた。49章§0では`::diagnosis-cta`のみを使う設計。(b)【要出典: ...]] のように閉じ括弧が`】`ではなく`]]`になっている構文崩れのマーカーが1箇所あった | High | 一時対応済み・根本対応は提案中 | Lead Editorレビューで発見・`::diagnosis-cta`に修正、マーカー構文も修正。恒久対応は [ADR-0005](../adr/0005-writer-cta-hallucination-guard.md) 参照 |
| ISSUE-007 | fact-checker実行(記事3) | writerが年収目安を計算する際に算術ミス(277,700×12+547,800を4,281,200円と誤算。正しくは3,880,200円)。連動して「年収差は約46万円」という未マーク箇所も誤り(正しくは約6万円)。**fact-checkerが正しく検出・修正し、後工程に誤りは伝播しなかった**(パイプラインが機能した実例) | Medium(検出済みのため実害なし) | 発見・修正済み(パイプライン内で解決) | 恒久対応の要否を [ADR-0003](../adr/0003-writer-arithmetic-policy.md) で検討 |
| ISSUE-008 | eeat-reviewer実行(記事2) | 1回目審査(fix-required)時に生成された`supervisor-request.md`に「現時点でverdict=fix-required」という注記が残ったままで、再審査でverdict=passに変わった後もファイルが更新されなかった。実際に人間の監修者へ送付する際、古い情報を読んで混乱する恐れがある(publish-managerが気づいて指摘したため実害は防げた) | Low | 未対応(新規発見) | 恒久対応を [ADR-0004](../adr/0004-refresh-supervisor-request-after-roundtrip.md) で提案 |
| ISSUE-009 | 運用計測(記事2・3共通) | Agent tool呼び出しは`duration_ms`で正確に計測できるが、Lead Editor(人間役)自身のレビュー作業には同等の壁時計計測手段が今回の環境に無く、正確な人間レビュー時間を計測できなかった(質的な記録のみ) | Low | 未対応(計測基盤の課題) | 恒久対応を [ADR-0006](../adr/0006-instrument-human-review-checkpoints.md) で提案 |
