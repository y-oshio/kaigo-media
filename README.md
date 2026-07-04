# kaigo-media — 介護求人SEOメディア(構築中)

介護職・介護転職希望者向けの情報メディア。Google検索のみで月間100万PVを目標とし、介護転職アフィリエイトで収益化する。

## 現在地

**設計フェーズ完了・実装未着手。** サイト本体(Nuxt 3)はまだこのディレクトリに存在しない。

| ディレクトリ | 内容 |
| --- | --- |
| `docs/kaigo-media-plan/` | 完全設計書13章(戦略・キーワード・情報設計・E-E-A-T・技術・データ・CV・KPI・仮説台帳・実装順・レビューログ)。**すべての意思決定の上位規範** |
| `docs/session-log-*.md` | セッション記録・引き継ぎ |
| `ai-company/` | 記事量産の9-Agentパイプライン(Claude Code サブエージェント+Workflow)。「記事をN件追加して」で稼働 |

## 最初に読むもの

1. `docs/kaigo-media-plan/00-executive-summary.md`(戦略の全体像)
2. `docs/session-log-2026-07-04.md`(直近の状態と次のアクション)
3. `docs/kaigo-media-plan/10-implementation-order-and-tools.md`(実装順序)

## 技術スタック(予定 — projects/ 標準)

Nuxt 3 + TypeScript strict + Tailwind + Vercel(SSG)。実DBなし(TS/JSON + ビルド時静的生成)。
既存 `../aff-v1-kaigo-shindan/` の診断・/go/ リダイレクタ・LINE CTA を移植する(移植と同時に旧サイトは301統合 — 設計書03章)。

## 着手前の必須タスク

**過去問転載の許諾確認(T-0a)が全体のクリティカルパス。** 許諾回答前に過去問ページを公開してはならない(設計書 R-01。プランB=オリジナル一問一答も設計済み)。
