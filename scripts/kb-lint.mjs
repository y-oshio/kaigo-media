#!/usr/bin/env node
/**
 * kb-lint — Knowledge Base 品質CIの骨格(設計書V3 32章 §4)。
 *
 * KB-0 時点の検査項目(データファイルが増えるたびに拡張する):
 *   1. data/ 配下の全 .json がパース可能であること
 *   2. KB系レコード(data/kb/ と data/drill/ の .json 内オブジェクト)の必須フィールド
 *      (id / checkedAt / status)と status enum
 *   3. id の重複(ファイル横断)
 *
 * TODO(V3 32章 §4 — 各KBフェーズで追加):
 *   - Zod スキーマ 1:1 検証 / 参照整合(sourceIds・KbRef の実在)
 *   - L2ファクトの sourceIds 空検出 / 鮮度検知(checkedAt+周期) / 定義差混在
 *   - updatedAt 誠実性 / FAQ全文重複 / dataset ID enum / archived 参照
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

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
  // KB系ディレクトリのレコードのみエンベロープ検査(kyuryo 等の既存JSONは各拡張時に適合 — V3 31章 §1)
  const rel = relative(ROOT, file)
  if (rel.startsWith('data/kb/') || rel.startsWith('data/drill/')) {
    const records = Array.isArray(parsed) ? parsed : [parsed]
    for (const [i, rec] of records.entries()) {
      recordCount++
      checkRecord(rec, file, i)
    }
  }
}

if (errors.length > 0) {
  console.error(`kb-lint: NG(${errors.length}件)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`kb-lint: OK(JSON ${jsonCount}ファイル / KBレコード ${recordCount}件を検査)`)
