# 46章 ai-company V2 — 編集部+運営部門の統合組織設計

- 作成日: 2026-07-05
- 位置づけ: 既存 `ai-company/`(9 Agent 編集部)を、V3で決定済みの13 Agent体制へ改修し、
  さらに43章のSEO運営部門(10 Agent)を加えた**2部門体制**へ再編する設計
- 改修実施までは現行 ai-company は凍結(42章 §3)

## §1 組織図

```
ai-company/
├── 編集部(Editorial)— 記事・ページを「作る」        ← 既存9 + V3追加4
│   ├── seo-director          # 編集方針・優先順位(48章CIの番人)
│   ├── keyword-strategist    # 執筆対象の選定(43章A2の機会リストを受ける)
│   ├── content-architect     # 記事設計(構成+KB参照マップ — G1ゲートの生産者)
│   ├── writer                # 執筆(F-1: KB参照マップ外の事実を書かない)
│   ├── fact-checker          # 全事実のKB/出典突合(G2/G3)
│   ├── eeat-reviewer         # E-E-A-T・YMYL表現検査
│   ├── internal-linker       # 内部リンク設計(43章A5と規則共有)
│   ├── schema-generator      # 構造化データ
│   ├── publish-manager       # 公開前最終チェック(G4)→人間検収(G5)への引き渡し
│   ├── knowledge-manager     # ★V3追加: KBカタログ管理・KB-2投入計画
│   ├── source-manager        # ★V3追加: 出典の登録・checkedAt更新管理
│   ├── knowledge-builder     # ★V3追加: 出典→KBレコード起案(draft限定)
│   └── data-validator        # ★V3追加: KB投入前の機械検証(kb-lint+verify系)
└── 運営部(Operations)— 公開後に「育てる」           ← 43章の10 Agent
    ├── gsc-analyzer / keyword-opportunity-finder / ctr-optimizer
    ├── content-decay-detector / internal-link-optimizer / serp-watcher
    ├── backlink-pr-planner / kpi-manager / rewrite-planner / index-coverage-monitor
```

部門間の接続は一方向に固定する:
**運営部は「提案(発注書)」だけを出し、公開物に触るのは常に編集部パイプライン**。
(例: rewrite-planner の指示書 → content-architect が受注 → G1〜G5 を通常記事と同様に通過)

## §2 ディレクトリ再編(改修時)

```
ai-company/
  agents/editorial/   # 既存9ファイルを移動+V3追加4を新規作成
  agents/ops/         # 43章の10 Agent定義(43章の各節をそのまま定義ファイル化)
  pipelines/          # article-batch(改修)+ weekly-ops / monthly-ops(新規)
  templates/          # kakomon-explanation.md は archive/ へ移動(使用禁止を構造で表現)
  ...(prompts/ schemas/ checklists/ は現行を改修)
```

## §3 パイプライン

| パイプライン | 頻度 | 流れ |
| --- | --- | --- |
| article(1本) | 都度 | 発注(機会リスト or 49章設計)→ G1設計 → G2執筆+KB突合 → G3/G4機械ゲート → G5人間検収 → 公開 |
| weekly-ops | 週次 | gsc-analyzer → index-coverage-monitor → kpi短報(43章 §1 サイクル) |
| monthly-ops | 月次 | decay/opportunity/rewrite-planner → リライトキュー承認 → article パイプラインへ発注 |
| kb-intake | 都度 | source-manager(出典登録)→ knowledge-builder(draft起案)→ data-validator(機械検証)→ **人間が kb-promote** |

## §4 モデル割当(42章 §1 の適用)

| 役割 | モデル | 理由 |
| --- | --- | --- |
| writer / internal-linker / schema-generator / 運営部の集計系(A1/A3/A4/A5/A8/A9/A10) | 軽量 | 手順+ゲートで守られる定型作業 |
| content-architect / fact-checker / eeat-reviewer | 軽量(P5 CI稼働後)。CI稼働前は高性能 | 検査の網羅性をCIが肩代わりできるようになってから軽量化 |
| knowledge-builder / data-validator | 軽量(起案のみ・昇格不可のため低リスク) | draft止まり |
| seo-director / knowledge-manager / serp-watcher の戦略結論 / backlink-pr の切り口妥当性 | 高性能(必要時のみ呼ぶ) | 制約の同時保持・戦略判断 |
| 全部門共通: ゲート/スキーマ/CI自体の変更 | 高性能+人間 | 42章 §6-1 |

## §5 改修の実装順(軽量モデルで可・計画承認必須)

1. templates の archive 化+README凍結注記(10分)
2. agents/ の editorial/ops 分割+V3追加4 Agent定義の新規作成(V3 34章の定義を正とする)
3. ops Agent 定義ファイル化(43章の各節を転記+data/ops/ 雛形作成)
4. パイプライン定義の改修(article-batch を G1〜G5 ゲート明示に書き換え)
5. ドライラン1本(44章 M2 #14)で全工程を検証 → 発見された欠陥を修正してから量産解禁申請

改修完了の定義: ドライラン1本が G1〜G5 を全通過し、人間検収で重大指摘0件。
