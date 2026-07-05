# 48章 P5 品質CI 詳細設計

- 作成日: 2026-07-05 / 作成: Claude Fable 5
- 目的: ①verified データと公開ゲートを機械的に守る回帰網 ②記事量産と軽量モデル移行を
  安全にする最終ゲート。P5 完了が**記事量産解禁の前提条件**(44章 M1 #11)
- 前提: GitHub 私有リポジトリ作成済み(41章 §5・ユーザー作業)。Content v3 移行(47章)後に実施
- 設計原理: 41章 §4 の 3層モデル — **L1=utils がランタイム真実 / L2=lint は L1 を実 import /
  L3=CI が束ねる**。規則の二重実装とTSソースの正規表現パースを全廃する

## §1 `npm run check` の構成

```jsonc
// package.json scripts(追加・変更)
{
  "check":      "npm run kb-lint && npm run content-lint && npm run test:gates && npm run verify:kyuryo && npm run typecheck",
  "test:gates": "node --test scripts/test/",
  "check:ci":   "npm run check && npm run build"
}
```

- 実行順は**速い順**(kb-lint 数秒 → … → typecheck 数十秒)。最初の失敗で止まる(`&&`)
- `check` はローカルの日常用(build なし・1分以内目標)。`check:ci` は CI と同一の完全版
- 既存スクリプト名は変更しない(memory・過去ドキュメントからの参照を壊さない)

## §2 責務分離(どの検査がどこにあるか — 唯一の対応表)

| 検査 | 実装場所 | 層 | 内容 |
| --- | --- | --- | --- |
| 公開可否の判定規則 | `utils/article.ts` publishBlockers | **L1** | 規則の唯一の実装(変更は高性能モデル+人間 — 42章 §6-1) |
| pref頁 index可否・null率ゲート | `utils/kyuryo.ts`(41章 §3 で一元化後は prefPagesIndexable) | **L1** | 同上 |
| 記事の静的検査 | `scripts/content-lint.mjs` | L2 | **jiti で publishBlockers を実 import して呼ぶ**(現在の規則複製を削除)+lint固有検査: 配置/スラッグ/予約語/日付形式/banned phrases(§6)//go/整合(§7) |
| KBレコード検査 | `scripts/kb-lint.mjs` | L2 | エンベロープ+C2固有規則。**マスタ参照(prefectures/jobs/sources)を正規表現抽出から jiti 実 import に変更**(false negative の根絶) |
| 原本照合 | `scripts/verify-kyuryo-c2.mjs` | L2 | 現行のまま(raw XLSX sha256+全値再導出突合) |
| ゲート回帰テスト | `scripts/test/*.test.mjs`(新規) | L2 | §4 |
| 型整合 | `nuxt typecheck` | L2 | v3 移行後は collection schema 由来の型も検査対象になる |
| 束ね+強制 | GitHub Actions | L3 | §3 |

L2 スクリプトから TS(utils/・data/)を読む手段は **jiti に統一**(devDependencies に追加)。
「TS を import できないため複製」「正規表現で抽出」のコメントが付いた箇所が置換対象の全リスト:
content-lint.mjs の CLUSTERS/RESERVED_SLUGS 複製と frontmatter 規則、kb-lint.mjs の
extractField/extractPrefSlugs。

## §3 GitHub Actions 設計

```yaml
# .github/workflows/ci.yml
name: ci
on:
  push: { branches: [main] }
  pull_request:
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run check
      - run: npm run build
```

- Python(extract スクリプト)は CI では実行しない — 原本照合は verify:kyuryo(Node)が担う
- 運用規約: **CI が赤の状態で公開・マージしない**(42章 §6-2)。main 直 push は check 通過後のみ
- 秘密情報は不要(GA ID 等は build に不要な設計になっている)。Actions に secrets を置かない

## §4 verified データを守る回帰テスト(`scripts/test/` 新規・node:test + jiti)

verify:kyuryo が「原本→JSON の再導出一致」を守るのに対し、テストは**「JSON→サイト表示の間の
ロジック」**を守る(現在テスト0の空白地帯)。

1. **アンカー値カナリア** — 全国 kaigoshoku の monthlyAvg=277,700 / annualBonus=547,800 を
   固定値で assert。データファイルの事故編集(手編集・マージ事故)を verify より手前で最速検出。
   年次更新時はこのテストの更新自体が「意図した変更」の宣言になる
2. **publishBlockers 全分岐** — title/description/publishedAt/sources 欠落・checkedAt 欠落・
   正常系の各ケースで blockers 配列を assert
3. **passesNullRateGate 境界** — primaryFields の null 数がちょうど閾値・閾値±1 のケース
4. **prefPagesIndexable 境界**(41章 §3 一元化後)— ガイド2本→false / 3本→true
5. **estimatedAnnual の null 伝播** — monthlyAvg か annualBonus が null なら null(推計禁止の回帰)
6. **formatManYen / formatApproxManYen** — 277700→「27万7,700円」等の表示規約(丸め誇張の回帰)
7. **status フィルタ** — draft レコードが stats に混入しないこと(96件 verified 前提の件数 assert)

## §5 publish gate の CI 上の扱い

- content-lint が publishBlockers を実 import することで、「lint OK なのにサイトで404」
  「lint NG なのに公開」が構造的に起きなくなる(規則は L1 の1箇所だけ)
- lint は**全記事**を検査する(公開済みだけでなく draft 相当も)。「なぜ公開されないか」を
  ビルド前に人間へ知らせる現行の役割は維持
- 昇格(kb-promote)は CI に含めない — 人間専用操作(不変)

## §6 banned phrases(新規 — content-lint に本文検査を追加)

規則リストは `config/banned-phrases.ts`(L1 扱い・変更は人間承認)に置き、content-lint が
jiti で import して本文(frontmatter 除く)へ適用する。

```ts
export interface BannedPhrase {
  pattern: string      // 正規表現(u フラグ)
  reason: string       // なぜ禁止か(lint メッセージに表示)
  severity: 'error' | 'warn'
}
```

初期リスト(カテゴリと代表例 — 実装時にこの表をそのまま移植):

| カテゴリ | パターン例 | 深刻度 | 理由 |
| --- | --- | --- | --- |
| 根拠なき最上級 | `日本一|業界No\.?1|業界最高水準` | error | 優良誤認(景表法)。KBに順位の根拠がある場合のみ人間判断で個別解除 |
| 断定的保証 | `必ず(儲か|稼げ|受か|上が)|絶対に(得|損し ない)` | error | YMYL断定禁止 |
| 医療・法律断定 | `治ります|完治し|訴え れば勝て` | error | 無資格断定 |
| 誇張スラング | `爆上げ|神(求人|資格)|ヤバい` | warn | トーン&マナー(04章) |
| 統計の歪曲 | `平均(なので|だから)あなたも` | error | 平均値の個人適用(06章 §3 の読み方規約) |
| 転載示唆 | `過去問(より|から)引用` | error | 凍結領域ガード |

- 例外運用: パターンの緩和・削除は人間承認+コミットメッセージに理由(エスケープコメント
  機構は作らない — 抜け道は作った瞬間に常用される)
- 誤検知が出た場合: 記事側の表現を変えるのが原則。リスト側を直すのは複数記事で再発した場合のみ

## §7 /go/ リンクと prRelated の検査(現行を拡張)

現行(本文に /go/ → prRelated:true 必須)に加えて:

1. **実在検査**: 本文中の `/go/<slug>/` の slug が `data/affiliate-links.ts`(jiti import)に
   登録済みであること — 存在しない slug は 404 リンクを公開することになるため error
2. **active 検査**: 登録済みだが `active: false` の slug は warn(公開時 302 されないリンク)
3. **逆方向**: `prRelated: true` なのに本文に /go/ が1つもない記事は warn(PR表記の空振り —
  診断CTA等の内部誘導だけなら prRelated 不要)
4. rel="sponsored nofollow" は ProseA/CtaSlot の機械付与(実装済み)なので lint 対象外。
   ただし**本文に生の `<a href="/go/...">` を書くことを error にする**(ProseA を迂回するため)

## §8 sitemap / noindex ゲート整合チェック

41章 §3 の一元化(prefPagesIndexable への統合)が実装済みであることを前提に、**逆流を防ぐ**:

1. **構造検査(scripts/test/ 内)**: `pages/kyuryo/pref/[pref].vue` と
   `server/api/__sitemap__/urls.ts` の両ファイルが文字列 `prefPagesIndexable` を含むことを
   assert(共有関数の迂回=独自判定の復活をコミット時点で検出する canary)
2. **単体テスト**: §4-4(境界値)
3. **実機スモーク(CI では任意・リリース前チェックリストに必須)**: `npm run build` 後に
   preview を起動し、`/sitemap.xml` の URL 集合と、その各 URL の `<meta name="robots">` を突合。
   「sitemap 掲載かつ noindex」が 0 件であること。実装は `scripts/smoke-sitemap.mjs` として
   Phase 2(記事が増えて手動確認が現実的でなくなった時点)で追加
4. 公開後は 43章 A10(Index Coverage Monitor)が GSC 実態との突合を引き継ぐ

## §9 失敗時の対応フロー

| 失敗ステップ | 意味 | 一次対応(軽量モデル可) | エスカレーション |
| --- | --- | --- | --- |
| kb-lint | KBレコードの規約違反 | 該当レコード修正(draft のみ。verified の修正は人間承認) | ID規則・スキーマ起因なら高性能+人間 |
| content-lint | 記事の規約違反 | 記事側を修正(リスト・規則側は触らない) | banned phrase 誤検知の再発時のみリスト改訂を人間へ提案 |
| test:gates | **ロジック回帰 or データ事故** | 直前コミットとの diff を特定し報告して**停止** | アンカー値カナリア失敗は常に人間+高性能(データ完全性インシデント — 42章) |
| verify:kyuryo | 原本とJSONの不一致 | **即停止・修正禁止**。git log で JSON への直接変更を特定し報告 | 常に人間判断(最悪ケース=統計値の改変) |
| typecheck / build | コード不整合 | 通常のビルド修正 | 30分で解けなければ報告 |

共通原則: **赤を緑にするために検査を弱めることを禁止**(テスト削除・skip・閾値緩和・
lint 除外)。検査側の変更は常に「人間承認+理由をコミットメッセージに記載」。

## §10 実装順(1PR = 1段階)

1. `npm run check` 追加+ `.github/workflows/ci.yml`(既存スクリプトのまま束ねるだけ — 最小CI、41章 §5)
2. jiti 導入: content-lint の publishBlockers 実 import 化+複製削除
3. jiti 導入: kb-lint のマスタ実 import 化(正規表現抽出の削除)
4. `scripts/test/` 新設(§4 の 7 テスト+§8-1 構造検査)+ `test:gates` を check に組み込み
5. banned phrases(§6)+ /go/ 拡張検査(§7)
6. (Phase 2)smoke-sitemap.mjs

各段階の完了条件: `npm run check:ci` 全通過+変更前後で検査の**検出力が下がっていない**こと
(段階2・3では、意図的に壊した fixture で NG が出ることを確認してから複製コードを消す)。

## §11 軽量モデルへの依頼プロンプト(段階ごとに使う)

```
docs/kaigo-media-plan/v4/48-p5-quality-ci.md の §10 の段階 <N> を実装してください。

制約:
- utils/article.ts・utils/kyuryo.ts(L1)の規則ロジックは変更禁止。lint 側から import する方向のみ
- 検査を弱める変更(テスト削除・skip・パターン緩和・除外追加)は禁止。必要と考えた場合は
  実装せず理由を提示して停止すること
- 段階2・3では、複製コードを削除する前に「わざと違反させた一時 fixture で新実装が NG を出す」
  ことを確認し、その結果を報告に含めること(fixture はコミットしない)
- 完了条件は npm run check:ci 全通過。結果を数値で報告すること
- §9 の表にない失敗が出たら推測で直さず停止して報告すること
まず実施計画を提示し、承認を得てから着手してください。
```
