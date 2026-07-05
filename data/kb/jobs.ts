import type { JobRole } from '~/types/kb'

/**
 * A2 職種マスタ最小版(V3 31章 §2 — KB-1)。
 * 給料pSEO(/kyuryo/)で使う職種のみ登録する(YAGNIゲート: 消費者が
 * 確定していない職種は追加しない)。slug = id・公開後変更禁止。
 *
 * statLabels は統計表上の職種名との対応辞書(抽出スクリプトの照合キー)。
 * 賃金構造基本統計調査の職種(特掲)の名称が変わった場合はここも更新する。
 */

const CHECKED = '2026-07-05'

export const jobRoles: JobRole[] = [
  {
    id: 'kaigoshoku',
    slug: 'kaigoshoku',
    name: '介護職員(医療・福祉施設等)',
    shortName: '介護職員',
    description:
      '特別養護老人ホーム・介護老人保健施設・デイサービスなどの施設・事業所で、利用者の食事・入浴・排せつなどの身体介助や生活支援を行う職種。賃金構造基本統計調査の職種(特掲)区分では、医療・福祉施設等に勤務する介護職員を指す(訪問介護従事者は別区分)。',
    statLabels: [{ sourceId: 'chingin-kouzou-r7', label: '介護職員(医療・福祉施設等)' }],
    sourceIds: ['chingin-kouzou-r7'],
    checkedAt: CHECKED,
    updatedAt: CHECKED,
    status: 'draft',
  },
  {
    id: 'homonkaigo',
    slug: 'homonkaigo',
    name: '訪問介護従事者',
    shortName: '訪問介護員',
    description:
      '利用者の自宅を訪問し、身体介助や調理・掃除などの生活援助を行う職種(ホームヘルパー)。賃金構造基本統計調査の職種(特掲)区分では、施設勤務の介護職員と分けて集計される。',
    statLabels: [{ sourceId: 'chingin-kouzou-r7', label: '訪問介護従事者' }],
    sourceIds: ['chingin-kouzou-r7'],
    checkedAt: CHECKED,
    updatedAt: CHECKED,
    status: 'draft',
  },
]

export function findJobRole(slug: string): JobRole | undefined {
  return jobRoles.find((j) => j.slug === slug)
}
