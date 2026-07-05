#!/usr/bin/env node
/**
 * C2 給与統計の照合スクリプト(npm run verify:kyuryo — P6承認条件5)。
 *
 * コミット済みの data/kyuryo/salary-chingin-kouzou-r7.json が
 * 原本(e-Stat XLSX)から決定的に導出された値と一致することを機械検証する:
 *   1. 原本XLSXの sha256(ダウンロード時に記録)— 原本の改変・差し替え検知
 *   2. extract.csv からの再生成とコミット済みJSONの全レコード突合
 *      (status は人間承認で昇格するため比較から除外)
 *   3. 件数・軸の網羅(職種2 × 全国+47都道府県、id 一意)
 *   4. 全国値アンカー: 原本から目視転記した期待値との一致(パイプライン退行検知)
 *   5. 値域の妥当性(月給・賞与・労働者数の範囲、所定内 ≦ きまって支給)
 *   6. 公開ゲート(E7: null率 ≦ 30%)の判定レポート
 *
 * 原本を再取得した場合は extract → build を再実行し、本スクリプトの
 * sha256 とアンカー値を新しい原本に合わせて更新すること。
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildRecords, PREF_SLUG_BY_CODE } from './build-kyuryo-c2.mjs'

const ROOT = new URL('..', import.meta.url).pathname
const RAW = join(ROOT, 'data/kyuryo/raw/chingin-kouzou-r7')
const JSON_PATH = join(ROOT, 'data/kyuryo/salary-chingin-kouzou-r7.json')

const errors = []
const ok = (label) => console.log(`  ✓ ${label}`)

// 1. 原本の sha256(2026-07-05 ダウンロード時に記録 — raw/README.md と同値)
const XLSX_SHA256 = {
  'pref3-000040421195.xlsx': '504ed50beceef1ff228a0dcbfaa5f7b9251dcdc10de12a8601a0f11bf4e0a23e',
  'pref3-000040421196.xlsx': '89f079272d9b63d5f156ab17f259443ce82b47c6b3b35364304dc18a5bce9b37',
  'pref3-000040421197.xlsx': 'cd27baf1dfdbf553708430e084118665c38ca773f1ce2ee5ff855768902fbb5e',
  'pref3-000040421198.xlsx': '8c322bd1fb44c73de6b719bd104365cbd9bb0e093c1eb7cd3b8cb38f9f5ff65b',
}
for (const [name, expected] of Object.entries(XLSX_SHA256)) {
  const actual = createHash('sha256').update(readFileSync(join(RAW, name))).digest('hex')
  if (actual !== expected) errors.push(`原本改変検知: ${name} の sha256 が記録と不一致`)
}
if (errors.length === 0) ok('原本XLSX 4ファイルの sha256 一致')

// 2. 再生成との突合(status のみ人間承認で変わるため比較から除外)
const committed = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
const rebuilt = buildRecords(readFileSync(join(RAW, 'extract.csv'), 'utf8'))
const stripStatus = ({ status, ...rest }) => rest
if (committed.length !== rebuilt.length) {
  errors.push(`レコード数不一致: JSON ${committed.length} / 再生成 ${rebuilt.length}`)
} else {
  committed.forEach((rec, i) => {
    const a = JSON.stringify(stripStatus(rec))
    const b = JSON.stringify(stripStatus(rebuilt[i]))
    if (a !== b) errors.push(`レコード不一致: ${rec.id}`)
  })
  if (errors.length === 0) ok(`再生成 ${rebuilt.length} レコードとコミット済みJSONが一致`)
}

// 3. 件数・軸の網羅・id 一意
const ids = new Set(committed.map((r) => r.id))
if (ids.size !== committed.length) errors.push('id の重複があります')
for (const job of ['kaigoshoku', 'homonkaigo']) {
  const rows = committed.filter((r) => r.jobSlug === job)
  const prefs = new Set(rows.filter((r) => r.prefSlug).map((r) => r.prefSlug))
  const hasNational = rows.some((r) => !r.prefSlug)
  if (rows.length !== 48 || prefs.size !== 47 || !hasNational) {
    errors.push(`${job}: 全国+47都道府県になっていません(${rows.length}行・県${prefs.size})`)
  }
  const known = new Set(Object.values(PREF_SLUG_BY_CODE))
  for (const p of prefs) if (!known.has(p)) errors.push(`${job}: 未知の prefSlug ${p}`)
}
if (errors.length === 0) ok('職種2 × 全国+47都道府県を網羅・id 一意')

// 4. 全国値アンカー(原本XLSX「全国」列から 2026-07-05 に目視転記した期待値)
const NATIONAL_ANCHORS = {
  'c2-chingin-kouzou-r7-all-kaigoshoku-2025': {
    monthlyAvg: 277700, scheduledMonthly: 262900, annualBonus: 547800,
    avgAge: 45.3, avgTenureYears: 9, workerCount: 1165930,
  },
  'c2-chingin-kouzou-r7-all-homonkaigo-2025': {
    monthlyAvg: 281600, scheduledMonthly: 267300, annualBonus: 439700,
    avgAge: 51.2, avgTenureYears: 8.8, workerCount: 83920,
  },
}
for (const [id, expect] of Object.entries(NATIONAL_ANCHORS)) {
  const rec = committed.find((r) => r.id === id)
  if (!rec) { errors.push(`全国レコードがありません: ${id}`); continue }
  for (const [k, v] of Object.entries(expect)) {
    if (rec[k] !== v) errors.push(`全国値アンカー不一致: ${id}.${k} = ${rec[k]}(期待 ${v})`)
  }
}
if (errors.length === 0) ok('全国値アンカー(介護職員・訪問介護従事者)一致')

// 5. 値域の妥当性(転記ズレ・単位換算ミスの検知)
for (const r of committed) {
  const w = `${r.id}`
  if (r.monthlyAvg !== null && (r.monthlyAvg < 150000 || r.monthlyAvg > 500000)) {
    errors.push(`${w}: monthlyAvg ${r.monthlyAvg} が想定値域外(単位換算ミスの疑い)`)
  }
  if (r.monthlyAvg !== null && r.scheduledMonthly !== null && r.scheduledMonthly > r.monthlyAvg) {
    errors.push(`${w}: 所定内給与がきまって支給する現金給与額を超えています`)
  }
  if (r.annualBonus !== null && (r.annualBonus < 0 || r.annualBonus > 2000000)) {
    errors.push(`${w}: annualBonus ${r.annualBonus} が想定値域外`)
  }
  if (r.workerCount !== null && r.workerCount <= 0) errors.push(`${w}: workerCount が不正`)
  if (r.surveyYear !== 2025) errors.push(`${w}: surveyYear が 2025 ではありません`)
}
if (errors.length === 0) ok('全レコードの値域チェック通過')

// 6. 公開ゲート判定レポート(E7 kyuryo-pref-kaigoshoku: null率 ≦ 30%)
//    ランタイム実装は utils/kyuryo.ts — ゲート規則を変えたら両方を更新する
const PRIMARY_FIELDS = ['monthlyAvg', 'scheduledMonthly', 'annualBonus']
const NULL_RATE_MAX = 0.3
const gateFail = []
for (const r of committed.filter((x) => x.jobSlug === 'kaigoshoku' && x.prefSlug)) {
  const nulls = PRIMARY_FIELDS.filter((f) => r[f] === null).length
  if (nulls / PRIMARY_FIELDS.length > NULL_RATE_MAX) gateFail.push(r.prefSlug)
}
console.log(`  ゲート判定(#1 都道府県×介護職): 生成可 ${47 - gateFail.length}/47` +
  (gateFail.length ? ` / 生成しない: ${gateFail.join(', ')}` : ''))

if (errors.length > 0) {
  console.error(`verify:kyuryo NG(${errors.length}件)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log('verify:kyuryo OK')
