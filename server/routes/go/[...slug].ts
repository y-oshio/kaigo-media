import { defineEventHandler, getRouterParam, sendRedirect, setHeader, createError } from 'h3'
import { affiliateLinks } from '~~/data/affiliate-links'

/**
 * /go/<slug>/ アフィリエイトリダイレクタ(設計書05章 §3・実装#5=P4)。
 * - data/affiliate-links.ts に登録済みかつ active な案件のみ 302
 * - 未登録・inactive は 404(案件データは実契約があるまで空 — 架空案件の登録禁止)
 * - インデックス制御は robots.txt の Disallow のみ(05章 §3: Disallow されたURLの
 *   noindex ヘッダはクローラに読まれず矛盾するため付けない。本命はリンク側の rel="sponsored")
 */
export default defineEventHandler((event) => {
  const raw = getRouterParam(event, 'slug') ?? ''
  const slug = raw.replace(/\/+$/, '') // 末尾スラッシュ許容(/go/<slug>/ が正規形)

  const link = slug && !slug.includes('/')
    ? affiliateLinks.find((l) => l.slug === slug && l.active)
    : undefined

  if (!link) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  setHeader(event, 'Cache-Control', 'no-store')
  return sendRedirect(event, link.url, 302)
})
