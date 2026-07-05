/**
 * GA4 計測プラグイン(設計書05章・実装#5=P4)。
 * NUXT_PUBLIC_GA_ID(runtimeConfig.public.gaId)が設定されているときだけ gtag を読み込む。
 * 未設定なら何も読み込まない(プライバシーポリシーの「利用する場合があります」と整合)。
 * script タグはSSRでも出力する(ユニバーサルプラグイン)。dataLayer 初期化はクライアントのみ。
 * イベント送信は composables/useAnalytics.ts の trackEvent() を使うこと(直接 gtag を呼ばない)。
 */
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin(() => {
  const gaId = useRuntimeConfig().public.gaId
  if (!gaId) return

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
        async: true,
      },
    ],
  })

  if (import.meta.server) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  // 初期ロードの page_view は config が自動送信。SPA遷移は router.afterEach で送る
  window.gtag('config', gaId)

  const router = useRouter()
  router.afterEach((to) => {
    window.gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_title: document.title,
    })
  })
})
