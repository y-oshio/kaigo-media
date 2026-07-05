import type { ResultType } from '~/types/shindan'

/**
 * GA4 イベント送信の唯一の入口(実装#5=P4、診断イベントは実装#6=P7)。
 * GA未設定・SSR中は何もしない no-op になるため、呼び出し側は分岐不要。
 *
 * イベント命名規約(07章 §「計測イベント」): スネークケース。
 *   - cta_click        { cluster, cta_slug }                                  … 記事CTA枠のクリック
 *   - affiliate_click  { affiliate_slug, position?, result_type?, cluster? }  … /go/ リンクのクリック
 *   - line_click       { result_type? }                                       … LINE友だち追加のクリック
 *   - diagnosis_start  {}                                                     … 診断開始(質問フロー表示)
 *   - diagnosis_complete { result_type }                                      … 診断完了
 *   (ドリル回答イベント等は P8 で追加)
 */
export function useAnalytics() {
  const gaId = useRuntimeConfig().public.gaId

  function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
    if (!gaId || import.meta.server) return
    if (typeof window.gtag !== 'function') return
    window.gtag('event', name, params ?? {})
  }

  /** 診断開始(質問フローの表示時に1回) */
  function trackDiagnosisStart() {
    trackEvent('diagnosis_start')
  }

  /** 診断完了(結果タイプ確定時) */
  function trackDiagnosisComplete(resultType: ResultType) {
    trackEvent('diagnosis_complete', { result_type: resultType })
  }

  /** LINE友だち追加CTAのクリック */
  function trackLineClick(resultType?: ResultType) {
    trackEvent('line_click', resultType ? { result_type: resultType } : {})
  }

  /**
   * アフィリエイトリンク(/go/<slug>)のクリック。
   * サーバー側302では gtag が動かないため、遷移前にクライアントで送る。
   */
  function trackAffiliateClick(
    slug: string,
    opts: { position?: string; resultType?: ResultType; cluster?: string } = {},
  ) {
    trackEvent('affiliate_click', {
      affiliate_slug: slug,
      ...(opts.position ? { position: opts.position } : {}),
      ...(opts.resultType ? { result_type: opts.resultType } : {}),
      ...(opts.cluster ? { cluster: opts.cluster } : {}),
    })
  }

  return {
    trackEvent,
    trackDiagnosisStart,
    trackDiagnosisComplete,
    trackLineClick,
    trackAffiliateClick,
  }
}
