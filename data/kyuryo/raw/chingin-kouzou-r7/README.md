# 原本: 令和7年賃金構造基本統計調査 都道府県別第3表(4分冊)

C2 給与統計(`data/kyuryo/salary-chingin-kouzou-r7.json`)の一次出典。
e-Stat からダウンロードした **未加工の原本**であり、編集禁止(照合スクリプトが
sha256 で改変を検知する — `npm run verify:kyuryo`)。

## 出典(条件0: データ実在確認 — V2 25章 §4 条件0)

- 統計名: 賃金構造基本統計調査(政府統計コード 00450091・厚生労働省)
- 調査回: 令和7年賃金構造基本統計調査(調査基準: 令和7年6月分。年間賞与その他特別給与額は令和6年1年間)
- 統計表: **(一般労働者)都道府県別第3表「都道府県、職種(特掲)、性別きまって支給する現金給与額、所定内給与額及び年間賞与その他特別給与額(産業計)」**
- 公開日: 2026-03-24(e-Stat 表示)/ 確認日: 2026-07-05
- 一覧ページ: https://www.e-stat.go.jp/stat-search/files?cycle=0&tclass=000001229518

| ファイル | statInfId | 収録範囲 | ダウンロードURL |
| --- | --- | --- | --- |
| pref3-000040421195.xlsx | 000040421195 | 全国〜埼玉 | https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040421195&fileKind=4 |
| pref3-000040421196.xlsx | 000040421196 | 千葉〜愛知 | https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040421196&fileKind=4 |
| pref3-000040421197.xlsx | 000040421197 | 三重〜山口 | https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040421197&fileKind=4 |
| pref3-000040421198.xlsx | 000040421198 | 徳島〜沖縄 | https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040421198&fileKind=4 |

各分冊は 全国+47都道府県(重複なし)× 職種(特掲)× 男女計/男/女 を収録。
本サイトが使用するのは **男女計** の「介護職員(医療・福祉施設等)」
「訪問介護従事者」行のみ(抽出: `scripts/extract-kyuryo-chingin-r7.py`)。

## 加工パイプライン(すべて決定的・手入力なし)

```
pref3-*.xlsx(原本・編集禁止)
  → scripts/extract-kyuryo-chingin-r7.py  … 対象行のみ抽出 → extract.csv
  → scripts/build-kyuryo-c2.mjs           … 単位換算+KbMetaエンベロープ → ../salary-chingin-kouzou-r7.json
  → scripts/verify-kyuryo-c2.mjs          … 照合(再生成一致・件数・全国値アンカー・値域)
```

- 出典にない値(表中の「-」等)は **null のまま**保持する(推計・補完をしない — 捏造禁止)。
- 年次更新(次回: 令和8年調査、2027年3月頃公表見込み)は新しい原本を別ディレクトリに追加し、
  既存レコードは削除せず年度キーで並存させる(`data/update-calendar.ts` 参照)。
