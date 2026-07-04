# 06. データモデル設計

> 方針: **実DBは持たない**。projects/ 標準(TS定数/JSON + SSG)を踏襲し、リポジトリ内のデータファイルを唯一の真実とする。規模拡大時の移行パスは §5。

## 1. 全体像

```
data/
  kakomon/
    exams.ts                 # 試験マスタ(介護福祉士・ケアマネ)
    exam-rounds.ts           # 回次マスタ(実施日・合格点・合格率・受験者数 — 「合格点推移」等のハブコンテンツの源泉)
    subjects.ts              # 科目マスタ(URLスラッグ・表示名・パート区分・出題範囲)
    kaigofukushishi/
      exam-38.json           # 1回分の全問題(問題・選択肢・正答・解説・監修情報)
      exam-37.json ...
    caremane/
      exam-27.json ...
    drills/                  # オリジナル一問一答(プランB・非公開試験用。URL: /kakomon/<exam>/drill/<topic>/)
  kyuryo/
    salary-prefecture.json   # 都道府県別統計(出典・調査年つき)
    salary-job.json          # 職種・資格別統計
    sources.ts               # 統計出典マスタ(調査名・公表URL・確認日・次回公表予定)
  authors.ts                 # 執筆者・監修者マスタ
  affiliate-links.ts         # /go/<slug> マスタ(既存 aff-v1 の server/utils を踏襲)
  internal-link-map.ts       # 科目→関連記事などの文脈リンク対応表
content/                     # Nuxt Content(記事 Markdown + frontmatter)
  shikaku/ tenshoku/ shisetsu/ shokushu/ kyuryo/   # kyuryo/ 配下の記事URLは /kyuryo/guide/<slug>/(03章の予約語規則)
```

## 2. スキーマ定義(TypeScript)

### 2-1. 過去問

```ts
/** 試験マスタ */
interface Exam {
  slug: 'kaigofukushishi' | 'caremane';
  name: string;                    // 「介護福祉士国家試験」
  questionCount: number;           // 125 / 60
  administeredBy: string;          // 「公益財団法人社会福祉振興・試験センター」等(出典表記に使用)
  copyrightStatus: 'confirmed' | 'pending' | 'denied';  // R-01 の確認状態を型で持つ
}

/** 回次マスタ(試験ハブの「合格点・合格率推移」、解答速報・合格点予想記事の源泉) */
interface ExamRound {
  examSlug: Exam['slug'];
  round: number;                   // 第N回
  heldOn: string;                  // '2026-01-25'(実施日)
  passingScore: number | null;     // 合格基準点(発表前は null)
  passRate: number | null;         // 合格率(%)
  applicants: number | null;       // 受験者数
  partSystem: boolean;             // 第38回以降の介護福祉士は true(A/B/Cパート合格制度)
  sourceUrl: string;
  checkedAt: string;               // 確認日
}

/** 科目マスタ(URL /kakomon/<exam>/s/<slug>/ と1:1) */
interface Subject {
  examSlug: Exam['slug'];
  slug: string;                    // 'ningen-no-songen' 等ヘボン式
  name: string;                    // 「人間の尊厳と自立」
  part?: 'A' | 'B' | 'C';          // パート区分(介護福祉士・第38回以降の絞り込み軸)
  order: number;
}

/** 1問(exam-NN.json / drills/*.json の要素) */
interface KakomonQuestion {
  origin: 'kakomon' | 'original';  // original = オリジナル一問一答(プランB・非公開試験用)
  examSlug: Exam['slug'];
  round?: number;                  // 第N回(origin: 'kakomon' のみ。実施日等は ExamRound を参照)
  number?: number;                 // 問1〜125(origin: 'kakomon' のみ)
  topicSlug?: string;              // origin: 'original' のみ(/drill/<topic>/ と対応)
  subjectSlug: string;
  stem: string;                    // 問題文(過去問は原文。改変禁止)
  choices: string[];               // 選択肢1〜5
  correctIndex: number;            // 0-4。過去問は公式正答表と人手突合済みであること
  explanation: {
    why: string;                   // 正解の根拠(300字以上 — 04章 F1 の定量下限)
    whyNotOthers: string[];        // 誤答理由(選択肢順・各1文以上)
    tips?: string;                 // 覚え方
    lawUpdateNote?: string;        // 制度改定注記(「現行制度では〜」)
  };
  supervisorId?: string;           // 監修者(authors.ts 参照)
  reviewedAt?: string;             // 監修完了日
  status: 'draft' | 'fact-checked' | 'reviewed' | 'published' | 'excluded';
  // excluded = 第三者著作物を含む等で非掲載(欠番)。URLを発行せず、一覧に「非掲載(権利処理)」表示(03章)
}
```

### 2-2. 給料統計

```ts
/** 統計出典マスタ */
interface StatSource {
  id: string;                      // 'shogu-r6'
  surveyName: string;              // 「令和6年度介護従事者処遇状況等調査」
  publisher: string;               // 「厚生労働省」
  url: string;                     // 公表ページURL
  surveyPoint: string;             // 「令和6年9月時点」
  checkedAt: string;               // 確認日 '2026-07-04'
  nextExpectedRelease?: string;    // 次回公表見込み(更新カレンダー用)
  definitionNote: string;          // 「平均給与額=基本給+手当+一時金(4〜9月支給額の1/6)。処遇改善加算取得事業所」等
}

/** 都道府県別・職種別の統計値(surveyYear を含む複合キーで履歴を保持 — 年次更新で上書きしない) */
interface SalaryStat {
  prefSlug?: string;               // 'hokkaido' 等(都道府県軸。将来の pref×job 直交にも対応)
  jobSlug?: string;                // 'kaigofukushishi' 等(職種・資格軸)。どちらか一方のみなら単軸ページ
  displayName: string;
  surveyYear: number;              // 調査年度(2024 等)。前年比較・推移グラフ・差分レポートの前提
  monthlyAvg: number | null;       // 平均給与額(円)。出典に値がない場合は null(捏造禁止)
  breakdown?: { base?: number; bonusMonthly?: number };
  sourceId: string;                // StatSource 参照
  notes?: string;
}
// 一意キー: (prefSlug, jobSlug, surveyYear, sourceId)。過去年度のレコードは削除せず保持し、
// T5 テンプレートの推移グラフとツール#5 の「前年値との差分レポート」の源泉にする。
```

- **null 許容が重要**: 出典統計に存在しない粒度の数値を推計で埋めない(ファクトチェッカー要件)。null の場合ページ側は「全国値+当該県の関連情報」で構成する。

### 2-3. 執筆者・監修者

```ts
interface Author {
  id: string;
  slug: string;                    // /supervisor/<slug>/
  name: string;
  role: 'editor' | 'supervisor';
  credentials: string[];           // ['介護福祉士', '介護支援専門員']
  experienceYears?: number;
  bio: string;
  sameAs?: string[];               // SNS・外部実績URL(Person schema に出力)
  avatar?: string;
}
```

### 2-4. 記事 frontmatter(Nuxt Content)

```yaml
title: ""
description: ""
cluster: tenshoku          # C2〜C6 のディレクトリと一致
targetQueries: ["介護職 辞めたい", "介護 辞めたい 甘え"]   # カニバリ検知に使用
authorId: ""
supervisorId: ""           # 監修必須クラスタで空なら公開時にCIで弾く
publishedAt: 2026-09-01
updatedAt: 2026-09-01
sources:                   # 出典(本文引用と二重管理にしない。CIで本文リンクと突合)
  - { name: "令和6年度介護従事者処遇状況等調査", url: "https://...", checkedAt: 2026-07-04 }
prRelated: true            # true なら PR 表記を自動挿入
```

## 3. 統計データの取得元(一次情報)

| データ | 出典 | 粒度 | 更新周期 | 確認日 |
| --- | --- | --- | --- | --- |
| 平均給与額(全国・施設種別・資格別) | [令和6年度介護従事者処遇状況等調査(厚労省)](https://www.mhlw.go.jp/toukei/saikin/hw/kaigo/jyujisya/24/dl/r06kekka.pdf) | 全国・施設種別・資格別(都道府県別なし) | 年1回(例年3〜4月頃公表) | 2026-07-04 |
| 都道府県別の賃金 | 賃金構造基本統計調査([e-Stat](https://www.e-stat.go.jp/)。職種「介護職員(医療・福祉施設等)」×都道府県) | 都道府県×職種 | 年1回 | 2026-07-04(該当表の所在確認は Phase 2 開始時に実施 →【仮説 H-22】) |
| 労働環境・離職率 | 介護労働実態調査([介護労働安定センター](https://www.kaigo-center.or.jp/)) | 全国・一部地域 | 年1回 | 2026-07-04 |
| 有効求人倍率 | 一般職業紹介状況(厚労省・職業安定業務統計) | 全国・都道府県 | 月次 | 2026-07-04 |

**設計上の注意(ファクトチェッカー指摘の反映)**: 「都道府県別×介護職の平均給与」は処遇状況等調査には存在しない。都道府県ページの主データは賃金構造基本統計調査由来とし、調査ごとの定義差(きまって支給する現金給与額 vs 平均給与額)をページ脚注で必ず区別する。2つの調査の数値を同一表に並べない。

## 4. 運用データ(コンテンツ管理)

- **キーワード管理表**(`data/keyword-map.csv` またはスプレッドシート): クエリ / 担当クラスタ / 対象URL / 順位 / 状態。カニバリ検知と制作計画の唯一の台帳。
- **更新カレンダー**(`data/update-calendar.ts`): 統計公表予定・試験日程・制度改定日と、影響を受けるURLパターンの対応表。月次レビューで消化(自動リマインドは [10章](./10-implementation-order-and-tools.md) ツール #7)。

## 5. 規模拡大時の移行パス(いま作らない)

| トリガー | 移行 |
| --- | --- |
| ページ数1万超 or ビルド10分超 | データを SQLite(Turso/D1)へ移し、ISR 併用に切替。スキーマは §2 をそのまま DDL 化できる形で設計済み |
| 編集者が2人以上に増加 | 記事を Git 直編集から microCMS 等ヘッドレスCMSへ。frontmatter 互換のフィールド設計を維持 |
| 求人データ提携が成立(現時点で計画なし) | 別サブディレクトリ `/kyujin/` として増築。本設計のURLには影響させない |

---

- 前: [05. テクニカルSEO](./05-technical-seo.md)
- 次: [07. コンバージョン設計](./07-conversion-design.md)
