/**
 * GA4 計測プラグイン(設計書05章・実装#5=P4)。
 * NUXT_PUBLIC_GA_ID(runtimeConfig.public.gaId)が設定されているときだけ gtag を読み込む。
 * 未設定なら何も読み込まない(プライバシーポリシーの「利用する場合があります」と整合)。
 * dataLayer初期化・gtag('config',...)は inline script としてSSR HTMLに出力する
 * (クライアントJSでの実行はNuxtのハイドレーション完了に暗黙依存し、初回ヒット0件の
 * 原因になっていたため、公式gtag.jsスニペットどおりinline scriptに変更した)。
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
      {
        innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(gaId)},{send_page_view:false});`,
      },
    ],
  })

  if (import.meta.server) return

  function sendPageView(path: string) {
    // unheadによるtitle反映は非同期のため、nextTick後に document.title を読む
    nextTick(() => {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
      })
    })
  }

  const router = useRouter()
  const initialPath = router.currentRoute.value.fullPath
  sendPageView(initialPath)

  // afterEachは環境によって初回ナビゲーションでも発火するため、最初の1回かつ
  // 初回送信済みpathと一致する場合のみスキップして二重送信を防ぐ
  // (無条件に最初の1回をスキップすると、afterEachが初回では発火しない環境で
  // ユーザーの最初の実遷移を握りつぶしてしまうため、path一致も条件に加える)
  let afterEachCallCount = 0
  router.afterEach((to) => {
    afterEachCallCount++
    if (afterEachCallCount === 1 && to.fullPath === initialPath) return
    sendPageView(to.fullPath)
  })
})
