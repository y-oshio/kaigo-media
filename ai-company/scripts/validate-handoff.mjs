#!/usr/bin/env node
// validate-handoff.mjs — Agent間ハンドオフJSONをスキーマ検証する(依存ゼロの簡易バリデータ)
// 使い方: node scripts/validate-handoff.mjs <schemas/xxx.schema.json> <対象.json> [対象2.json ...]
// 対応: type / required / properties / items / enum / pattern / minimum / maximum /
//       minItems / maxItems / minLength / maxLength / additionalProperties(boolean)
// ※ ajv 導入後はこのスクリプトを置き換えてよい(スキーマは draft-07 準拠で書いてある)

import { readFileSync } from 'node:fs'

function validate(schema, data, path = '$') {
  const errors = []
  const push = (msg) => errors.push(`${path}: ${msg}`)

  if (schema.enum && !schema.enum.includes(data)) push(`enum違反(${JSON.stringify(data)})`)

  if (schema.type) {
    const t = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data
    const expected = schema.type === 'integer' ? 'number' : schema.type
    if (t !== expected) { push(`type違反: ${schema.type} 期待、実際 ${t}`); return errors }
    if (schema.type === 'integer' && !Number.isInteger(data)) push('integer 期待')
  }

  if (typeof data === 'string') {
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) push(`pattern違反: ${schema.pattern}`)
    if (schema.minLength != null && data.length < schema.minLength) push(`minLength ${schema.minLength} 未満`)
    if (schema.maxLength != null && data.length > schema.maxLength) push(`maxLength ${schema.maxLength} 超過`)
  }
  if (typeof data === 'number') {
    if (schema.minimum != null && data < schema.minimum) push(`minimum ${schema.minimum} 未満`)
    if (schema.maximum != null && data > schema.maximum) push(`maximum ${schema.maximum} 超過`)
  }
  if (Array.isArray(data)) {
    if (schema.minItems != null && data.length < schema.minItems) push(`minItems ${schema.minItems} 未満`)
    if (schema.maxItems != null && data.length > schema.maxItems) push(`maxItems ${schema.maxItems} 超過`)
    if (schema.items) data.forEach((v, i) => errors.push(...validate(schema.items, v, `${path}[${i}]`)))
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const req of schema.required || []) {
      if (!(req in data)) push(`必須フィールド欠落: ${req}`)
    }
    for (const [k, v] of Object.entries(data)) {
      if (schema.properties && schema.properties[k]) {
        errors.push(...validate(schema.properties[k], v, `${path}.${k}`))
      } else if (schema.additionalProperties === false && schema.properties) {
        push(`未定義フィールド: ${k}`)
      }
    }
    // allOf/if-then は factcheck-report のみで使用 — verified 時の必須チェックを特別処理
    for (const rule of schema.allOf || []) {
      if (rule.if && rule.then) {
        const cond = Object.entries(rule.if.properties || {}).every(([k, s]) => s.const !== undefined && data[k] === s.const)
        if (cond) for (const req of rule.then.required || []) {
          if (!(req in data)) push(`条件付き必須フィールド欠落: ${req}(${JSON.stringify(rule.if.properties)} のため)`)
        }
      }
    }
  }
  return errors
}

const [schemaPath, ...targets] = process.argv.slice(2)
if (!schemaPath || targets.length === 0) {
  console.error('使い方: node validate-handoff.mjs <schema.json> <対象.json> [...]')
  process.exit(2)
}
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
let failed = 0
for (const t of targets) {
  try {
    const data = JSON.parse(readFileSync(t, 'utf8'))
    const errs = validate(schema, data)
    if (errs.length) { failed++; console.error(`✗ ${t}\n  ${errs.join('\n  ')}`) }
    else console.log(`✓ ${t}`)
  } catch (e) {
    failed++; console.error(`✗ ${t}: 読み込み/パース失敗 — ${e.message}`)
  }
}
process.exit(failed ? 1 : 0)
