# ADR-0001: `ai-company/work/` を `.gitignore` に追加する

- ステータス: Proposed
- 起票日: 2026-07-08
- 関連: 前回セッション(記事1ドライラン)からの未解決の指摘

## Context

`ai-company/README.md` は `ai-company/work/` を「工程間の中間成果物・ドラフト置き場」と説明し、gitignore することを暗に推奨しているが、実際の `.gitignore` にはエントリがない。現状 `ai-company/work/guide-1/`・`guide-2/`・`guide-3/` は3回のセッションを経て `git status` 上ずっと `??`(untracked)のまま蓄積している。

## Decision(提案)

`.gitignore` に `ai-company/work/` を追加する。これにより:
- 中間ドラフト・factcheckレポート等の作業ファイルがリポジトリ履歴に混入しない
- `git status` のノイズが減り、意図しない変更の見落としを防ぎやすくなる
- `ai-company/ops/`(issues-log・timing-log)や `ai-company/adr/` は運用記録として引き続きコミット対象のまま維持する(work/ とは別物)

## Consequences

- 既に `git status` 上untrackedのまま3世代分溜まっている `ai-company/work/guide-1〜3/` は、gitignore追加後もリポジトリ上に物理的には残る(ファイルシステム上は消えない。ignoreされるだけ)。掃除するかどうかは別途人間判断
- 将来、work/配下の成果物を監査目的で参照したい場合、gitではなくファイルシステム上の実体を直接見る必要がある(現状もコミットしていないため実質変化なし)

## Alternatives considered

- 現状維持(何もしない): READMEの記述と実装がズレたままになる。実害は小さいが「設計と実装の不整合」を運用フェーズでも放置することになり、今回のミッション趣旨(実運転で見つけた不整合を潰す)に反する
- work/配下も逐次コミットする(監査証跡として残す): 記事本文のドラフト過程まで全部commit historyに残るのは冗長。issues-log/timing-logで十分に監査可能
