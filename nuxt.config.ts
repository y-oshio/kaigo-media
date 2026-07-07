import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, THEME_COLOR, TITLE_TEMPLATE } from './config/site'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@nuxtjs/sitemap'],
  css: ['~/assets/css/main.css'],
  // @nuxtjs/sitemap が canonical なURL生成に使う(末尾スラッシュ統一 — 03章 §2)
  site: {
    url: SITE_URL,
    name: SITE_NAME,
    trailingSlash: true,
  },
  content: {
    // 日本語見出しへのアンカーリンク自動付与は使わない(見た目のノイズ回避。TOC は ArticleToc で表示)
    markdown: {
      anchorLinks: false,
    },
  },
  sitemap: {
    // 掲載URLの唯一の源泉は server/api/__sitemap__/urls.ts(P6=実装#7 で一本化)。
    // pages/ からの自動収集は無効化する — 静的ページ(/kyuryo/ 等)が公開ゲートを
    // 素通りして混入するのを防ぐため(exclude はカスタムソースにも効くので使えない)。
    // 固定ページを増やしたら urls.ts の STATIC_PAGES に追加すること。
    excludeAppSources: true,
    sources: ['/api/__sitemap__/urls'],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      titleTemplate: TITLE_TEMPLATE,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: SITE_DESCRIPTION },
        { name: 'theme-color', content: THEME_COLOR },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:locale', content: 'ja_JP' },
        { property: 'og:image', content: `${SITE_URL}/og-default.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${SITE_URL}/og-default.png` },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  runtimeConfig: {
    public: {
      // GA4 測定ID。空なら GA を読み込まない(計測基盤は実装#4 で導入)。
      // 環境変数 NUXT_PUBLIC_GA_ID で上書き可能。
      gaId: '',
    },
  },
  typescript: {
    strict: true,
  },
  nitro: {
    preset: 'vercel',
  },
  // ISR(cache-until-redeploy)— コンテンツは全てビルド時確定のため動的レンダリング不要(41章 §1)
  // 注: /sitemap.xml への個別isr指定は入れない — @nuxtjs/sitemapモジュールがsetup時に
  // routeRules['/sitemap.xml'] を{}で上書きするため実質無効(死んだ設定になる)。
  // 現構成(zeroRuntime未使用)では上書き後も /** の isr:true を継承する。
  // sitemapはビルド時確定データから生成されるため、この継承で実害はない。
  routeRules: {
    '/**': { isr: true },
    '/go/**': { isr: false }, // アフィリエイト302は都度実行(計測・リンク差し替え即時性)
    '/api/**': { isr: false }, // sitemapソース等、ライブクエリ
  },
})
