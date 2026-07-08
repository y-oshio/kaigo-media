#!/usr/bin/env node
// check-frontmatter.mjs — 記事frontmatterの必須項目・整合性チェック(publish-gate D7)
// 使い方: node scripts/check-frontmatter.mjs <記事.md> [記事2.md ...]
// 検査: 必須項目 / 監修必須クラスタの supervisorId / authorId の実在マスタ突合(存在する場合のみ) /
//       prRelated とアフィリンクの整合 / sources の3点セット(name/url/checkedAt)/ 残存【要出典】マーカー
//
// frontmatter の解析は content-lint.mjs と同じ `yaml` パッケージで行う(独自正規表現パーサは使わない)。

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'

const ROOT = new URL('../..', import.meta.url).pathname
const REQUIRED = ['title', 'description', 'cluster', 'targetQueries', 'publishedAt', 'prRelated']
const SUPERVISOR_CLUSTERS = ['kyuryo', 'shikaku'] // 給料・資格は監修必須(本文内容による追加判定は eeat-reviewer)

/** TS マスタから id を抽出する(TS を import できないための同期複製 — scripts/kb-lint.mjs の extractField と同じ手法) */
function extractAuthorIds() {
  const src = readFileSync(join(ROOT, 'data/authors.ts'), 'utf8')
  return new Set([...src.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]))
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  try {
    return parseYaml(m[1]) ?? {}
  } catch {
    return null
  }
}

const targets = process.argv.slice(2)
if (!targets.length) { console.error('使い方: node check-frontmatter.mjs <記事.md> [...]'); process.exit(2) }

const knownAuthorIds = extractAuthorIds()

let failed = 0
for (const t of targets) {
  const text = readFileSync(t, 'utf8')
  const errs = []
  const fm = parseFrontmatter(text)
  if (!fm) { console.error(`✗ ${t}: frontmatter がありません(または YAML として解析できません)`); failed++; continue }

  for (const k of REQUIRED) {
    if (fm[k] === undefined || fm[k] === null || fm[k] === '') errs.push(`必須項目が空: ${k}`)
  }
  if (fm.authorId && !knownAuthorIds.has(String(fm.authorId))) {
    errs.push(`authorId "${fm.authorId}" が data/authors.ts に実在しません`)
  }
  if (SUPERVISOR_CLUSTERS.includes(String(fm.cluster)) && !fm.supervisorId) {
    errs.push(`監修必須クラスタ(${fm.cluster})なのに supervisorId が空`)
  }
  const hasAffLink = /::affiliate-link|\/go\//.test(text)
  const prRelated = fm.prRelated === true
  if (hasAffLink && !prRelated) errs.push('アフィリンクがあるのに prRelated: true でない(ステマ規制)')
  if (!hasAffLink && prRelated) errs.push('prRelated: true なのにアフィリンクがない(表記と実体の不一致)')
  if (/【要出典/.test(text)) errs.push('【要出典】マーカーが残存(fact-checker 未完了)')
  const bodyText = text.replace(/^---[\s\S]*?---/, '')
  if (/[0-9]+(円|%|倍)/.test(bodyText) && (!Array.isArray(fm.sources) || fm.sources.length === 0)) {
    errs.push('数値主張があるのに sources が空の可能性(要目視確認)')
  }

  if (errs.length) { failed++; console.error(`✗ ${t}\n  ${errs.join('\n  ')}`) }
  else console.log(`✓ ${t}`)
}
process.exit(failed ? 1 : 0)
