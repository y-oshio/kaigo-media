import type { UpdateCalendarEntry } from '~/types/kb'

/**
 * E2 更新カレンダー(V3 31章 §2 — KB-1 で新設。C1 の nextExpectedRelease から導出)。
 * 統計の公表・制度の施行が近づいたら該当データセットを更新し、
 * 消化したエントリは削除せず expectedAt を次回に進める(履歴は git)。
 */

const CHECKED = '2026-07-05'

export const updateCalendar: UpdateCalendarEntry[] = [
  {
    id: 'e2-chingin-kouzou-r8',
    title: '令和8年賃金構造基本統計調査の公表(C2 給与統計の年次更新)',
    expectedAt: '2027-03',
    targetDatasets: ['C1', 'C2', 'E7'],
    action:
      '都道府県別第3表(職種特掲)の新XLSXを data/kyuryo/raw/ の新ディレクトリに取得し、' +
      'extract-kyuryo-chingin-r7.py を新調査向けに複製 → build → verify → 既存レコードは残したまま' +
      '新年度レコードを追加(上書き禁止)。C1 に新出典を起票し、T5テンプレートの前年差ブロックを有効化する。',
    sourceIds: ['chingin-kouzou-r7'],
    checkedAt: CHECKED,
    updatedAt: CHECKED,
    status: 'draft',
    note: '公表時期は令和7年調査の実績(2026-03-24公開)からの見込み',
  },
]
