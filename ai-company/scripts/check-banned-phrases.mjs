#!/usr/bin/env node
// check-banned-phrases.mjs — 禁止表現の機械検出
// 使い方: node scripts/check-banned-phrases.mjs <記事.md> [記事2.md ...]
// リスト: checklists/banned-phrases.md(# 行と空行を除く各行が検出パターン)
// 「※」を含む条件付きパターンは warning(人間判断)、それ以外は error として報告する

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const listPath = join(here, '..', 'checklists', 'banned-phrases.md')
const lines = readFileSync(listPath, 'utf8').split('\n')
const patterns = []
for (const raw of lines) {
  const line = raw.trim()
  if (!line || line.startsWith('#') || line.startsWith('>')) continue
  const conditional = line.includes('(※')
  const phrase = line.split('(※')[0].trim()
  if (phrase) patterns.push({ phrase, conditional })
}

const targets = process.argv.slice(2)
if (!targets.length) { console.error('使い方: node check-banned-phrases.mjs <記事.md> [...]'); process.exit(2) }

let errors = 0
for (const t of targets) {
  const text = readFileSync(t, 'utf8')
  const textLines = text.split('\n')
  for (const { phrase, conditional } of patterns) {
    textLines.forEach((l, i) => {
      if (l.includes(phrase)) {
        const tag = conditional ? 'WARN(条件付き — 人間判断)' : 'ERROR'
        if (!conditional) errors++
        console.log(`${tag} ${t}:${i + 1} 「${phrase}」`)
      }
    })
  }
}
if (!errors) console.log(`✓ 禁止表現(ERROR)ゼロ — 対象 ${targets.length} ファイル`)
process.exit(errors ? 1 : 0)
