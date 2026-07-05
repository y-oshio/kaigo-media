#!/usr/bin/env node
/**
 * kb-lint — Knowledge Base 品質CIの骨格(設計書V3 32章 §4)。
 *
 * 検査項目(KB-0 で骨格、KB-1=実装#7 で C2 検査を追加。データが増えるたびに拡張する):
 *   1. data/ 配下の全 .json がパース可能であること
 *   2. KB系レコード(data/kb/・data/drill/・data/kyuryo/ の .json 内オブジェクト)の
 *      必須フィールド(id / checkedAt / status)と status enum
 *   3. id の重複(ファイル横断)
 *   4. C2 給与統計(data/kyuryo/salary-*.json)の固有規則:
 *      - sourceIds 1件以上(L2ファクトの出典義務)+ data/kyuryo/sources.ts に実在
 *      - 1ファイル1出典(調査ごとの定義差を同一表に混在させない — 06章 §3)
 *      - id の決定的導出(c2-<sourceIds[0]>-<pref??'all'>-<job??'all'>-<year> — V3 31章 §1)
 *      - prefSlug / jobSlug が A4/A2 マスタ(data/kb/prefectures.ts / jobs.ts)に実在
 *      - 数値フィールドは number | null(文字列・undefined 混入の検知)
 *
 * TODO(V3 32章 §4 — 各KBフェーズで追加):
 *   - Zod スキーマ 1:1 検証 / KbRef の実在 / 鮮度検知(checkedAt+周期)
 *   - updatedAt 誠実性 / FAQ全文重複 / dataset ID enum / archived 参照
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** TS マスタから slug/id を正規表現で抽出する(TS を import できないための同期複製。
 *  マスタ側の書式(`slug: '...'` / `id: '...'`)が変わったらここも更新する) */
function extractField(file, field) {
  const src = readFileSync(file, 'utf8')
  return new Set([...src.matchAll(new RegExp(`${field}: '([a-z0-9-]+)'`, 'g'))].map((m) => m[1]))
}

/** A4 都道府県マスタの slug 抽出(PREF_ROWS のタプル書式 `['01', 'hokkaido', …]` に対応) */
function extractPrefSlugs(file) {
  const src = readFileSync(file, 'utf8')
  return new Set([...src.matchAll(/\['\d{2}', '([a-z0-9-]+)'/g)].map((m) => m[1]))
}

const ROOT = new URL('..', import.meta.url).pathname
const DATA_DIR = join(ROOT, 'data')
const KB_STATUS = new Set(['draft', 'verified', 'published', 'stale', 'archived'])
// data/drill/ の問題レコードは工程状態を workflowStatus で持つ(types/kakomon.ts)
const WORKFLOW_STATUS = new Set(['draft', 'fact-checked', 'reviewed', 'published', 'excluded'])

const errors = []
const seenIds = new Map() // id -> file

function walk(dir) {
  let files = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) files = files.concat(walk(p))
    else files.push(p)
  }
  return files
}

function checkRecord(rec, file, index) {
  const where = `${relative(ROOT, file)}[${index}]`
  if (typeof rec !== 'object' || rec === null) {
    errors.push(`${where}: レコードがオブジェクトではありません`)
    return
  }
  if (!rec.id || typeof rec.id !== 'string') {
    errors.push(`${where}: id(安定ID)が必須です`)
  } else if (seenIds.has(rec.id)) {
    errors.push(`${where}: id "${rec.id}" が ${seenIds.get(rec.id)} と重複(IDは不変・欠番運用・再利用禁止)`)
  } else {
    seenIds.set(rec.id, relative(ROOT, file))
  }
  if (!rec.checkedAt) errors.push(`${where}: checkedAt(出典確認日)が必須です`)
  const status = rec.status ?? rec.workflowStatus
  if (status === undefined) {
    errors.push(`${where}: status(または workflowStatus)が必須です`)
  } else if (!KB_STATUS.has(status) && !WORKFLOW_STATUS.has(status)) {
    errors.push(`${where}: status "${status}" は許可された enum ではありません`)
  }
}

/** C2 給与統計の固有検査(data/kyuryo/salary-*.json) */
function checkSalaryFile(records, file) {
  const rel = relative(ROOT, file)
  const knownSources = extractField(join(DATA_DIR, 'kyuryo/sources.ts'), 'id')
  const knownPrefs = extractPrefSlugs(join(DATA_DIR, 'kb/prefectures.ts'))
  const knownJobs = extractField(join(DATA_DIR, 'kb/jobs.ts'), 'slug')
  const NUM_FIELDS = [
    'monthlyAvg', 'scheduledMonthly', 'annualBonus', 'avgAge',
    'avgTenureYears', 'scheduledHours', 'overtimeHours', 'workerCount',
  ]
  const sourcesInFile = new Set()

  for (const [i, rec] of records.entries()) {
    const where = `${rel}[${i}]`
    if (!Array.isArray(rec.sourceIds) || rec.sourceIds.length === 0) {
      errors.push(`${where}: C2 は sourceIds 1件以上が必須です(出典なしの統計値は投入禁止)`)
      continue
    }
    for (const s of rec.sourceIds) {
      sourcesInFile.add(s)
      if (!knownSources.has(s)) {
        errors.push(`${where}: sourceId "${s}" が data/kyuryo/sources.ts にありません(出典を先に起票する)`)
      }
    }
    const expectedId = `c2-${rec.sourceIds[0]}-${rec.prefSlug ?? 'all'}-${rec.jobSlug ?? 'all'}-${rec.surveyYear}`
    if (rec.id !== expectedId) {
      errors.push(`${where}: id "${rec.id}" が導出規則と不一致(期待 "${expectedId}" — V3 31章 §1)`)
    }
    if (rec.prefSlug !== undefined && !knownPrefs.has(rec.prefSlug)) {
      errors.push(`${where}: prefSlug "${rec.prefSlug}" が A4 マスタにありません`)
    }
    if (rec.jobSlug !== undefined && !knownJobs.has(rec.jobSlug)) {
      errors.push(`${where}: jobSlug "${rec.jobSlug}" が A2 マスタにありません`)
    }
    if (typeof rec.surveyYear !== 'number') errors.push(`${where}: surveyYear は number 必須です`)
    for (const f of NUM_FIELDS) {
      const v = rec[f]
      if (v === undefined || (v !== null && typeof v !== 'number')) {
        errors.push(`${where}: ${f} は number | null 必須です(出典にない値は null — 捏造禁止)`)
      }
    }
  }
  if (sourcesInFile.size > 1) {
    errors.push(`${rel}: 複数の出典(${[...sourcesInFile].join(', ')})が混在しています(定義差混在の禁止 — 1ファイル1出典)`)
  }
}

let jsonCount = 0
let recordCount = 0

const allFiles = walk(DATA_DIR)
for (const file of allFiles.filter((f) => f.endsWith('.json'))) {
  jsonCount++
  let parsed
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(`${relative(ROOT, file)}: JSONパース不能 — ${e.message}`)
    continue
  }
  const rel = relative(ROOT, file)
  if (rel.startsWith('data/kb/') || rel.startsWith('data/drill/') || rel.startsWith('data/kyuryo/')) {
    const records = Array.isArray(parsed) ? parsed : [parsed]
    for (const [i, rec] of records.entries()) {
      recordCount++
      checkRecord(rec, file, i)
    }
    if (/^data\/kyuryo\/salary-.*\.json$/.test(rel)) checkSalaryFile(records, file)
  }
}

if (errors.length > 0) {
  console.error(`kb-lint: NG(${errors.length}件)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`kb-lint: OK(JSON ${jsonCount}ファイル / KBレコード ${recordCount}件を検査)`)
