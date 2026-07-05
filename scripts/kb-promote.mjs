#!/usr/bin/env node
/**
 * KBレコードの status 昇格ツール(V3 32章 — 昇格は人間のみが実行する)。
 * AI・ビルドスクリプトはレコードを 'draft' でしか生成しない。データの diff を
 * レビューした人間が本スクリプトで verified / published へ昇格させる。
 *
 * 使い方:
 *   node scripts/kb-promote.mjs data/kyuryo/salary-chingin-kouzou-r7.json verified
 *   node scripts/kb-promote.mjs <JSONファイル> <verified|published> [--from draft]
 *
 * 対象は JSON データセットのみ(TS マスタは人間が直接編集する)。
 * 昇格後は npm run kb-lint / verify:kyuryo で整合を確認すること。
 */

import { readFileSync, writeFileSync } from 'node:fs'

const [file, to, ...rest] = process.argv.slice(2)
const ALLOWED_TO = new Set(['verified', 'published'])
if (!file || !ALLOWED_TO.has(to)) {
  console.error('使い方: node scripts/kb-promote.mjs <JSONファイル> <verified|published> [--from draft]')
  process.exit(1)
}
const fromIdx = rest.indexOf('--from')
const from = fromIdx >= 0 ? rest[fromIdx + 1] : 'draft'

const records = JSON.parse(readFileSync(file, 'utf8'))
if (!Array.isArray(records)) {
  console.error(`${file}: レコード配列のJSONではありません`)
  process.exit(1)
}
let changed = 0
for (const rec of records) {
  if (rec.status === from) {
    rec.status = to
    changed++
  }
}
writeFileSync(file, JSON.stringify(records, null, 2) + '\n')
console.log(`kb-promote: ${file} — ${from}→${to} ${changed}件(全${records.length}件)`)
if (changed === 0) console.log('  (対象なし。--from で現在の status を指定できます)')
