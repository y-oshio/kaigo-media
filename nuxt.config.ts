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
    // 記事URL(公開ゲート通過分のみ)は server/api/__sitemap__/urls.ts が返す
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
        { name: 'twitter:card', content: 'summary_large_image' },
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
})
