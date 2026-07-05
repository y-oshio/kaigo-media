import type { PseoRegistryEntry } from '~/types/kb'

/**
 * E7 pSEOページ群レジストリ(V3 31章 §2・34章 §1 — KB-1)。
 * 「ページ群 = テンプレート(T) × KB結合(J) × 公開ゲート(G)」の J と G を
 * コードではなくデータとして保持する。V2 25章の台帳と1:1。
 *
 * 規約:
 * - 条件0(データ実在確認 — 25章 §4)の確認記録を note に必ず残してから登録する
 * - ページは2軸まで。3軸目はページ内のデータ表現で吸収(34章 §2)
 * - gate の判定実装は utils/kyuryo.ts(ランタイム)と scripts/verify-kyuryo-c2.mjs
 *   (レポート)— パラメータを変えたら両方の挙動を確認する
 */

const CHECKED = '2026-07-05'

export const pseoRegistry: PseoRegistryEntry[] = [
  {
    id: 'kyuryo-pref-kaigoshoku',
    slug: 'kyuryo-pref-kaigoshoku',
    ledgerRef: 'V2-25 §1 #1(都道府県×介護職の平均給料・S評価)',
    templateId: 'T5-pref-salary',
    urlPattern: '/kyuryo/pref/:prefSlug/',
    datasets: ['A4', 'A2', 'C2', 'C1'],
    join: 'A4 prefectures ⋈ C2 salary-stats(jobSlug=kaigoshoku, surveyYear=latest)+ 同県の homonkaigo を参考表示',
    gate: {
      nullRateMax: 0.3,
      primaryFields: ['monthlyAvg', 'scheduledMonthly', 'annualBonus'],
      uniqueBlockMinChars: 400,
      contextGuideLinksMin: 3,
    },
    sourceIds: ['chingin-kouzou-r7'],
    checkedAt: CHECKED,
    updatedAt: CHECKED,
    status: 'draft',
    note:
      '条件0確認(2026-07-05): 令和7年賃金構造基本統計調査(一般労働者)都道府県別第3表' +
      '「都道府県、職種(特掲)、性別きまって支給する現金給与額、所定内給与額及び年間賞与その他特別給与額(産業計)」' +
      '(e-Stat statInfId 000040421195〜000040421198、公開2026-03-24)に' +
      '「介護職員(医療・福祉施設等)」「訪問介護従事者」行が全国+47都道府県で実在することを' +
      'ファイル実体で確認済み(data/kyuryo/raw/chingin-kouzou-r7/)。' +
      '介護職員の主要数値の欠損は0件(null率0%)。' +
      'contextGuideLinksMin(関連ガイド3本への文脈リンク — 25章 §4 条件2)を満たすまで各ページは noindex。' +
      '前年差ブロックは複数年度が貯まった時点で表示開始(初年度は構造的に不可能なため対象外)。',
  },
]
