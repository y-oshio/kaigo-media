#!/usr/bin/env node
/**
 * C2 給与統計レコードの生成(extract.csv → data/kyuryo/salary-chingin-kouzou-r7.json)。
 *
 * - 入力は原本XLSXからの決定的抽出(scripts/extract-kyuryo-chingin-r7.py)のみ。手入力なし。
 * - 単位換算: 千円→円(×1000)・十人→人(×10)。それ以外の値は原本のまま。
 * - 出典にない値(空欄)は null のまま(推計・補完をしない — 捏造禁止)。
 * - id は複合キーからの決定的導出(V3 31章 §1): c2-<sourceId>-<prefSlug ?? 'all'>-<jobSlug>-<year>
 * - status は 'draft' で生成する。verified への昇格は人間のみ(npm run kb-promote)。
 *
 * 照合は scripts/verify-kyuryo-c2.mjs(このスクリプトと独立に再計算して突合する)。
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CSV = join(ROOT, 'data/kyuryo/raw/chingin-kouzou-r7/extract.csv')
const OUT = join(ROOT, 'data/kyuryo/salary-chingin-kouzou-r7.json')

export const SOURCE_ID = 'chingin-kouzou-r7'
export const SURVEY_YEAR = 2025 // 令和7年調査(令和7年6月分)
export const CHECKED_AT = '2026-07-05' // 原本ダウンロード・確認日(再取得時に更新)

// 抽出CSVの県コード → prefSlug(data/kb/prefectures.ts と同期 — kb-lint が突合)
export const PREF_SLUG_BY_CODE = {
  '01': 'hokkaido', '02': 'aomori', '03': 'iwate', '04': 'miyagi', '05': 'akita',
  '06': 'yamagata', '07': 'fukushima', '08': 'ibaraki', '09': 'tochigi', '10': 'gunma',
  '11': 'saitama', '12': 'chiba', '13': 'tokyo', '14': 'kanagawa', '15': 'niigata',
  '16': 'toyama', '17': 'ishikawa', '18': 'fukui', '19': 'yamanashi', '20': 'nagano',
  '21': 'gifu', '22': 'shizuoka', '23': 'aichi', '24': 'mie', '25': 'shiga',
  '26': 'kyoto', '27': 'osaka', '28': 'hyogo', '29': 'nara', '30': 'wakayama',
  '31': 'tottori', '32': 'shimane', '33': 'okayama', '34': 'hiroshima', '35': 'yamaguchi',
  '36': 'tokushima', '37': 'kagawa', '38': 'ehime', '39': 'kochi', '40': 'fukuoka',
  '41': 'saga', '42': 'nagasaki', '43': 'kumamoto', '44': 'oita', '45': 'miyazaki',
  '46': 'kagoshima', '47': 'okinawa',
}

export const JOB_NAMES = {
  kaigoshoku: '介護職員(医療・福祉施設等)',
  homonkaigo: '訪問介護従事者',
}

const num = (s) => (s === '' ? null : Number(s))
const senYen = (s) => (s === '' ? null : Math.round(Number(s) * 1000)) // 千円→円
const tensOfPeople = (s) => (s === '' ? null : Math.round(Number(s) * 10)) // 十人→人

/** extract.csv を C2 レコード配列に変換する(verify からも使う共通変換) */
export function buildRecords(csvText) {
  const lines = csvText.replace(/\r/g, '').trim().split('\n')
  const header = lines[0].split(',')
  const expected = 'file,jobSlug,prefCode,prefName,age,tenureYears,scheduledHours,overtimeHours,monthlyKimatte,monthlyShotei,annualBonus,workersTens'
  if (header.join(',') !== expected) {
    throw new Error(`extract.csv のヘッダが想定と異なります(抽出スクリプトの変更を確認): ${header.join(',')}`)
  }
  const records = lines.slice(1).map((line) => {
    const c = line.split(',')
    const [, jobSlug, prefCode, prefName, age, tenure, schedH, overH, kimatte, shotei, bonus, workers] = c
    const prefSlug = prefCode === '00' ? undefined : PREF_SLUG_BY_CODE[prefCode]
    if (prefCode !== '00' && !prefSlug) throw new Error(`未知の県コード: ${prefCode}`)
    if (!JOB_NAMES[jobSlug]) throw new Error(`未知の jobSlug: ${jobSlug}`)
    const scope = prefSlug ? prefName : '全国'
    return {
      id: `c2-${SOURCE_ID}-${prefSlug ?? 'all'}-${jobSlug}-${SURVEY_YEAR}`,
      ...(prefSlug ? { prefSlug } : {}),
      jobSlug,
      displayName: `${scope}の${JOB_NAMES[jobSlug]}(男女計)`,
      surveyYear: SURVEY_YEAR,
      monthlyAvg: senYen(kimatte),
      scheduledMonthly: senYen(shotei),
      annualBonus: senYen(bonus),
      avgAge: num(age),
      avgTenureYears: num(tenure),
      scheduledHours: num(schedH),
      overtimeHours: num(overH),
      workerCount: tensOfPeople(workers),
      sourceIds: [SOURCE_ID],
      checkedAt: CHECKED_AT,
      updatedAt: CHECKED_AT,
      status: 'draft',
    }
  })
  // 全国→県コード順・職種順(CSV側でソート済みだが、出力の安定性をここでも保証)
  return records
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())
if (isMain) {
  const records = buildRecords(readFileSync(CSV, 'utf8'))
  writeFileSync(OUT, JSON.stringify(records, null, 2) + '\n')
  const nulls = records.filter((r) => r.monthlyAvg === null).length
  console.log(`build: ${records.length} レコード → data/kyuryo/salary-chingin-kouzou-r7.json(monthlyAvg null: ${nulls}件)`)
}
