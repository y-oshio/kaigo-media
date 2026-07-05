#!/usr/bin/env node
/**
 * content-lint — 記事 frontmatter の品質検査(設計書06章 §2-4+P3承認条件3)。
 *
 * サイト側の公開ゲート(utils/article.ts の publishBlockers — sources/checkedAt 必須)と
 * 同じ規則で content/ 配下の Markdown を検査し、加えて配置・スラッグ規則も見る:
 *   1. frontmatter 必須項目: title / description / cluster / targetQueries / publishedAt / sources
 *   2. sources は1件以上・全件に name と checkedAt(YYYY-MM-DD)
 *   3. cluster が配置ディレクトリと一致していること
 *   4. スラッグ規則: 小文字ローマ字 [a-z0-9-]+、予約語(config/routes.ts RESERVED_SLUGS)禁止
 *   5. 日付形式(publishedAt / updatedAt / reviewedAt / checkedAt = YYYY-MM-DD)
 *   6. 本文に /go/ リンク(アフィリエイト)を含む記事は prRelated: true 必須(ステマ規制ガード — 07章)
 *
 * ページ側ゲートは違反記事を404にする(公開されない)。このスクリプトは
 * 「なぜ公開されないか」をビルド前に人間へ知らせるためのもの。
 * 規則を変えるときは utils/article.ts と本ファイルの両方を更新すること。
 * 品質CIへの組み込み(監修必須クラスタ・カニバリ検知等)は実装#6=P5 で拡張する。
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, basename } from 'node:path'
import { parse as parseYaml } from 'yaml'

const ROOT = new URL('..', import.meta.url).pathname
const CONTENT_DIR = join(ROOT, 'content')

// config/routes.ts と同期(TS を直接 import できないため複製。変更時は両方を更新)
const CLUSTERS = ['shikaku', 'tenshoku', 'shisetsu', 'shokushu', 'kyuryo']
const RESERVED_SLUGS = ['pref', 'job', 'guide', 's', 'drill', 'shiken', 'tools']

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const SLUG_RE = /^[a-z0-9-]+$/

const errors = []
let fileCount = 0

function lintArticle(file, cluster) {
  const rel = relative(ROOT, file)
  fileCount++

  const slug = basename(file, '.md')
  if (!SLUG_RE.test(slug)) errors.push(`${rel}: スラッグ "${slug}" は小文字ローマ字 [a-z0-9-]+ にすること`)
  if (RESERVED_SLUGS.includes(slug)) errors.push(`${rel}: スラッグ "${slug}" は予約語のため使用禁止`)

  const raw = readFileSync(file, 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    errors.push(`${rel}: frontmatter(--- ブロック)がありません`)
    return
  }
  let fm
  try {
    fm = parseYaml(match[1])
  } catch (e) {
    errors.push(`${rel}: frontmatter が YAML としてパース不能 — ${e.message}`)
    return
  }

  for (const key of ['title', 'description']) {
    if (!fm?.[key] || typeof fm[key] !== 'string') errors.push(`${rel}: ${key} が必須です`)
  }
  if (fm?.cluster !== cluster) {
    errors.push(`${rel}: cluster "${fm?.cluster}" が配置ディレクトリ "${cluster}" と一致しません`)
  }
  if (!Array.isArray(fm?.targetQueries) || fm.targetQueries.length === 0) {
    errors.push(`${rel}: targetQueries(想定クエリ)を1件以上入れてください(カニバリ管理 — 06章)`)
  }

  for (const key of ['publishedAt', 'updatedAt', 'reviewedAt']) {
    if (fm?.[key] !== undefined && !DATE_RE.test(String(fm[key]))) {
      errors.push(`${rel}: ${key} は YYYY-MM-DD 形式にすること(現在: ${fm[key]})`)
    }
  }
  if (!fm?.publishedAt) errors.push(`${rel}: publishedAt が必須です`)

  // 公開ゲートの核心(P3承認条件3): 出典なし・確認日なしは公開不可
  if (!Array.isArray(fm?.sources) || fm.sources.length === 0) {
    errors.push(`${rel}: sources が1件もありません(出典のない記事は公開不可)`)
  } else {
    fm.sources.forEach((source, i) => {
      if (!source?.name) errors.push(`${rel}: sources[${i}] に name がありません`)
      if (!source?.checkedAt) {
        errors.push(`${rel}: sources[${i}] に checkedAt(確認日)がありません`)
      } else if (!DATE_RE.test(String(source.checkedAt))) {
        errors.push(`${rel}: sources[${i}].checkedAt は YYYY-MM-DD 形式にすること`)
      }
    })
  }

  if (fm?.prRelated !== undefined && typeof fm.prRelated !== 'boolean') {
    errors.push(`${rel}: prRelated は true / false のみ`)
  }

  // 本文に /go/ リンクがあるのに prRelated: true でない記事はPR表記が出ないまま広告を含むことになる
  const body = raw.slice(match[0].length)
  const hasGoLink = /\]\(\/go\/|href="\/go\/|https?:\/\/mamoribi\.jp\/go\//.test(body)
  if (hasGoLink && fm?.prRelated !== true) {
    errors.push(`${rel}: 本文に /go/ リンクがあるため prRelated: true が必須です(PR表記の自動表示 — 07章)`)
  }
}

for (const cluster of CLUSTERS) {
  const dir = join(CONTENT_DIR, cluster)
  if (!existsSync(dir)) continue
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      errors.push(`${relative(ROOT, p)}: content/<cluster>/ 直下にサブディレクトリは作らない(03章 §2)`)
    } else if (name.endsWith('.md')) {
      lintArticle(p, cluster)
    }
  }
}

if (errors.length > 0) {
  console.error(`content-lint: NG(${errors.length}件)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`content-lint: OK(記事 ${fileCount}件を検査)`)
