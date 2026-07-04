# CTAブロック集(設計書07章 §3 準拠)

writer は plan の ctaPlacements で指定されたブロックだけを、指定位置に挿入する。
全アフィリエイトリンクは `/go/<slug>` 経由・`rel="sponsored nofollow"`(コンポーネント側で強制)。

## コンポーネント記法

```
::affiliate-link{slug=leverwell cluster=c4 position=footer}
訴求文(1〜2文。共感 → 行動の順)
::

::diagnosis-cta{cluster=c5 position=footer}
「あなたはどのタイプの職場向き? 15問でわかる適性診断」
::

::line-cta{cluster=c1 position=footer}
「合格後のキャリア情報をLINEで受け取る」
::
```

## クラスタ別の定型(強度・訴求の基準)

| クラスタ | 強度 | 一次CTA | 訴求の型 |
| --- | --- | --- | --- |
| c4 悩み・退職 | 強 | affiliate(leverwell / mynavi) | 「あなたが悪いわけではない」共感 → 「環境を変える選択肢の相談」 |
| c3 給料 | 強 | affiliate | 「給料を上げる現実的な3つの方法」の1つとして転職相談を提示 |
| c2 資格 | 中 | affiliate(kaigobatake)+ 資料請求(shikatoru / brushup) | 「働きながら無料で資格を取る」 |
| c5 施設種別 | 中 | diagnosis-cta | 「自分に合う施設タイプを診断で確認」 |
| c6 職種図鑑 | 中 | 資格記事への内部リンク → affiliate | ステップ導線(直接は押さない) |
| (c1 過去問) | 弱 | 資料請求 or diagnosis or line | 学習の邪魔をしない。解説末尾に1箇所のみ |

## 禁止事項

- 1記事にCTA3箇所以上/追従バナー/ポップアップ/本文を分断する巨大バナー
- 「今すぐ登録しないと損」等の煽り・虚偽の限定表現(景表法)
- 診断結果と無関係な案件の推薦(結果8タイプ→案件の対応は設計書07章の表に従う)
- prRelated: false のページへの affiliate-link 挿入(表記と実体の不一致)
