# 記事構成テンプレート(F3規格 — 設計書04章 §2)

content-architect が headings を設計し、writer がこの骨格で執筆する。

```markdown
---
(article-frontmatter.yaml の全項目)
---

<!-- prRelated: true の場合、ここにPR表記ブロックが入る(実装側で自動挿入。本文には書かない) -->

(リード: 3行。①結論 ②根拠の予告 ③この記事で分かること。結論の出し惜しみ禁止)

<!-- 目次は実装側で自動生成 -->

## H2-1(検索意図への最重要アンサー。primaryQuery の語彙を含める)

(結論→理由→具体例の順。数値・制度は全て【要出典: 主張】マーカー付き)

::affiliate-link{slug=... cluster=... position=after-lead}   ← plan の ctaPlacements にある場合のみ

## H2-2〜H2-6(plan の purpose 順。1つのH2は1つの疑問に答える)

<!-- EXPERIENCE-SLOT -->   ← uniqueValue.type=experience の場合。架空体験談の創作禁止。人間が挿入

## よくある質問

(FAQ 2〜4問。1答は3〜5文。数値が要る答えは【要出典】)

## まとめ(結論の再掲+次の行動1つ)

::affiliate-link{... position=footer}  または  ::diagnosis-cta / ::line-cta

<!-- 監修者・執筆者ボックス、出典一覧は実装側でfrontmatterから自動描画 -->
```

## 書式ルール(writer 必読)

- 1文80字以内目安。3〜4文で改段落。スマホ幅で圧迫感のない密度
- 表は「比較・条件分岐」にのみ使う(文章の置き換えに使わない)
- 太字は1セクション2箇所まで。乱用しない
- 読者呼称は「あなた」。介護職を見下すニュアンス(「たかが」「〜すべき」の連発)禁止
- 制度名・資格名は初出でフルネーム+略称(例: 介護職員初任者研修(初任者研修))
