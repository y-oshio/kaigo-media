import type { Question } from '~/types/shindan'
// aff-v1-kaigo-shindan/data/questions.ts から移植(実装#6=P7)。質問・スコア配点は変更していない。

/**
 * 15問。各選択肢は複数タイプに少しずつ点数を散らし、
 * バランスよく診断できるように設計しています。
 * 質問を増減したい場合は配列に追加・削除してください。
 */
export const questions: Question[] = [
  {
    id: 1,
    text: 'あなたの介護経験はどのくらいですか?',
    choices: [
      {
        label: 'まったくの未経験(資格なし)',
        scores: { beginner: 3, dayservice: 1, paidhome: 1 },
      },
      {
        label: '1〜3年(初任者・実務者あり)',
        scores: { dayservice: 2, homecare: 2, paidhome: 2, tokuyo: 1 },
      },
      {
        label: '4〜9年(介護福祉士あり)',
        scores: { tokuyo: 2, rouken: 2, paidhome: 2, nightshift: 1 },
      },
      {
        label: '10年以上のベテラン',
        scores: { caremanager: 3, rouken: 2, tokuyo: 1 },
      },
    ],
  },
  {
    id: 2,
    text: '介護の仕事で一番大切にしたいことは?',
    choices: [
      {
        label: '利用者さんとじっくり関わりたい',
        scores: { homecare: 3, dayservice: 2, paidhome: 1 },
      },
      {
        label: 'チームでしっかり支えたい',
        scores: { tokuyo: 3, rouken: 2, paidhome: 1 },
      },
      {
        label: 'リハビリや在宅復帰を支えたい',
        scores: { rouken: 3, homecare: 1 },
      },
      {
        label: '相談や調整で人を支えたい',
        scores: { caremanager: 3, dayservice: 1 },
      },
    ],
  },
  {
    id: 3,
    text: '希望の勤務スタイルは?',
    choices: [
      {
        label: '日勤メインで規則正しく働きたい',
        scores: { dayservice: 3, caremanager: 2, homecare: 1 },
      },
      {
        label: '夜勤を多めに入れて収入を上げたい',
        scores: { nightshift: 3, tokuyo: 1, paidhome: 1 },
      },
      {
        label: 'シフトを柔軟に組みたい',
        scores: { homecare: 3, paidhome: 1, dayservice: 1 },
      },
      {
        label: '24時間体制のチームに入りたい',
        scores: { tokuyo: 2, rouken: 2, paidhome: 1 },
      },
    ],
  },
  {
    id: 4,
    text: '体力的な負担への考え方は?',
    choices: [
      {
        label: '体を動かす介助はむしろ得意',
        scores: { tokuyo: 3, rouken: 2, paidhome: 1, nightshift: 1 },
      },
      {
        label: '無理のない範囲で介助したい',
        scores: { dayservice: 3, paidhome: 2, homecare: 1 },
      },
      {
        label: '訪問先で1人で動くのも平気',
        scores: { homecare: 3 },
      },
      {
        label: '体よりも頭を使う仕事がいい',
        scores: { caremanager: 3 },
      },
    ],
  },
  {
    id: 5,
    text: '収入面でいちばん大事なのは?',
    choices: [
      {
        label: '夜勤手当でしっかり稼ぎたい',
        scores: { nightshift: 3, tokuyo: 1, paidhome: 1 },
      },
      {
        label: '安定した月給と賞与がほしい',
        scores: { tokuyo: 2, rouken: 2, paidhome: 1, caremanager: 1 },
      },
      {
        label: '時給や日給で柔軟に働きたい',
        scores: { homecare: 3, dayservice: 1 },
      },
      {
        label: '最初は収入より経験を優先したい',
        scores: { beginner: 3, dayservice: 1 },
      },
    ],
  },
  {
    id: 6,
    text: '利用者さんとの関わり方の理想は?',
    choices: [
      {
        label: '1対1でじっくり関わりたい',
        scores: { homecare: 3, caremanager: 1 },
      },
      {
        label: '同じメンバーと長く関わりたい',
        scores: { tokuyo: 3, paidhome: 2 },
      },
      {
        label: 'にぎやかな雰囲気で関わりたい',
        scores: { dayservice: 3, beginner: 1 },
      },
      {
        label: '入退所が多くいろんな人と関わりたい',
        scores: { rouken: 3 },
      },
    ],
  },
  {
    id: 7,
    text: '医療的ケアへのスタンスは?',
    choices: [
      {
        label: '医療職と連携してケアを深めたい',
        scores: { rouken: 3, tokuyo: 2, paidhome: 1 },
      },
      {
        label: '生活援助・身体介護を中心にしたい',
        scores: { homecare: 3, dayservice: 1, tokuyo: 1 },
      },
      {
        label: 'レクや交流に力を入れたい',
        scores: { dayservice: 3, paidhome: 1 },
      },
      {
        label: 'できれば医療色は薄い職場がいい',
        scores: { beginner: 3, dayservice: 1, paidhome: 1 },
      },
    ],
  },
  {
    id: 8,
    text: '今後のキャリアで目指したい方向は?',
    choices: [
      {
        label: '現場のリーダー・主任を目指したい',
        scores: { tokuyo: 2, rouken: 2, paidhome: 2 },
      },
      {
        label: 'ケアマネ・相談員になりたい',
        scores: { caremanager: 3 },
      },
      {
        label: '訪問でプロとして自立したい',
        scores: { homecare: 3 },
      },
      {
        label: 'まずは介護の仕事に慣れたい',
        scores: { beginner: 3, dayservice: 1 },
      },
    ],
  },
  {
    id: 9,
    text: '勤務先までの通勤の希望は?',
    choices: [
      {
        label: '自宅近くで自転車や徒歩で通いたい',
        scores: { dayservice: 2, homecare: 2, beginner: 1 },
      },
      {
        label: '車通勤OKの郊外施設でもいい',
        scores: { tokuyo: 2, rouken: 2 },
      },
      {
        label: '駅近の都市型施設がいい',
        scores: { paidhome: 3, caremanager: 1 },
      },
      {
        label: '直行直帰の働き方がいい',
        scores: { homecare: 3 },
      },
    ],
  },
  {
    id: 10,
    text: '苦手・避けたい業務は?',
    choices: [
      {
        label: '重度の身体介護は避けたい',
        scores: { dayservice: 2, caremanager: 2, paidhome: 1 },
      },
      {
        label: '夜勤は避けたい',
        scores: { dayservice: 3, caremanager: 2, homecare: 1 },
      },
      {
        label: '記録や事務は最小限にしたい',
        scores: { homecare: 2, beginner: 1, nightshift: 1 },
      },
      {
        label: '特になし。何でもやりたい',
        scores: { tokuyo: 2, rouken: 2, nightshift: 1, paidhome: 1 },
      },
    ],
  },
  {
    id: 11,
    text: '職場の雰囲気で重視するのは?',
    choices: [
      {
        label: 'アットホームで温かい雰囲気',
        scores: { dayservice: 2, homecare: 2, beginner: 1, paidhome: 1 },
      },
      {
        label: '研修や教育がしっかりしている',
        scores: { beginner: 3, paidhome: 2, rouken: 1 },
      },
      {
        label: 'チームワークでしっかり連携できる',
        scores: { tokuyo: 3, rouken: 2 },
      },
      {
        label: '自分の裁量で動ける',
        scores: { homecare: 3, caremanager: 2 },
      },
    ],
  },
  {
    id: 12,
    text: '休日・有給についての希望は?',
    choices: [
      {
        label: '土日祝休みが理想',
        scores: { caremanager: 3, dayservice: 2 },
      },
      {
        label: 'シフト制でも問題ない',
        scores: { tokuyo: 2, rouken: 2, paidhome: 2, nightshift: 1 },
      },
      {
        label: '希望日に休みを取りやすい職場',
        scores: { homecare: 3, dayservice: 1 },
      },
      {
        label: '稼げるならシフト多めでもいい',
        scores: { nightshift: 3, tokuyo: 1 },
      },
    ],
  },
  {
    id: 13,
    text: '入居者・利用者の介護度のイメージは?',
    choices: [
      {
        label: '比較的お元気な方が多い職場がいい',
        scores: { dayservice: 3, paidhome: 2, beginner: 1 },
      },
      {
        label: '中重度の方をチームで支えたい',
        scores: { tokuyo: 3, rouken: 1 },
      },
      {
        label: '在宅復帰を目指す方を支えたい',
        scores: { rouken: 3 },
      },
      {
        label: '一人ひとりの生活に寄り添いたい',
        scores: { homecare: 3, paidhome: 1 },
      },
    ],
  },
  {
    id: 14,
    text: 'これまでに評価されたあなたの強みは?',
    choices: [
      {
        label: '体力・スタミナ',
        scores: { tokuyo: 2, nightshift: 2, rouken: 1 },
      },
      {
        label: 'コミュニケーション力',
        scores: { dayservice: 2, paidhome: 2, caremanager: 1, homecare: 1 },
      },
      {
        label: '段取り・調整力',
        scores: { caremanager: 3, rouken: 1 },
      },
      {
        label: '素直さ・吸収の早さ',
        scores: { beginner: 3, dayservice: 1 },
      },
    ],
  },
  {
    id: 15,
    text: '最後に。あなたが転職で一番叶えたいことは?',
    choices: [
      {
        label: '収入アップ',
        scores: { nightshift: 3, paidhome: 1, tokuyo: 1 },
      },
      {
        label: 'やりがい・スキルアップ',
        scores: { tokuyo: 2, rouken: 2, caremanager: 2 },
      },
      {
        label: 'ワークライフバランス',
        scores: { dayservice: 3, homecare: 2, caremanager: 1 },
      },
      {
        label: 'まずは介護業界に入ること',
        scores: { beginner: 3 },
      },
    ],
  },
]
