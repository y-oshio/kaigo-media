# 31. マスターデータ設計 — KB全データセットのカタログと規格

> V1 06章 §1〜§2 を拡張する(既存スキーマ Exam/ExamRound/Subject/KakomonQuestion/StatSource/SalaryStat/Author/AffiliateLink と V2 26章の DrillTopic はすべて有効なまま、KBの一部として包含する)。
> **実装は段階導入**(35章)。本章は「最終形の台帳」であり、全部を最初に作ることを要求しない(YAGNIゲート: 消費者が2つ未満のデータセットは作らない)。

## 1. 共通エンベロープ(全データセット共通の必須メタ)

```ts
/** 全KBレコードに共通するメタ。types/kb.ts に置く(実装はKB-0 — 35章) */
interface KbMeta {
  id: string                 // 安定ID(不変・欠番運用。V2 26章の問題ID規約を全KBへ一般化)
  sourceIds: string[]        // 出典(C1 stat-sources / D4 references のID)。L2ファクトは1つ以上必須
  checkedAt: string          // 出典を最後に確認した日 'YYYY-MM-DD'
  validFrom?: string         // 制度系: 適用開始(例: 加算率の年度)
  validUntil?: string        // 制度系: 失効日(改定で閉じる。開いている=現行)
  updatedAt: string          // レコード更新日
  status: 'draft' | 'verified' | 'published' | 'stale' | 'archived'   // 32章 ライフサイクル
  note?: string
}
```

- **バージョン管理(全データセット共通)**: 履歴の唯一の保管庫は **git**。加えて (a) データセットごとに `schemaVersion` をファイル先頭で宣言、(b) 統計系は**上書きせず年度キーで追加**(V1 06章 SalaryStat の複合キー方式を一般化)、(c) 制度系は `validFrom`/`validUntil` で新旧を並存(旧レコードを消さない=タイムライン成果物の源泉)、(d) エンティティ系は上書き更新(履歴はgitで十分)。ID は全データセットで不変・再利用禁止。
- **型検証**: 全データセットに Zod スキーマ(または JSON Schema)を1:1で用意し、品質CI(32章 §4)で機械検証する。

## 2. データセットカタログ(6ドメイン・26データセット)

優先=導入Phase(35章)。責任表記: **収集**=誰が集めるか/**承認**=公開判断(YMYL系は人間必須)。

| ID | データセット | 主な内容 | 物理置き場(案) | 更新頻度 | 収集/承認 | 主な出典 | 優先 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | 資格マスタ | 介護系資格の要件・ルート・費用相場 | `data/kb/qualifications.ts` | 制度改正時 | AI/人間 | 法令・試験センター・スクール公表 | KB-1 |
| A2 | 職種マスタ | 職種の定義・業務範囲・必要資格 | `data/kb/jobs.ts` | 制度改正時 | AI/人間 | 法令・職業情報提供サイト | KB-1 |
| A3 | 施設形態マスタ | 施設種別の法的根拠・人員配置・特徴 | `data/kb/facilities.ts` | 制度改正時 | AI/人間 | 介護保険法・老人福祉法・厚労省資料 | KB-1 |
| A4 | 都道府県マスタ | 県コード・最低賃金・級地・介護職員数 | `data/kb/prefectures.ts` | 年次 | AI/人間 | JIS X 0401・厚労省・第9期計画 | KB-1 |
| A5 | 監修者・執筆者 | 資格・経歴・科目適性 | `data/authors.ts`(既存) | 随時 | 人間/人間 | 本人確認 | 済 |
| A6 | 求人属性タクソノミ | 雇用形態・勤務形態・待遇属性の統一語彙 | `data/kb/employment-attrs.ts` | ほぼ不変 | 人間/人間 | 編集部定義(語彙統一用) | KB-3 |
| B1 | 法令マスタ | 介護保険法等の条項参照・施行日 | `data/kb/laws.ts` | 改正時 | AI/人間 | e-Gov 法令検索 | KB-3 |
| B2 | 介護保険制度トピック | 要介護度・自己負担・支給限度額 等 | `data/kb/kaigo-hoken.ts` | 改定時 | AI/人間 | 厚労省告示・老健局資料 | KB-3 |
| B3 | 加算マスタ(処遇改善含む) | 加算の率(サービス種別×区分×年度)・算定要件要旨 | `data/kb/kasan.ts` | 報酬改定(3年)+随時 | AI/人間 | 厚労省告示・通知 | KB-2 |
| B4 | 制度改正イベント | 改正・改定・補助金の時系列+影響範囲 | `data/kb/seido-events.ts` | 随時 | AI/人間 | 官報・厚労省・WAM NET | KB-2 |
| C1 | 統計出典マスタ | 調査名・公表URL・定義注記・次回公表 | `data/kyuryo/sources.ts`(既存を昇格) | 公表毎 | AI/人間 | 各統計の公表ページ | 済 |
| C2 | 給与統計 | 県×職種×施設×年度の給与値(null許容) | `data/kyuryo/*.json`(既存を拡張) | 年次 | AI/人間 | 賃金構造基本統計・処遇状況等調査 | KB-1 |
| C3 | 労働統計 | 求人倍率(月次)・離職率・従事者数 | `data/kb/labor-stats.json` | 月次/年次 | AI/機械+人間 | 職業安定業務統計・介護労働実態調査 | KB-2 |
| C4 | 試験統計 | 回次・合格点・合格率・受験者数 | `data/kakomon/exam-rounds.ts`(既存) | 年次(試験毎) | AI/人間 | 試験センター発表 | 済 |
| C5 | 税・社会保険料率 | 計算機の料率モデル(年度付き) | `data/tools/tax-model.ts`(V2 25章 T9) | 年次(4月) | AI/人間 | 協会けんぽ・国税庁・自治体 | KB-1 |
| D1 | 用語集(略語含む) | 用語の自作定義・読み・略語↔正式名称 | `data/kb/glossary/*.json` | 随時蓄積 | AI/人間 | 法令・厚労省資料(定義の根拠) | KB-2 |
| D2 | FAQ | 質問+自己完結の回答(出典つき) | `data/kb/faq/*.json` | 随時蓄積 | AI/人間 | KB内ファクト(F-1原則) | KB-2 |
| D3 | 試験・ドリル(V2 26章) | 試験・科目・論点・問題・(過去問=凍結) | `data/kakomon/` `data/drill/`(既存設計) | V2 26章 §5 | AI/監修者 | 出題基準の論点名・法令 | P8 |
| D4 | 参考文献マスタ | 統計以外の一次資料(通知・GL・白書) | `data/kb/references.ts` | 随時 | AI/人間 | 各発行元 | KB-2 |
| D5 | 画像・図表アセット | alt・出典・ライセンス+図表は「元データ+生成仕様」 | `data/kb/media-assets.ts` | 随時 | AI/人間 | 自作・ライセンス確認済み素材 | KB-3 |
| D6 | 独自一次データ | ドリル正答率・診断集計・独自調査 | `data/drill/answer-stats.json` ほか | 月次 | 機械/人間 | 自サイト計測(GA4経由 — V2 26章 §6-2) | P8〜 |
| E1 | キーワード・クエリ台帳 | クエリ→担当URL・状態(カニバリ検知) | `data/keyword-map.csv`(既存) | 週次〜月次 | AI/人間 | T-0c実測・GSC | 済 |
| E2 | 更新カレンダー | 公表予定・試験日程・改定日→影響範囲 | `data/update-calendar.ts`(既存を拡張) | 月次消化 | 人間 | C1/B4 から導出 | KB-1 |
| E3 | エンティティ関係グラフ | 資格−職種−施設−統計−記事の関係(型付き) | `data/kb/relations.ts`(internal-link-map を置換) | 随時 | AI/人間 | 編集部定義 | KB-2 |
| E4 | ASP案件マスタ | /go/ リンク・案件・報酬・LINE可否 | `data/affiliate-links.ts`(既存) | 提携毎 | 人間 | ASP管理画面 | 済 |
| E5 | スクール・講座データ | 資格×県×講座の費用・形式(R-14対象) | `data/kb/school-courses.json` | 年2回以上 | AI/人間 | 各スクール公表(規約確認必須) | KB-3 |
| E6 | 診断定義 | 8タイプ・質問・結果→施設/職種マップ | `data/kb/shindan.ts` | 随時 | 人間 | 編集部定義(既存移植 P7) | P7 |

- **「求人属性(A6)」の位置づけ**: 求人DBは持たない(V2 21章で不参入決定・不変)。A6 は記事・診断・比較で使う**語彙の統一辞書**(「夜勤専従」「2交代」等の表記ゆれ防止+診断マッピングのキー)に限定する。
- 既存データセット(A5/C1/C4/E1/E2/E4)は V1 06章で設計済み。V3 では KbMeta 適合と出典義務の強化のみ(35章 KB-0)。

## 3. ドメイン別の詳細定義

以下、代表スキーマと7属性(保持項目/型/更新頻度/更新責任/出典/バージョン管理/AI利用方法)。バージョン管理は §1 共通規約が既定で、例外のみ記す。

### A. エンティティ層

```ts
/** A1 資格マスタ */
interface Qualification extends KbMeta {
  slug: string               // 'shoninsha' 等(URL・統計ジョインのキー)
  name: string               // '介護職員初任者研修'
  category: 'kokka' | 'kounin' | 'minkan'   // 国家資格/公的/民間
  lawRefs: string[]          // B1 参照(根拠法令。国家資格のみ)
  requirements: string       // 受験・受講要件(自分の言葉で要約)
  routes: { from: string; period: string; note?: string }[]   // 取得ルート(pSEO #22 の源泉)
  costRange?: { min: number; max: number; sourceId: string }  // 費用相場(E5 集計から導出)
  renewal?: string           // 更新要否(#32)
  relatedJobSlugs: string[]  // A2 参照
  examSlug?: string          // D3 参照(試験がある資格)
}

/** A3 施設形態マスタ */
interface FacilityType extends KbMeta {
  slug: string               // 'tokuyo' 等
  name: string; aliases: string[]
  lawBasis: string           // '介護保険法(介護老人福祉施設)' 等
  residentProfile: string    // 入居者像(要介護度・目的)
  staffing: { role: string; ratio: string; lawRef: string }[] // 人員配置基準(#57 の源泉。数値+根拠)
  nightShift: { typical: string; note: string }               // 夜勤体制(#56)
  medicalCare: string        // 医療対応の範囲
  workStyle: { merits: string[]; demerits: string[] }         // 編集部整理(比較表 #58 の素材)
}
```

- **更新頻度/責任**: 制度改正イベント(B4)発生時にAIが差分案を作り人間が承認。平常時は年1回の棚卸し(32章 §5)。
- **出典**: 法令(e-Gov)・厚労省資料。`staffing` 等の規定値は lawRef 必須。
- **AI利用方法**: (a) 記事・pSEOの骨格データとしてプロンプトに注入(writer は施設の配置基準を自分で調べない=F-1)、(b) 比較表・診断マッピングのジョインキー、(c) ドリル作問のクリーンルーム素材(V2 26章 §1 の「使ってよい素材」の実体)。

### B. 制度・法令層(YMYL核心 — 人間承認必須)

```ts
/** B3 加算マスタ(処遇改善は本データセットの1系統) */
interface Kasan extends KbMeta {
  slug: string               // 'shoguu-kaizen' 等
  name: string               // '介護職員等処遇改善加算'(現行名称 — V2 K-06)
  formerNames?: string[]     // 旧称(2024年6月一本化前の3加算)
  rates: {                   // 率は「サービス種別×区分×年度」で履歴保持
    serviceType: string; grade: string; rate: number;
    validFrom: string; validUntil?: string; sourceId: string
  }[]
  requirementsSummary: string  // 算定要件の要旨(逐語コピー禁止 — R-11)
  workerNote: string           // 働き手への影響(配分は事業所裁量 — V2 K-06 の注意を型で保持)
}

/** B4 制度改正イベント(タイムライン成果物・更新カレンダーの源泉) */
interface SeidoEvent extends KbMeta {
  date: string               // 施行・公表日
  kind: 'housyu-kaitei' | 'hou-kaisei' | 'hojokin' | 'shiken-seido' | 'toukei-kohyo'
  title: string; summary: string
  affectedDatasets: string[]   // 'B3','C5' 等 — 更新すべきKB
  affectedUrlPatterns: string[] // '/kyuryo/**' 等 — 34章 §4 の影響逆引きと連動
}
```

- **更新頻度/責任**: イベント駆動(官報・厚労省通知を source-manager が監視 — 33章)。**率・要件の承認は人間必須**(誤りは R-13 相当)。
- **AI利用方法**: ツール#98(加算チェッカー)の計算源泉/記事・pSEOの「現行制度」保証(validUntil が開いているレコードのみ参照可)/タイムライン成果物/「(年度)改定で何が変わったか」記事の自動下書き。

### C. 統計層

- **C2 給与統計**: V1 06章 SalaryStat を拡張(`facilitySlug?` 軸を追加し 25章 #4/#9 に対応)。**調査ごとの定義差を混在させない**(V1 06章 §3 の注意を32章 §4 のCIで機械化)。更新: 年次(公表カレンダー駆動)。AI利用: pSEO本文の数値注入・図表生成・前年差の自動文章化(stat-page-batch — V2 24章)。
- **C3 労働統計**: 求人倍率は月次(機械取得しやすい)、離職率・従事者数は年次。null許容原則は全統計共通。
- **C5 税・社会保険料率**: 計算機(#96〜97)の源泉。**年度キー必須**・4月更新(E2 登録済みであること)。AI利用: 計算ロジックは TS 関数+単体テスト(V2 25章 T9)であり、AIは料率を文章に引用する際もこのデータのみ参照。

### D. コンテンツ知識層

```ts
/** D1 用語集(略語はここに統合) */
interface GlossaryTerm extends KbMeta {
  slug: string; term: string; yomi: string
  abbreviationOf?: string    // '特養'→'介護老人福祉施設' 等(略語レコードは本フィールドで正式名称へ参照)
  definition: string         // 120〜300字・自分の言葉・単体で意味が通る(RAG規約 §6)
  lawRefs?: string[]         // 定義の根拠(法令用語のみ)
  relatedTermSlugs: string[]; relatedEntity?: { dataset: string; id: string }
}

/** D2 FAQ */
interface FaqItem extends KbMeta {
  slug: string; question: string
  answer: string             // 200〜400字・自己完結・KB内ファクトのみで構成(F-1)
  clusterSlug?: string; entityRefs: { dataset: string; id: string }[]
  jsonLdEligible: boolean    // FAQPage 出力可否(ページ側の重複出力を防ぐ台帳)
  usedOnUrls?: string[]      // ビルド時に逆引き生成(34章 §4)
}
```

- **D1/D2 の更新頻度/責任**: 記事・ドリル制作の副産物として随時蓄積(AI起案→人間承認)。制度改定時は参照 lawRefs で影響検索。
- **AI利用方法**: 記事内の用語解説ボックス・ドリル解説・FAQブロックへの埋め込み(単独ページ化はしない — V2 21章の用語辞典C判定は不変)。**将来のRAG・質問応答で最も価値が出る層**。
- **D4 参考文献マスタ**: 統計以外の一次資料(厚労省通知・ガイドライン・白書)。記事 frontmatter の `sources` は将来 `referenceIds` 参照へ移行(35章 KB-2。二重管理の解消)。信頼度クラス(一次/準一次/参考)を持ち、eeat-reviewer の出典品質判定に使う。
- **D5 画像・図表**: **図表は画像ではなく「元データ(統計のクエリ)+生成仕様(チャート種別・軸)」で保持**し、SVGはビルド時生成 — 統計更新で図表が自動追随する(F-2)。写真・イラストは alt/出典/ライセンスのメタを必須化(ライセンス不明の素材は使用禁止)。
- **D6 独自一次データ**: V2 26章 §6-2(正答率)の一般化。診断集計・独自調査もすべて「月次エクスポート→JSONコミット→ビルド反映」の同型で扱う。

### E. 運用・関係層

```ts
/** E3 エンティティ関係グラフ(internal-link-map.ts を置換・拡張) */
interface EntityRelation {
  from: { dataset: string; id: string }
  to: { dataset: string; id: string }
  relation: 'requires' | 'leads-to' | 'works-at' | 'compares-with' | 'explains' | 'related'
  // 例: 初任者研修 -requires→ なし / 初任者 -leads-to→ 実務者 / 介護職員 -works-at→ 特養
  weight?: number            // 内部リンク優先度(34章 §3)
}
```

- **E3 の AI利用方法**: 内部リンク自動導出(34章 §3)・比較表のペア選定・診断結果→コンテンツのマッピング・「関連記事」の一貫性。手書きの対応表(V1 06章 internal-link-map)は本グラフからの導出に置換する。
- **E5 スクール・講座**: R-14(V2)の運用対象。規約確認チェック・`checkedAt`・年2回更新が公開条件(V2 25章 #27-28)。

## 4. 保持しないもの(境界の明示)

- **求人データ・事業所個別データ**(施設DB): V2 21章の見送り判断を継承。E5(スクール)以外の第三者事業者データは持たない。
- **過去問の本文**: `/kakomon/` 凍結(V2)。KBに保持するのは試験の事実データ(C4)と論点名(D3)のみ。**ドリル作問AIのプロンプトにKB外の過去問テキストを注入することはパイプラインが禁止**(V2 26章 §5 工程2 — KBはクリーンルームの「唯一の許可された素材庫」として機能する)。
- **ユーザー個人データ**: localStorage(端末内)と GA4 の匿名集計のみ。KBには集計値しか入れない。
- **法令の逐語条文**: 要旨+e-Gov への参照で持つ(全文複製はメンテ不能かつ不要)。

## 5. データ量の見積り(成熟時)

| 層 | レコード数(目安) |
| --- | --- |
| L1 エンティティ(A1〜A6) | 資格10+職種12+施設10+県47+属性30+監修者数名 ≈ **120** |
| L2 ファクト(B/C/D1/D2/D4) | 統計 5,000〜10,000(年次累積)+加算・制度 300+用語 500+FAQ 500+文献 300 ≈ **7,000〜12,000** |
| L2 試験・ドリル(D3) | 論点300+問題1,800〜3,000+回次・科目 ≈ **2,500〜3,500** |
| L3 関係・独自(E3/D6) | 関係 1,000+正答率 3,000+診断集計 ≈ **4,000〜5,000** |

- 合計 **1.5〜2万レコード** = TS/JSON+git で十分回る規模(1レコード平均0.5〜2KB → 全体でも数十MB未満)。SQLite 移行トリガー(V1 06章 §5)には遠く、**「実DBなし」方針はKB化後も成立する**。

## 6. RAG対応構造(将来用。**実装しない — 構造規約のみ**)

将来の AIチャット・サイト内検索・レコメンド・質問応答は、KBを以下の規約で作ってあれば**後付けできる**(作り直し不要):

1. **1レコード=1つの自己完結した知識単位**: 単体で読んで意味が通る(代名詞・文脈依存の表現を定義文に使わない)。長い知識は §単位に分割(用語=1語1レコード、FAQ=1問1レコード、加算=1加算1レコード+率は年度行)。**目安1レコード500トークン以内** — これがそのままRAGのチャンクになる。
2. **全レコードが安定ID+出典+時間軸を持つ**(KbMeta): 回答の出典明示(グラウンディング)・鮮度フィルタ(`validUntil` が閉じた制度を答えない)・引用リンク生成が構造だけで可能になる。
3. **純データであること**: KBファイルは関数・クラス・環境依存値を含まない(TS定数も JSON.stringify 可能な値のみ)。ビルド時に **`kb-export`(全KBを JSONL 1行1レコード+メタで書き出すスクリプト)** を将来追加すれば、そのままベクトルDB・埋め込みの入力になる。エクスポート形式だけ予約する:
   ```jsonc
   {"id":"glossary-tokuyo","dataset":"D1","text":"特養(介護老人福祉施設)とは…","meta":{"sourceIds":[],"checkedAt":"2026-07-05","url":"/glossary/#tokuyo"}}
   ```
4. **エンティティ参照はIDで**(E3 グラフ): 将来のレコメンド(「この資格を見た人向けの論点・記事」)はグラフ探索で実装できる。
- **やらないこと(明記)**: ベクトルDB・埋め込み生成・チャットUI・検索API はすべて実装しない。KB-4(35章)の再評価事項。

---

- 前: [30. Knowledge Base 戦略](./30-knowledge-base-strategy.md)
- 次: [32. データガバナンス](./32-data-governance.md)
