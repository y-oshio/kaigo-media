# バッチ起動プロンプト(メインのClaude Codeが「記事を100件追加して」を受けた時の手順)

ユーザーの発注(例: 「記事を100件追加して」「悩み系を30件」)を受けたら、以下を実行する。

## 1. 発注の正規化

自然文から `batch-order` を組み立てる(schemas/batch-order.schema.json):
- 件数 → requestedCount(明示なしなら確認せず10件でスモールスタートし、その旨を報告)
- 「悩み系」→ c4、「給料」→ c3、「資格」→ c2、「施設」→ c5、「職種」→ c6 にマッピング
- orderId は `ord-<日付>-<連番>` で発番
- `work/<orderId>/order.json` に保存

## 2. パイプライン実行

Workflow ツールで `pipelines/article-batch.workflow.js` を実行する:

```
Workflow({
  scriptPath: "ai-company/pipelines/article-batch.workflow.js",
  args: { orderId: "<orderId>", requestedCount: <N>, clusters: [...], today: "<YYYY-MM-DD>" }
})
```

- `today` は必ず渡す(スクリプト内で日付関数が使えないため)
- 100件超は seo-director がサブバッチ分割を計画する(スクリプト側が allocation に従う)

## 3. 完了後の報告(ユーザーへ)

`work/<orderId>/manifest-summary.md` を読み、以下の形式で報告する:

```
バッチ <orderId> 完了。
- ready(公開承認待ち): N件
- awaiting-supervisor(監修待ち): N件 → 監修依頼ドラフト: work/<orderId>/eeat/*.supervisor-request.md
- blocked(差し戻し): N件(主な理由: ...)

あなたの作業(3つだけ):
1. ready の記事を publish-gate.md の E1 で承認(draft: false)
2. 監修依頼 N 件を送付
3. EXPERIENCE-SLOT のある記事 N 件に体験談を挿入
```

## 4. してはいけないこと

- ユーザー承認なしに content/ 本番反映・commit・デプロイ
- blocked 記事の握りつぶし(必ず件数と理由を報告)
- パイプラインを通さない記事の作成(「1件だけだから」の近道禁止)
- 発注の勝手な水増し・削減(allocation の件数調整は seo-director の rationale 付き提案として報告)
