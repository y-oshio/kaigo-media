/**
 * GA4 イベント送信の唯一の入口(実装#5=P4)。
 * GA未設定・SSR中は何もしない no-op になるため、呼び出し側は分岐不要。
 *
 * イベント命名規約(05章 §4): スネークケース。
 *   - cta_click  { cluster, cta_slug }   … CTA枠のクリック
 *   - go_click   { go_slug }             … /go/ リンクのクリック
 *   (ドリル回答イベント等は P8 で追加)
 */
export function useAnalytics() {
  const gaId = useRuntimeConfig().public.gaId

  function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
    if (!gaId || import.meta.server) return
    if (typeof window.gtag !== 'function') return
    window.gtag('event', name, params ?? {})
  }

  return { trackEvent }
}
