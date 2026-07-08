# パイプライン仕様書: article-batch(記事量産パイプライン)

「記事をN件追加して」を publish-manifest × N に変換する基幹パイプライン。実行体は `article-batch.workflow.js`(Claude Code の Workflow ツール)。

## 1. ステージ構成

| # | ステージ | Agent | 入力 → 出力 | 実行単位 |
| --- | --- | --- | --- | --- |
| 0 | バッチ設計 | seo-director | batch-order → allocation | バッチで1回 |
| 1 | キーワード選定 | keyword-strategist | allocation → keyword-brief × N | バッチで1回(N件出力) |
| 2 | 記事設計 | content-architect | brief → article-plan | 記事ごと(並行) |
| 3 | 本文作成 | writer | plan → draft + meta | 記事ごと(並行) |
| 4 | ファクトチェック | fact-checker | draft → checked.md + report | 記事ごと(並行) |
| 5 | E-E-A-T審査 | eeat-reviewer | checked → eeat-report(fix時 writer と最大2往復) | 記事ごと(並行) |
| 6 | 内部リンク | internal-linker | checked → linked.md + link-plan | 記事ごと(並行) |
| 7 | JSON-LD QA | schema-generator | linked → QA結果(publish-managerへ直接報告、ファイル生成なし) | 記事ごと(並行) |
| 8 | 最終ゲート | publish-manager | 全成果物 → publish-manifest + final/ | 記事ごと+summary はバッチ末尾 |

- ステージ2〜8は `pipeline()`(バリアなし)。記事Aがステージ6にいる間に記事Bはステージ3でよい
- バリアは2箇所のみ: ①ステージ1完了(全briefsのカニバリ相互チェックに全件必要)②summary生成(全manifestが必要)

## 2. ハンドオフ規約

- 全受け渡しは `work/<orderId>/` 配下のファイル+ `schemas/*.schema.json` 準拠
- Agent は前工程の成果物を**ファイルから読む**(会話文脈に依存しない=リトライ・再開可能)
- スキーマ違反の成果物を受け取った Agent は作業せず差し戻す(壊れた入力での「善意の推測」禁止)

## 3. 人間ゲート(自動化しない領域)

| ゲート | タイミング | 内容 |
| --- | --- | --- |
| G1 公開承認 | manifest: ready 後 | draft: false への変更・本番反映・commit は人間のみ |
| G2 監修 | manifest: awaiting-supervisor | 依頼送付・反映確認は人間(ドラフトはAIが用意) |
| G3 体験談 | EXPERIENCE-SLOT あり | 真正な体験談の調達・挿入は人間(AIの創作禁止) |

## 4. 失敗・差し戻しポリシー

| 事象 | 処理 |
| --- | --- |
| fact-checker がマーカー漏れ5件超を検出 | writer へ差し戻し(1回)。再発なら記事を blocked にして続行 |
| eeat-reviewer の fix-required | writer 修正 → 再審査(最大2往復。3回目は reject → blocked) |
| eeat-reviewer の reject | 当該記事は blocked。パイプラインは他記事を続行(全体を止めない) |
| Agent がエラー・null 返却 | 当該記事のみ blocked(理由: 工程未完了)。バッチは続行 |
| blocked 率が30%を超過 | それ以上の新規着手を停止し、summary に「系統的問題の疑い」を記録(seo-director のレトロスペクティブ対象) |

## 5. スケール規則(R-03: スケールドコンテンツ対策)

- 1バッチの公開推奨は50件まで。100件発注時は 50+50 のサブバッチとし、**前サブの GSC インデックス登録率90%以上を確認してから**次サブを公開する(確認は人間+GSC)
- パイプライン生成自体は100件連続で構わない(公開ゲートで制御する)

## 6. 再開(resume)

Workflow の resumeFromRunId で途中から再開できる。完了済み記事の agent() 結果はキャッシュされ、失敗記事のみ再実行される。work/ の成果物ファイルが残っていれば、新規ランでも publish-manager だけを再実行して復旧できる。
