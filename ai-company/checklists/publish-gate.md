# 公開前最終チェックリスト(publish-gate)

publish-manager が全項目を検収する。**1項目でも fail = blocked**。skipped は理由必須+ready判定不可。
項目IDは publish-manifest の checklist キーとして使う。

## A. 成果物の完全性
- [ ] `A1` 全工程の成果物が存在する(plan / draft.checked / factcheck report / eeat report / links / jsonld)
- [ ] `A2` 各成果物がスキーマ検証を通る(`scripts/validate-handoff.mjs`)
- [ ] `A3` 本文に【要出典】マーカーが残っていない
- [ ] `A4` 本文に `<!-- EXPERIENCE-SLOT -->` が残っている場合、humanActions に「体験談挿入」が入っている

## B. 事実・出典
- [ ] `B1` factcheck summary の blockers が空
- [ ] `B2` frontmatter sources[] の全件に name / url / checkedAt が揃っている
- [ ] `B3` 統計引用が templates/stat-footnote.md の定型(定義+調査名+年+確認日)に従っている
- [ ] `B4` 異なる調査の数値が同一表で比較されていない

## C. E-E-A-T・法令
- [ ] `C1` eeat verdict が pass
- [ ] `C2` prRelated: true ⇔ 本文にアフィリンクあり、が一致し、PR表記が入る状態
- [ ] `C3` 監修必須記事は supervisorId が確定済み(未完了なら status=awaiting-supervisor)
- [ ] `C4` 禁止表現ゼロ(`scripts/check-banned-phrases.mjs`)
- [ ] `C5` authorId が実在の執筆者マスタと一致

## D. SEO・技術
- [ ] `D1` slug がURL規則(小文字ローマ字・予約語回避)に適合し、既存と重複しない
- [ ] `D2` title/description が文字数規定内で primaryQuery を含む
- [ ] `D3` inbound リンク1本以上(orphanRisk: false)
- [ ] `D4` outbound リンク先が全て実在(同バッチ依存は publishOrder で解決済み)
- [ ] `D5` JSON-LD validation が全て true・warnings 解消済み
- [ ] `D6` アフィリンクが全て /go/ 経由+コンポーネント記法(生URL直貼りなし)
- [ ] `D7` frontmatter 必須項目が完全(`scripts/check-frontmatter.mjs`)

## E. 人間ゲート(AIは代行禁止)
- [ ] `E1` 【人間】公開承認(draft: false への変更)
- [ ] `E2` 【人間】監修依頼の送付・反映確認(該当記事のみ)
- [ ] `E3` 【人間】体験談の真正性確認・挿入(該当記事のみ)
