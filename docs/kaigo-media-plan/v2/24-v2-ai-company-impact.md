# 24. ai-company への影響レビュー

> 全58ファイルを対象に、機械検索(`過去問|kakomon|drill`)+構成レビューで判定した。
> **結論: 記事パイプラインは設計時点で C1(過去問)を対象外としていたため、ほぼ無傷。** 修正は「文言の読み替え」4ファイル+「凍結」1ファイル、追加は「ドリル生成パイプライン」一式(新規)。

## 1. コンポーネント別判定一覧

### agents/(9ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| seo-director.md | **要修正(軽微)** | L29「C1(過去問)は記事パイプラインの対象外(専用パイプライン)」→「C1'(試験・学習ドリル)は専用パイプライン(drill-batch)の対象」に文言変更。クラスタ配分の優先度参照先を V2 23章に変更 |
| keyword-strategist.md | 変更不要 | 予約語リスト(pref/job/guide/s/drill)は V2 でも同じ。`shiken` を予約語に追加する1語のみ(軽微) |
| content-architect.md / writer.md / fact-checker.md / eeat-reviewer.md / internal-linker.md / schema-generator.md / publish-manager.md | **変更不要** | 記事(C2〜C6)専用であり過去問への依存なし |

### pipelines/(3ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| article-batch.md / article-batch.workflow.js | 変更不要 | C1 除外設計のまま有効 |
| rewrite-batch.md | 変更不要 | |
| **drill-batch.md / drill-batch.workflow.js(新規)** | **追加** | ドリル生成パイプライン: 論点選定 → クリーンルーム生成(question-writer)→ 制度ファクトチェック → 類似性セルフチェック → 監修依頼キュー → status 管理。着手は P8(23章)のタイミングでよい |

### prompts/(4ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| shared-editorial-context.md / serp-analysis.md / rewrite.md / batch-kickoff.md | 変更不要 | 過去問への言及なし(機械検索で確認)。V2 追記事項として shared-editorial-context に「過去問の逐語利用は全工程で禁止(R-10)」の1行を追加すること(軽微・安全側の明示) |

### templates/(6ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| kakomon-explanation.md | **凍結** | 過去問転載が前提のF1規格。削除せず「許諾取得時のオプション」と冒頭に明記して保存 |
| **drill-question.md(新規)** | **追加** | オリジナル問題の作問規格(26章 §4 の F1' を運用形式にしたもの): 論点→問題文→選択肢→解説の生成ルール+クリーンルーム制約+禁止事項 |
| cta-blocks.md | 要修正(軽微) | 「(c1 過去問)」行→「(c1 学習ドリル)」。CTA設計(弱・資料請求/診断/LINE)は同じ |
| article-frontmatter.yaml / article-structure.md / stat-footnote.md / supervisor-request.md | 変更不要 | supervisor-request はドリル監修依頼にもそのまま使える |

### schemas/(10ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| batch-order.schema.json | 要修正(軽微) | description の「c1(過去問)は記事パイプライン対象外」の文言のみ更新。構造変更なし |
| **drill-question.schema.json(新規)** | **追加** | サイト本体の `KakomonQuestion`(origin:'original')と同一構造+パイプライン用メタ(類似性チェック結果・監修状態) |
| 他8本(allocation / article-plan / keyword-brief / draft-meta / factcheck-report / eeat-report / link-plan / jsonld-output / publish-manifest) | **変更不要** | 記事パイプライン専用 |

### checklists/(6ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| internal-links.md | 要修正(軽微) | 「過去問1問ページのみ4クリック以内」→ V2 ではドリル論点ページは3クラスタ同様3クリック以内(26章 §3 のURL階層)。ハブ例示の `/kakomon/` → `/shiken/` |
| **drill-quality.md(新規)** | **追加** | ドリル公開ゲート: 全問監修済み/正解の制度根拠明記/類似性チェック済み/選択肢の作問品質(明らかな消去法で解けない等)/制度改定注記 |
| banned-phrases.md / eeat.md / factcheck.md / jsonld.md / publish-gate.md | 変更不要 | |

### scripts/(4ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| validate-handoff.mjs / check-banned-phrases.mjs / check-frontmatter.mjs / pipeline-status.mjs | **変更不要** | スキーマ駆動なので drill-question.schema.json を置けば validate-handoff はそのまま使える |

### README.md

| 判定 | 内容 |
| --- | --- |
| 要修正(軽微) | ディレクトリ説明の「過去問解説」文言と、パイプライン全体像に drill-batch 系統を追記。「設計書との対応」表に V2 参照を追加(優先順: V2 > V1) |

## 2. 修正の実施タイミング

- **軽微修正5ファイル**(README / seo-director / keyword-strategist / cta-blocks / batch-order.schema / internal-links)…記事量産を開始する前(P3 完了時)までに実施。文言のみで挙動への影響なし。
- **新規追加一式**(drill-batch パイプライン+question-writer agent+テンプレ+スキーマ+チェックリスト)…P8(ドリルエンジン)着手時に作成。**それまで作らない**(1人運営の負荷管理。存在しないエンジンのパイプラインを先に作らない)。
- kakomon-explanation.md の凍結注記のみ即時実施してよい(誤使用防止)。

---

- 前: [23. 優先順位・実装順 V2](./23-v2-priorities.md)
- 次: [25. Programmatic SEO 台帳](./25-v2-programmatic-seo.md)
