# SERP分析プロンプト(keyword-strategist / content-architect が使用)

対象クエリ: {query}

以下を順に分析し、構造化して返すこと。

1. **SERPの支配者**: 上位10件のドメイン種別を分類(求人サイト / 資格スクール / 大手メディア / 官公庁 / 個人)。求人サイトが5割超なら「実データ必須クエリ」として不参入判定
2. **検索意図の判定**: 上位の内容から Know / Do / 比較 / 悩み を判定。**働き手向けと入居者・家族向けの混在**があれば必ず記録(タイトルでの意図明示が必要になる)
3. **網羅項目マップ**: 上位3記事のH2相当の論点を列挙(重複を統合)
4. **欠落=独自価値の候補**: 上位が扱っていない論点・古い制度のまま放置されている記述(例: パート合格制度未対応)・一次データの不在
5. **AI Overviews 露出**: 確認できる場合、AI回答で完結しそうか(完結型なら優先度を下げる判定材料)

出力形式:
```json
{
  "query": "",
  "serpDominance": { "kyujin": 0, "school": 0, "media": 0, "gov": 0, "personal": 0 },
  "intent": "know|do|compare|worry",
  "audienceMix": "worker-only | mixed | family-heavy",
  "coverageMap": ["論点1", "論点2"],
  "gaps": ["上位に無い論点"],
  "verdict": "enter | enter-with-angle | skip",
  "note": ""
}
```

注意: SERPを実際に確認できなかった場合は verdict を出さず `"note": "SERP未確認"` とする(推測でSERPを創作しない)。
