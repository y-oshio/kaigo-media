# 45章 レビューログ(v4作成時の検証記録)

- 実施日: 2026-07-05 / レビュアー: Claude Fable 5 / 基準コミット: ec576f1(作業ツリークリーン)

## §1 レビュー範囲と方法

- 全16 pages・utils・server/api・nuxt.config・scripts 6本・data/kb・ai-company 43ファイル・
  docs(V1/V2/V3)を実読またはgrep検証
- 負債仮説は全て**コード実物で確認してから**採用(推測のみの指摘は排除)

## §2 確認された事実(41章の根拠)

| 事実 | 確認方法 |
| --- | --- |
| routeRules/prerender/ISR 設定が一切ない | nuxt.config.ts 実読 |
| @nuxt/content ^2.13.4(v2系)| package.json 実読 |
| pref頁 indexable と sitemap urls.ts のゲート二重実装(コメント同期) | 両ファイル実読 |
| publishBlockers ⇔ content-lint の規則二重実装(コメント同期) | utils/article.ts 実読 |
| kb-lint が TSソースを正規表現でパース | scripts/kb-lint.mjs 確認 |
| utils/kyuryo.ts が C2 JSON をトップレベルimport(クライアントバンドル同梱) | 実読 |
| og:image / ogImage の設定が0件(twitter:card=summary_large_image は宣言済み) | 全体grep 0件 |
| テスト0・CI 0・**git remote なし** | `git remote -v` 空 |
| raw XLSX 4ファイル計約1MB | ls 実測 |
| 記事0本(content/ は README+.gitkeep のみ)・案件0件 | ディレクトリ実査 |
| ai-company は9 Agent(V3の13 Agent体制に未改修)・パイプライン実行実績0 | agents/ 実査 |
| templates/kakomon-explanation.md が凍結領域前提のまま残存 | templates/ 実査 |

## §3 誤指摘の訂正(記録)

- **「JSON-LD未実装」は誤り**: pages/kyuryo/pref/[pref].vue・pages/supervisor/[slug].vue・
  components/AppBreadcrumb.vue・components/article/ArticleView.vue に実装済みをgrepで確認。
  負債リストから除外した(将来のレビューで再指摘しないこと)

## §4 v4 での意思決定一覧(詳細は41章)

1. ISR採用(フルprerender不採用) 2. Content v3へ移行(記事0本の今) 3. ゲート判定一元化
4. lint 3層モデル+jiti化 5. GitHub私有リポジトリ+Actions最小CI 6. C2バンドル問題はP9前提条件
として先送り(トリップワイヤ: JSON合計200KB超 or 2年度目) 7. raw XLSXはgit直置き継続
(閾値: 単一20MB/合計100MB)

## §5 未決事項(ユーザー判断待ち)

- 週投下時間 / ブランドカラー(仮置き緑) / 旧サイトのURL資産の棚卸し(301マップ)
- GitHub アカウント・リポジトリ名 / GSC・GA4 アカウント
- 記事量産の解禁タイミング(M2完了後にユーザーが明示宣言)

## §6 v4 残タスク(Fable5 最終作業 — 40章 §4)

47章 v3移行手順書 / 48章 P5品質CI詳細設計 / 49章 給料ガイド3本の記事設計 /
(できれば)50章 P8・T-0c再評価 / 51章 KB-2スキーマ設計
