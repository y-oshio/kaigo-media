# AI編集部 パイプライン処理時間ログ

このログは各工程を実際に Agent tool でサブエージェント起動した際の壁時計処理時間(`duration_ms`、Agent tool の実測値)を記録する運用ログ。設計書ではない — 実運転のたびに追記していく。

## 記事2: kaigo-bonus(2026-07-08実行)

| # | 工程 | モデル | 所要時間 | 備考 |
| --- | --- | --- | --- | --- |
| 1 | content-architect | 既定(sonnet継承) | 117.4s(≒2.0分) | article-plan生成 |
| 2 | writer | haiku | 67.9s(≒1.1分) | 初稿執筆(49章§5「軽量モデル可」） |
| 3 | fact-checker | 既定 | 379.6s(≒6.3分) | 実WebFetchでe-Stat再確認込み |
| 4 | eeat-reviewer(1回目) | 既定 | 241.3s(≒4.0分) | verdict: fix-required(出典脚注欠落) |
| 5 | writer(差し戻し修正) | haiku | 47.6s(≒0.8分) | ロールトリップ1回目 |
| 6 | eeat-reviewer(再審査) | 既定 | 62.4s(≒1.0分) | verdict: pass |
| 7 | internal-linker | 既定 | 259.0s(≒4.3分) | |
| 8 | schema-generator(QA) | 既定 | 96.0s(≒1.6分) | ファイル生成なし(前回修正の実地検証) |
| 9 | publish-manager | 既定 | 361.9s(≒6.0分) | status: awaiting-supervisor |
| | **合計(AIエージェント実処理時間)** | | **1633.2s ≒ 27.2分** | 9呼び出し(うちwriter往復1回含む) |

## 記事3: homonkaigo-shisetsu-hikaku(2026-07-08実行)

| # | 工程 | モデル | 所要時間 | 備考 |
| --- | --- | --- | --- | --- |
| 1 | content-architect | 既定 | 298.5s(≒5.0分) | plan.clusterのファネル階層コード衝突対策の注記を追加指示(ISSUE-005対応) |
| 2 | writer | haiku | 111.1s(≒1.9分) | |
| 3 | fact-checker | 既定 | 529.8s(≒8.8分) | 実WebFetch+算術検証で年収計算誤り1件を検出・修正(ISSUE-007) |
| 4 | eeat-reviewer | 既定 | 207.2s(≒3.5分) | verdict: pass(ロールトリップなし) |
| 5 | internal-linker | 既定 | 302.2s(≒5.0分) | |
| 6 | schema-generator(QA) | 既定 | 85.1s(≒1.4分) | ファイル生成なし |
| 7 | publish-manager | 既定 | 408.2s(≒6.8分) | status: awaiting-supervisor |
| | **合計(AIエージェント実処理時間)** | | **1942.1s ≒ 32.4分** | 7呼び出し(ロールトリップなし) |

## 2記事合計

- AIエージェント実処理時間合計: 3575.3s ≒ **59.6分**(16回のAgent tool呼び出し。うち1回はeeat差し戻しによるwriterロールトリップ)
- 記事1本あたり平均: 約30分(ロールトリップの有無で±5分程度の変動)

## 人間(Lead Editor)レビュー時間について(計測できなかった点の開示)

Agent tool の呼び出しは `duration_ms` で正確に壁時計時間が取得できるが、**Lead Editor役である私自身がドラフトを読む・機械チェックを実行する・manifestの妥当性を確認するといった作業には、同等の壁時計計測手段が今回の環境になかった**(Bash等の個別呼び出しには時刻を挟めるが、テキストを読んで判断する行為自体には計測手段がない)。これは「今回計測できなかった」という誠実な開示であり、正確な数値を示すよりも重要だと判断した。

定量化はできなかったが、実際に行った人間レビュー作業の**内容**は以下の通り(質的な記録):
- 記事2のdraft.md初稿で `cluster: c3` という誤ったfrontmatter値を発見・修正(ISSUE-005)
- 記事3のdraft.md初稿で `::affiliate-link{...}` という誤ったCTAコンポーネントと、構文の壊れた【要出典】マーカーを発見・修正(ISSUE-006)
- 各記事のfinal/ファイルに対して `check-frontmatter.mjs` を実行し、manifestの判定根拠(fail項目・awaiting-supervisorの理由)が実際の状態と一致しているかを確認
- fact-checkerが検出した算術エラー(ISSUE-007)の修正結果が最終ファイルに正しく反映されているかを確認

この「計測できなかった」こと自体を ISSUE-009 として記録した(下記 issues-log.md 参照)。
