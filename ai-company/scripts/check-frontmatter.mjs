#!/usr/bin/env node
// check-frontmatter.mjs — 記事frontmatterの必須項目・整合性チェック(publish-gate D7)
// 使い方: node scripts/check-frontmatter.mjs <記事.md> [記事2.md ...]
// 検査: 必須項目 / 監修必須クラスタの supervisorId / prRelated とアフィリンクの整合 /
//       sources の3点セット(name/url/checkedAt)/ 残存【要出典】マーカー

import { readFileSync } from 'node:fs'

const REQUIRED = ['title', 'description', 'cluster', 'targetQueries', 'authorId', 'publishedAt', 'prRelated']
const SUPERVISOR_CLUSTERS = ['kyuryo', 'shikaku'] // 給料・資格は監修必須(本文内容による追加判定は eeat-reviewer)

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const fm = {}
  let currentKey = null
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z][a-zA-Z0-9]*):\s*(.*)$/)
    if (kv) { currentKey = kv[1]; fm[currentKey] = kv[2].trim() }
    else if (/^\s+-\s/.test(line) && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = []
      fm[currentKey].push(line.replace(/^\s+-\s*/, '').trim())
    }
  }
  return fm
}

const targets = process.argv.slice(2)
if (!targets.length) { console.error('使い方: node check-frontmatter.mjs <記事.md> [...]'); process.exit(2) }

let failed = 0
for (const t of targets) {
  const text = readFileSync(t, 'utf8')
  const errs = []
  const fm = parseFrontmatter(text)
  if (!fm) { console.error(`✗ ${t}: frontmatter がありません`); failed++; continue }

  for (const k of REQUIRED) {
    if (!(k in fm) || fm[k] === '' || fm[k] === '""') errs.push(`必須項目が空: ${k}`)
  }
  if (SUPERVISOR_CLUSTERS.includes(String(fm.cluster)) && (!fm.supervisorId || fm.supervisorId === '""')) {
    errs.push(`監修必須クラスタ(${fm.cluster})なのに supervisorId が空`)
  }
  const hasAffLink = /::affiliate-link|\/go\//.test(text)
  const prRelated = String(fm.prRelated) === 'true'
  if (hasAffLink && !prRelated) errs.push('アフィリンクがあるのに prRelated: true でない(ステマ規制)')
  if (!hasAffLink && prRelated) errs.push('prRelated: true なのにアフィリンクがない(表記と実体の不一致)')
  if (/【要出典/.test(text)) errs.push('【要出典】マーカーが残存(fact-checker 未完了)')
  const sourceLines = text.match(/^\s*-\s*\{\s*name:/gm) || []
  if (/[0-9]+(円|%|倍)/.test(text.replace(/^---[\s\S]*?---/, '')) && sourceLines.length === 0 && !/sources:\s*\[.+\]/.test(text)) {
    errs.push('数値主張があるのに sources が空の可能性(要目視確認)')
  }

  if (errs.length) { failed++; console.error(`✗ ${t}\n  ${errs.join('\n  ')}`) }
  else console.log(`✓ ${t}`)
}
process.exit(failed ? 1 : 0)
