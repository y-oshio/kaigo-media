#!/usr/bin/env node
// pipeline-status.mjs — バッチの進捗・結果を集計して表示する
// 使い方: node scripts/pipeline-status.mjs <orderId>
// work/<orderId>/ の成果物ファイルの存在とmanifestのstatusから、記事ごとの工程到達状況を一覧化する

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const orderId = process.argv[2]
if (!orderId) { console.error('使い方: node pipeline-status.mjs <orderId>'); process.exit(2) }
const WORK = join(here, '..', 'work', orderId)
if (!existsSync(WORK)) { console.error(`✗ ${WORK} がありません`); process.exit(1) }

const stages = [
  ['brief', (id) => join(WORK, 'briefs', `${id}.json`)],
  ['plan', (id) => join(WORK, 'plans', `${id}.plan.json`)],
  ['draft', (id) => join(WORK, 'drafts', `${id}.draft.md`)],
  ['fact', (id) => join(WORK, 'factcheck', `${id}.report.json`)],
  ['eeat', (id) => join(WORK, 'eeat', `${id}.report.json`)],
  ['link', (id) => join(WORK, 'links', `${id}.links.json`)],
  ['jsonld', (id) => join(WORK, 'jsonld', `${id}.jsonld.json`)],
  ['manifest', (id) => join(WORK, 'manifests', `${id}.manifest.json`)],
]

const briefDir = join(WORK, 'briefs')
const ids = existsSync(briefDir)
  ? readdirSync(briefDir).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''))
  : []
if (!ids.length) { console.log('briefs がまだありません(キーワード選定前)'); process.exit(0) }

const counts = { ready: 0, 'awaiting-supervisor': 0, blocked: 0, 'in-progress': 0 }
console.log(`\n=== ${orderId}: ${ids.length}記事 ===\n`)
console.log(['kwId'.padEnd(10), ...stages.map(([n]) => n.padEnd(8)), 'status'].join(''))
for (const id of ids.sort()) {
  const row = [id.padEnd(10)]
  for (const [, p] of stages) row.push((existsSync(p(id)) ? '✓' : '·').padEnd(8))
  let status = 'in-progress'
  const mPath = join(WORK, 'manifests', `${id}.manifest.json`)
  if (existsSync(mPath)) {
    try { status = JSON.parse(readFileSync(mPath, 'utf8')).status || 'in-progress' } catch { status = 'manifest破損' }
  }
  counts[status] = (counts[status] || 0) + 1
  row.push(status)
  console.log(row.join(''))
}
console.log(`\nready: ${counts.ready} / 監修待ち: ${counts['awaiting-supervisor']} / blocked: ${counts.blocked} / 進行中: ${counts['in-progress']}`)
console.log(`サマリー: ${join(WORK, 'manifest-summary.md')}${existsSync(join(WORK, 'manifest-summary.md')) ? '' : '(未生成)'}`)
