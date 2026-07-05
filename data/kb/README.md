# data/kb/ — Knowledge Base(KB-0: 規約のみの最小構成)

**KB = 出典・確認日・安定ID・有効期間つき構造化レコードの総体**(設計書V3)。
記事・pSEO・ドリル・ツールはすべてKBからの成果物であり、
**検証可能な事実はKBに登録してからでないと公開物に書けない**(F-1原則 — V3 30章 §2)。

## 現在の状態: KB-0(規約制定のみ)

- 共通エンベロープ: `types/kb.ts` の `KbMeta`(全レコード必須)。
- 検証: `npm run kb-lint`(`scripts/kb-lint.mjs` — V3 32章 §4 の骨格)。
- **データセットファイルはまだ作らない**(YAGNIゲート: 消費者が2つ以上確定するまで
  作らない — V3 35章 §1)。導入順は V3 35章 §2(KB-1=P6 と同時に統計系から)。

## 将来の配置(V3 31章 §2 カタログと1:1。着手時に追加)

| フェーズ | ファイル(予定) | データセット |
| --- | --- | --- |
| KB-1(P6) | `qualifications.ts` `jobs.ts` `facilities.ts` `prefectures.ts` `pseo-registry.ts` | A1〜A4 最小版・E7 |
| KB-2(P8前後) | `kasan.ts` `seido-events.ts` `glossary/` `faq/` `references.ts` `relations.ts` | B3/B4・D1/D2/D4・E3 |
| KB-3(Phase 3〜) | `laws.ts` `kaigo-hoken.ts` `employment-attrs.ts` `school-courses.json` `media-assets.ts` | B1/B2・A6・E5・D5 |

既存の `data/kyuryo/sources.ts`(C1)・`data/kakomon/exam-rounds.ts`(C4)・
`data/authors.ts`(A5)・`data/affiliate-links.ts`(E4)もKBの一部
(KbMeta への完全適合は各データの拡張時に実施 — V3 31章 §1 移行表)。

## 投入ルール(V3 32章)

- **出典必須・捏造禁止**: L2ファクトは `sourceIds` ≥1。出典に存在しない粒度を推計で埋めない(null許容)。
- **架空データ・仮の統計値・プレースホルダ値を置くことを禁止**する(空配列は可)。
- 履歴は消さない(統計=年度キー追加・制度=validFrom/validUntil・削除は archived=欠番)。
- AI起案・人間承認: status を verified/published に上げられるのは人間のみ。
