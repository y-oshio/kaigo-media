# JSON-LD チェックリスト(schema-generator 用)

## 共通
- [ ] JSON構文 valid(パース検証を実行した)
- [ ] `@context` = "https://schema.org"
- [ ] マークアップ内容が**ページ可視コンテンツと完全一致**(見えないものを書かない)
- [ ] URL・画像パスがサイト定数から組み立てられている(手打ちなし)

## Article(全記事必須)
- [ ] headline = frontmatter title(60字以内に収まっている)
- [ ] datePublished / dateModified = frontmatter の値そのまま
- [ ] author = Person(実在執筆者マスタ由来。name + url(/supervisor/ or /about/))
- [ ] publisher = Organization(サイト定数)
- [ ] reviewedBy は**監修完了済みの場合のみ**(監修予定での先行マークアップ禁止)

## BreadcrumbList(全記事必須)
- [ ] 階層がURL構造と一致(トップ → クラスタハブ → 記事)
- [ ] position が1始まりの連番
- [ ] 最終要素が自ページ

## FAQPage(FAQセクションがある記事のみ)
- [ ] 本文のQ/Aと一字一句一致(要約・加筆なし)
- [ ] リッチリザルト表示を前提にした装飾(絵文字・記号詰め込み)なし
- [ ] 質問数が本文と同数(本文にないQを追加しない)

## 禁止スキーマ(検出したら fail)
- AggregateRating / Review(レビュー実体なし)
- HowTo(サポート廃止済み)
- JobPosting(求人データ非保有 — 虚偽求人マークアップは重大違反)
- 監修者の MedicalOrganization 偽装
