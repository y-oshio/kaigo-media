# ai-company — 介護求人SEOサイトを自動制作・運営するAI編集部

`docs/kaigo-media-plan/`(完全設計書)を運用実体に落とし込んだ、マルチエージェント制作システム。
ユーザーが **「記事を100件追加して」** と依頼するだけで、9つの専門Agentが連携して
**SEO設計 → キーワード選定 → 記事設計 → 本文作成 → ファクトチェック → E-E-A-Tチェック → 内部リンク → JSON-LD → 公開準備** までを完了させる。

> 設計原則(必読): 自動化のゴールは「**公開準備完了(ready)**」まで。
> **公開の最終承認・監修者確認の2つだけは人間ゲート**として残す(設計書04章「AIが書いた記事を無検証で量産することを明示的に禁止」に準拠)。

## ディレクトリ構成

```
ai-company/
  agents/       # 9つのAgent定義(Claude Code サブエージェント形式。役割/責任/入出力/判断基準/禁止事項/レビュー項目/プロンプト/受け渡し)
  templates/    # 記事frontmatter・構成・過去問解説・統計脚注・CTA・監修依頼のテンプレート
  checklists/   # 各工程のチェックリスト(Agentのセルフレビューと人間の最終確認の両方で使用)
  prompts/      # 共通コンテキスト・SERP分析・リライト・バッチ起動などの共有プロンプト
  pipelines/    # パイプライン仕様書 + Workflow 実行スクリプト
  schemas/      # Agent間の受け渡しデータのJSON Schema(全ハンドオフはこの型を通す)
  scripts/      # 検証スクリプト(ハンドオフ検証・禁止表現・frontmatter・進捗集計)
  work/         # 実行時の中間成果物置き場(orderId ごと。gitignore 推奨)
```

## Claude Code への配置方法

1. **Agentの登録**: `agents/*.md` をプロジェクトの `.claude/agents/` にコピー(またはシンボリックリンク)する。

   ```bash
   mkdir -p .claude/agents && cp ai-company/agents/*.md .claude/agents/
   ```

2. **起動**: Claude Code に「記事を100件追加して」と依頼する。メインのClaudeが `prompts/batch-kickoff.md` の手順に従い、`pipelines/article-batch.workflow.js` を Workflow ツールで実行する(件数・クラスタ指定は自然文でよい: 「悩み系を30件」等)。

3. **完了後**: `work/<orderId>/manifest-summary.md` に全記事のステータス(ready / blocked / awaiting-supervisor)が出力される。人間は
   - `awaiting-supervisor` → `templates/supervisor-request.md` で監修依頼
   - `ready` → `checklists/publish-gate.md` で最終確認して公開
   のみを行う。

## パイプライン全体像

```
ユーザー「記事を100件追加して」
  └→ [seo-director] バッチ設計(クラスタ配分・優先度) ……… batch-order → allocation
      └→ [keyword-strategist] キーワード選定(カニバリ検知込み) … keyword-brief × N
          └→ 記事ごとに並行パイプライン(pipeline() — バリアなし):
             [content-architect] 記事設計 → article-plan
             [writer]            本文作成 → draft(【要出典】マーカー付き)
             [fact-checker]      出典検証 → factcheck-report(未解決なら差し戻し)
             [eeat-reviewer]     E-E-A-T/法令/校閲 → eeat-report
             [internal-linker]   内部リンク設計 → link-plan
             [schema-generator]  JSON-LD QA検証(ArticleView.vue等の自動生成が正しくなるかを確認、ファイル生成なし)
             [publish-manager]   最終ゲート → publish-manifest(ready / blocked / awaiting-supervisor)
```

- 各矢印のデータは `schemas/*.schema.json` に準拠し、`scripts/validate-handoff.mjs` で機械検証できる。
- 失敗・差し戻しの規則は `pipelines/article-batch.md` §4 を参照。

## 設計書との対応(このシステムの憲法)

| 参照 | 内容 |
| --- | --- |
| 設計書04章 | 編集ガイドライン・E-E-A-T要件・制作フロー(全Agentのプロンプトが参照する上位規範) |
| 設計書03章 | URL規則・内部リンク規則(internal-linker の判断基準) |
| 設計書05章 | 構造化データ・rel="sponsored"(schema-generator / publish-manager) |
| 設計書07章 | クラスタ別CTA・計測スキーマ(writer / publish-manager) |
| 設計書09章 | 仮説・リスク台帳(数値を断定しない根拠) |

矛盾が生じた場合は **設計書 > このREADME > 各Agent定義** の優先順で解決する。

## 配置

`projects/kaigo-media/` がこのプロジェクトの正式ディレクトリ(2026-07-04 ユーザー指示で確定)。
`ai-company/` と `docs/kaigo-media-plan/`(設計書)は同じ `kaigo-media/` 直下にあり、Agent 内の `docs/kaigo-media-plan/...` 参照は **kaigo-media/ を作業ディレクトリとして実行する**前提で解決される。Nuxt サイト本体(`content/` `data/` 等)も今後この直下に実装する。
