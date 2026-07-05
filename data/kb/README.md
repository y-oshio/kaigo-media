# data/kb/ — Knowledge Base

**KB = 出典・確認日・安定ID・有効期間つき構造化レコードの総体**(設計書V3)。
記事・pSEO・ドリル・ツールはすべてKBからの成果物であり、
**検証可能な事実はKBに登録してからでないと公開物に書けない**(F-1原則 — V3 30章 §2)。

## 現在の状態: KB-1(統計KB — P6=実装#7 で導入)

- 共通エンベロープ: `types/kb.ts` の `KbMeta`(全レコード必須)。
- 検証: `npm run kb-lint`(エンベロープ+C2固有規則)/ `npm run verify:kyuryo`(C2の原本照合)。
- 導入済みデータセット:
  - `prefectures.ts` — A4 都道府県マスタ(47件。slug=id・公開後変更禁止)
  - `jobs.ts` — A2 職種マスタ最小版(給料pSEOで使う職種のみ)
  - `pseo-registry.ts` — E7 pSEOページ群レジストリ(結合式+公開ゲート+条件0記録)
  - `../update-calendar.ts` — E2 更新カレンダー
  - `../kyuryo/sources.ts`(C1)+ `../kyuryo/salary-*.json`(C2 — 原本XLSXから決定的生成)
- **A1 資格・A3 施設形態は未導入**(YAGNIゲート: 給料pSEO #1 の消費者に含まれないため。
  消費者が2つ以上確定した時点で追加 — V3 35章 §1)。
- status の昇格(draft→verified/published)は**人間のみ**が `npm run kb-promote` で行う。
  サイトが参照するのは verified/published のみ(`utils/kyuryo.ts`)。

## 将来の配置(V3 31章 §2 カタログと1:1。着手時に追加)

| フェーズ | ファイル(予定) | データセット |
| --- | --- | --- |
| KB-1 残り | `qualifications.ts` `facilities.ts` | A1・A3 最小版(消費者確定時) |
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
