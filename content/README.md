# content/ — 記事コンテンツ配置ルール

記事 Markdown(Nuxt Content)の置き場。**Nuxt Content の導入は実装#3**(設計書10章)なので、現時点ではディレクトリ構造と配置ルールのみを定義する。

## ディレクトリ = クラスタ = URL

| ディレクトリ | クラスタ | URL |
| --- | --- | --- |
| `shikaku/` | C2: 資格・研修 | `/shikaku/<slug>/` |
| `tenshoku/` | C4: 悩み・退職・転職 | `/tenshoku/<slug>/` |
| `shisetsu/` | C5: 施設種別 | `/shisetsu/<slug>/` |
| `shokushu/` | C6: 職種図鑑 | `/shokushu/<slug>/` |
| `kyuryo/` | C3: 給料系解説記事 | `/kyuryo/guide/<slug>/`(**guide 配下に出る**。pref/job はデータ駆動ページの予約語) |

## ルール(設計書03章・06章より)

1. **スラッグ**: 全て小文字ローマ字(ヘボン式)。予約語 `pref` / `job` / `guide` は記事スラッグに使用禁止(`config/routes.ts` の `RESERVED_SLUGS`)。一度公開したURLは変更しない。
2. **frontmatter**: 設計書06章 §2-4 のスキーマに従う(title / description / cluster / targetQueries / authorId / supervisorId / publishedAt / updatedAt / sources / prRelated)。監修必須クラスタで supervisorId が空の記事は公開不可(品質CI・実装#5 で機械チェック)。
3. **出典**: 統計・制度に言及する記事は frontmatter の `sources` に一次出典と `checkedAt` を必ず記録する。
4. **孤立ページ禁止**: 記事公開時に既存記事から必ず1本以上のリンクを受ける(03章 §3)。
5. **記事の量産**: `ai-company/` パイプラインが本ディレクトリへ出力する想定。手書き記事も同じ frontmatter 規則に従う。

過去問・給料統計は記事ではなく `data/` のデータ駆動ページ(SSG)なので、ここには置かない。
