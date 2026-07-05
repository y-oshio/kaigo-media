# content/ — 記事コンテンツ配置ルール

記事 Markdown(Nuxt Content v2)の置き場。Nuxt Content は実装#4(P3)で導入済み。
※この README 自体も Nuxt Content に取り込まれるが、記事ページ・一覧・sitemap は
クラスタ配下の記事しか対象にしないため公開はされない(content-lint も対象外)。

## ディレクトリ = クラスタ = URL

| ディレクトリ | クラスタ | URL |
| --- | --- | --- |
| `shikaku/` | C2: 資格・研修 | `/shikaku/<slug>/` |
| `tenshoku/` | C4: 悩み・退職・転職 | `/tenshoku/<slug>/` |
| `shisetsu/` | C5: 施設種別 | `/shisetsu/<slug>/` |
| `shokushu/` | C6: 職種図鑑 | `/shokushu/<slug>/` |
| `kyuryo/` | C3: 給料系解説記事 | `/kyuryo/guide/<slug>/`(**guide 配下に出る**。`kyuryo/` に `guide/` ディレクトリは作らない。pref/job はデータ駆動ページの予約語) |

クラスタ直下にサブディレクトリは作らない(1階層のみ — 03章 §2)。

## ルール(設計書03章・06章+P3承認条件)

1. **スラッグ**: 全て小文字ローマ字(ヘボン式)`[a-z0-9-]+`。予約語(`config/routes.ts` の `RESERVED_SLUGS`)は使用禁止。一度公開したURLは変更しない。
2. **frontmatter**: `types/article.ts` の `ArticleFrontmatter` に従う(title / description / cluster / targetQueries / authorId / supervisorId / reviewedAt / publishedAt / updatedAt / sources / prRelated)。
3. **公開ゲート**: `sources` が1件以上・全件に `checkedAt`(確認日)がない記事は**公開されない**(ページ側で404 — `utils/article.ts`)。`npm run content-lint` で理由を確認できる。
4. **PR表記**: アフィリエイト・広告リンクを含む記事は `prRelated: true` にする。本文冒頭にPR表記が自動表示される(07章)。
5. **執筆・監修**: `authorId` / `supervisorId` は `data/authors.ts` の実在登録の id のみ。未設定・未登録の間は「準備中」表示になる。**架空の人物を作らない**(04章)。監修必須クラスタの機械チェックは品質CI(実装#6=P5)。
6. **サンプル・仮記事の禁止**: 架空の統計値・仮の記事をコミットしない。検証用の一時記事はコミット前に必ず削除する。
7. **孤立ページ禁止**: 記事公開時に既存記事から必ず1本以上のリンクを受ける(03章 §3)。
8. **記事の量産**: `ai-company/` パイプラインが本ディレクトリへ出力する想定(量産開始はユーザー指示があってから)。手書き記事も同じ規則に従う。
9. **KB接続(将来 — V3 33章)**: KB-1 以降、記事中のKB由来の事実には `<!-- kbRef: {dataset}:{id} -->` コメントを付け、生md走査で逆引きできるようにする。P3 時点では規約の予約のみ(まだ書かない)。

過去問・給料統計は記事ではなく `data/` のデータ駆動ページ(SSG)なので、ここには置かない。

## frontmatter 例(形式の説明のみ — 実データではない)

```yaml
---
title: 記事タイトル(主クエリを含む)
description: 120字前後の要約
cluster: tenshoku
targetQueries:
  - 想定クエリ1
authorId: ""        # data/authors.ts 登録後に設定
supervisorId: ""    # 同上(監修必須クラスタは公開前に必須)
publishedAt: 2026-01-01
updatedAt: 2026-01-01
sources:
  - name: 出典名(一次情報)
    url: https://example.gov.example/
    publisher: 発行元
    checkedAt: 2026-01-01
prRelated: false
---
```
