# 33. AI編集部(ai-company)のKB対応 — Knowledge Base 中心の新ワークフロー

> ai-company README の「パイプライン全体像」と V2 24章を拡張する(既存9Agent・3パイプラインは廃止せず、上流にKB系統を追加して接続を変える)。**実装は段階導入**(§6・35章)であり、既存の article-batch は KB が薄い間も従来通り動く。

## 1. 新Agent(4種)

| Agent | 役割 | 入出力 | 人間ゲート |
| --- | --- | --- | --- |
| **knowledge-manager** | KB全体の編集長。更新カレンダー(32章 §5)の消化計画、データセット優先度、stale 対応の起案、KB健全性レポート(月次) | in: update-calendar・stale一覧・GSC実測 / out: kb-update-order(何をいつ更新するか) | 月次計画の承認 |
| **source-manager** | 一次資料の発見・取得・規約確認。C1/D4(出典マスタ)の管理者。公表元の巡回(週1) | in: kb-update-order / out: source-report(新資料・変更検知・R-14チェック結果) | 新規出典の承認 |
| **knowledge-builder**(Data Curator) | 一次資料→KBレコード案の構造化。既存レコードとの矛盾検出・diff 形式での起案 | in: source-report+対象スキーマ / out: kb-diff(追加・変更・stale化の提案) | — (起案のみ) |
| **data-validator** | kb-diff の意味検証(桁・単位・前年乖離・出典の読み違い・定義差混在)。機械CI(32章 §4)の後段 | in: kb-diff / out: validation-report(pass / 差し戻し) | pass 後に**人間が承認して KB コミット**(32章 §3) |

- 命名はユーザー提示の候補(Knowledge Manager / Data Curator / Data Validator / Source Manager)に対応。Data Curator は knowledge-builder として実装する(「builder=起案、validator=検証」の対で責務が明確になるため)。
- 定義ファイルは `ai-company/agents/` に追加(knowledge-manager.md ほか3つ)。**Agent数は 9→13**。

## 2. 新フロー全体像(KB中心)

```
【KB更新系統(新設)— 週次/イベント駆動】
update-calendar・官報/省庁監視
  └→ [knowledge-manager] 更新計画 …………………… kb-update-order
      └→ [source-manager] 資料取得・規約確認 ……… source-report
          └→ [knowledge-builder] 構造化・diff起案 … kb-diff
              └→ 品質CI(機械) → [data-validator] … validation-report
                  └→ ★人間承認 → KBコミット(status: verified)

【成果物生成系統(既存3+新1パイプライン)— KBを唯一の事実源として消費】
                  KB(data/)
                   │ kb-context(記事に必要なレコード抽出)
  ┌────────────────┼──────────────┬─────────────┐
[article-batch]   [stat-page-batch] [drill-batch]  [tool-data]
  seo-director      統計ページ生成      論点選定→作問     計算機データ
  keyword-strategist (V2 24章)        (V2 26章 §5)     (C5参照)
  content-architect
  writer(KB素材注入)
  fact-checker(★KB照合に変更 — §4)
  eeat-reviewer(D4 信頼度クラス参照)
  internal-linker(E3 グラフ参照 — 34章 §3)
  schema-generator(KB→JSON-LD — 34章 §5)
  publish-manager
```

- ユーザー例示の「Source Manager → Knowledge Builder → Data Validator → Writer → Fact Checker → EEAT → Publisher」の直列は、**上流(KB更新)と下流(生成)を疎結合にした形で採用**する: KB更新は記事制作と同期しない(週次で先行)。**KB不足時の同期待ちは禁止**(§4 の非同期プロトコル — article-batch はステートレス並行実行であり「待つ」機構を持たないため。パネル A-01)。
- **競合の排他(パネル A-03)**: kb-diff の人間承認待ちの間に生成バッチが旧レコードを使う競合を防ぐため、(1) kb-batch は**承認待ち diff の対象レコードID一覧(pending リスト)**を出力し、kb-context 抽出はpendingレコード検知で警告(B3/C5 等の重大データセットは当該記事を保留)、(2) **publish-manager の最終ゲートに「kbRef 参照値と KB HEAD の再突合」を追加**、(3) 統計公表予定日近傍の発注凍結(32章 §5-1)。

## 3. 既存コンポーネントへの影響一覧(**V2 24章 §1 の判定を上書きする**)

> V2 24章で「変更不要」とした writer / fact-checker / internal-linker / schema-generator は、KB導入フェーズ(35章)で「要修正」となる。**矛盾ではなく前提の転換(KB中心化)による改訂**である(優先順 V3 > V2)。V2 24章 §2 の実施タイミングだけを読んで4Agentの修正を漏らさないこと(24章側にも注記済み)。

### agents/(9→13ファイル)

| ファイル | 判定 | 内容 |
| --- | --- | --- |
| **knowledge-manager / source-manager / knowledge-builder / data-validator(新規4)** | 追加 | §1 の定義。導入時期は35章(KB-1〜KB-2) |
| writer.md | **要修正(中)** | 執筆素材の優先順を「kb-context > 自力調査」に変更。**数値・制度・費用・日付は kb-context 内のレコードのみ使用可**(F-1)。KBにない事実が必要な場合は**待たずに** `【KB昇格依頼: …】` マーカーを残して書き切る(§4 の非同期プロトコル)。**体験談・取材コメント由来の数値は F-1 の対象外**とし `<!--exp:...-->` 免除マーカー+帰属表示(「取材: ◯◯さんの例」)で書いてよい(Experience シグナルを削らない — パネル S-02) |
| fact-checker.md | **要修正(大)** | §4 参照。一次責務が Web照合 → KB照合へ |
| eeat-reviewer.md | 要修正(軽微) | 出典の信頼度判定を D4 references の信頼度クラス参照に変更 |
| internal-linker.md | 要修正(中) | 手書き対応表 → E3 関係グラフからの導出に変更(34章 §3) |
| schema-generator.md | 要修正(軽微) | Person/Dataset/FAQPage の生成元を KB 参照に統一(34章 §5) |
| seo-director / keyword-strategist / content-architect / publish-manager | 変更不要 | (keyword-strategist は E1 台帳を既に参照しており実質KB運用済み) |

### pipelines / schemas / templates / checklists / scripts

| 対象 | 判定 | 内容 |
| --- | --- | --- |
| **kb-batch.md / kb-batch.workflow.js(新規)** | 追加 | §2 上段のKB更新系統。月次定例+イベント駆動で起動。**仕様書に「失敗・再実行」章を必須で含める**(パネル A-04): diff 単位のリトライ・既存 pending diff との重複検出(冪等性)・orderId 規約。**承認待ち kb-diff は gitignore の work/ ではなく git 管理の `data/kb-queue/` に置く**(承認前消失の防止。承認後に適用して削除) |
| article-batch.workflow.js | 要修正(中) | writer 前に kb-context 抽出ステップを挿入(KBから対象クラスタ・エンティティのレコードを収集して渡す)。pending リスト検知(§2)もここで行う |
| **新規 schema(段階導入 — パネル A-04)** | 追加 | KB-1: source-report / validation-report / **kb-diff**(形式を確定する: `{dataset, schemaVersion, ops: [{op: 'add'\|'update'\|'stale', id, before?, after, reason, sourceIds}]}` のレコード単位封筒 — パネル D-05)。KB-2: kb-update-order。KB-3: kb-context。**kb-record 単独スキーマは作らない**(KbMeta 共通スキーマ+データセット別 Zod に一本化。二重定義の禁止) |
| **checklists/kb-approval.md(新規)** | 追加 | 人間のKB承認チェックリスト(出典実在・桁・定義差・validFrom/Until・R-14) |
| templates/stat-footnote.md | 要修正(軽微) | 出典脚注を sourceId からの自動生成に変更(手書き廃止) |
| scripts/validate-handoff.mjs | 変更不要 | スキーマ駆動なので新スキーマを置くだけ |
| **scripts/kb-lint.mjs(新規)** | 追加 | 32章 §4 の品質CI実体(スキーマ・参照整合・鮮度・定義差) |
| prompts/shared-editorial-context.md | 要修正(軽微) | F-1原則(KBにない事実は書けない)と kb-context の使い方を追記 |

## 4. fact-checker の再定義(V3 の要)

| | V2 まで | V3 |
| --- | --- | --- |
| 一次責務 | 記事中の【要出典】を Web で調査・検証 | **記事中の事実主張を KB と突合**(kbRef の付与・値の一致確認)。**ただし一次情報主義は放棄しない**: KB照合した事実の10件に1件は出典原本まで遡るサンプリング再検証を残す(パネル A-02) |
| KBにない事実 | その場で出典を探して脚注化 | **(a) KB昇格**: kb-diff を副産物として出力し、記事は新ステータス **`awaiting-kb`**(publish-manifest に追加。blocked と区別し30%停止則に数えない — パネル A-01)で保留。KBコミット後に rewrite-batch で再注入 / **(b) 削除**: 昇格に値しない些末な数値は記事から落とす(**体験・取材由来の `exp` マーカー付き数値は削除判定から除外** — パネル S-02)。**「記事にだけ存在する事実」を作らない** |
| **KBが間違っている場合**(新設 — パネル A-02) | — | verdict に **`kb-suspect`** を追加: 一次資料とKBの不一致を検知したら記事を保留し、**修正型 kb-diff+当該レコードの逆引き影響URL一覧(34章 §4)を添えて** data-validator→人間承認へ回す。下流からの誤り検知チャネルを常設する(R-16: KBの誤りは全成果物へ波及するため、「記事をKBに合わせる」を無条件の既定動作にしない) |
| 成果物 | factcheck-report | factcheck-report+**kb-diff(昇格依頼・修正提案の副産物)** — 記事を書くほどKBが太る(F-1 の flywheel) |

- **kbRef の実装形(設計)**: 記事 Markdown 内の数値・制度記述に `<!--kb:C2:salary-hokkaido-kaigo-2025-->` 形式の参照コメントを付ける(表示に影響しない)。ビルド時に (a) 参照先の存在・status=published を検証、(b) **逆引きインデックス(どのページがどのレコードを使うか)を生成**(34章 §4)。導入は統計値から段階的に(32章 §4「F-1突合」の warning→error 化と同期)。

## 5. ドリル・pSEO パイプラインとKB

- **drill-batch(V2 26章 §5)は変更不要**: 論点マスタ・法令・公的資料=KB(D3/B1/B2)を素材にする設計が最初からKB中心である。V3 で明確になるのは「クリーンルームの許可素材=KBに登録済みのレコードのみ」という機械的な線引き(31章 §4)。
- **stat-page-batch(V2 24章)は KB消費者の第1号**: C2/C3 → テンプレ×独自ブロック生成。V3 での追加は「KB更新(年次統計)がトリガーとなって自動起動する」接続(32章 §5-1 のカレンダー行と1:1)。
- **再生成の検品二分規約(パネル S-01 — V2 検品ゲートの空洞化防止)**: KB更新起点の再生成物は次で二分する — **(a) 数値・グラフ・表・脚注の差し替えのみ → 無検品で再ビルド可**/**(b) 文章ブロック(編集部解説段落・前年差の記述等)の変更を含む → V2 24章の検品キューを必須で通す**。kbRef 逆引き(34章 §4)で「本文文章が変わったページ一覧」を自動抽出し検品対象とする。年次統計更新で数百ページの解説文が無検品で機械書き換えされる経路を開けない。

## 6. 導入順(35章と同期。**一気に作らない**)

1. **KB-0(P2〜P3 と並走)**: 規約だけ導入(KbMeta・kb-lint の骨格)。Agent追加なし。
2. **KB-1(P6 と同時)**: source-manager+data-validator の2Agentのみ追加(統計KB更新に必要な最小構成)。kb-batch は手動起動。**KB-1 期の暫定RACI(パネル K-07)**: knowledge-builder が不在のため、**構造化・起案(kb-diff 作成)は source-manager が兼務**する(統計は表形式で構造化が単純なため成立する。制度系B群の起案が始まる KB-2 で knowledge-builder に分離)。
3. **KB-2(P8 前後)**: knowledge-builder・knowledge-manager を追加し、kb-update-order 駆動の定例運用へ。fact-checker のKB照合を warning モードで開始。
4. **KB-3(Phase 3〜)**: kbRef の error 化・internal-linker のグラフ移行・article-batch の kb-context 必須化。
- 理由: V2 24章の原則「存在しないエンジンのパイプラインを先に作らない」を継承。KBが薄い段階で F-1 を強制すると記事が書けなくなるため、**KBの充実度に合わせてゲートを締める**。

---

- 前: [32. データガバナンス](./32-data-governance.md)
- 次: [34. Programmatic SEO とデータ](./34-programmatic-seo-data.md)
