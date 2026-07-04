# 内部リンク チェックリスト(internal-linker 用 / 月次監査でも使用)

## 記事単位(パイプライン内)
- [ ] inbound 1本以上(0本 = orphanRisk: true で publish-manager が blocked にする)
- [ ] outbound 2〜5本・全て文脈適合の rationale あり
- [ ] アンカーテキスト: 「こちら」「この記事」「詳細」禁止 / 遷移先の主要クエリ語彙を含む / 同一アンカーの機械的反復なし
- [ ] リンク先URL全件実在(existing content + 同バッチ plans で突合)
- [ ] 同バッチ依存リンクは dependsOnBatchArticle を記録し publishOrder に反映
- [ ] トップからの到達: 記事3クリック以内(過去問1問ページのみ4クリック以内 — 設計書03章)
- [ ] リンク挿入で文が破綻していない(挿入前後1文を読み直した)

## サイト単位(月次監査 — ツール#3 実装までは手動)
- [ ] 孤立ページ(inbound 0)の一覧を作成し、翌月の inbound 挿入計画に載せた
- [ ] ハブページ(/kakomon/ /kyuryo/ 等)から新記事群への導線が更新されている
- [ ] パンくずと BreadcrumbList の不一致ページゼロ
- [ ] リンク切れ(404)ゼロ
- [ ] CTA(/go/)リンクに rel="sponsored nofollow" が付いている(コンポーネント外の生リンク検出)
