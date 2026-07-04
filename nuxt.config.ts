import { SITE_NAME, SITE_DESCRIPTION, THEME_COLOR, TITLE_TEMPLATE } from './config/site'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
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
