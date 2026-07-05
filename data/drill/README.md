# data/drill/ — オリジナル学習ドリル(KB D3)

V2 26章 §3 の決定により、ドリルのデータ置き場は **`data/drill/` に統一**する
(V1 06章 §1 の `data/kakomon/drills/` は**廃止** — 空のまま温存されているが使用しない。
kakomon 配下はオプション凍結中の過去問専用)。

## 配置規則

```
data/drill/
  topics.ts                    # 論点マスタ(DrillTopic[] — types/kakomon.ts)
  <subjectSlug>/
    <topicSlug>.json           # 論点の問題(KakomonQuestion[] origin:'original'・全問に安定 id 必須)
  answer-stats.json            # 正答率集計(GA4 月次エクスポート → コミット。V2 26章 §6-2)※P8 以降
```

## 投入ルール(V2 26章・V3 32章)

- **クリーンルーム生成のみ**: 過去問本文・市販問題集のテキストをAI入力に使わない(R-10)。
- **全問監修必須**: `supervisorId`・`reviewedAt` のない問題は公開しない(R-13)。
- **安定ID**: `kfs-<subject>-<topic>-001` 形式。差し替え時は欠番にし再利用しない。
- **捏造禁止**: 仮の問題・仮の統計値を置かない。データ投入は P8 着手時
  (監修契約+T-0c SERP意図検証の通過が前提 — V2 23章 P8)。
- JSON は `npm run kb-lint` の検証対象(id 重複・必須フィールド)。
