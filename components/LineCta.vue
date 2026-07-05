<script setup lang="ts">
import { LINE_ADD_URL } from '~/config/site'
import type { ResultType } from '~/types/shindan'

/**
 * LINE友だち追加CTA(07章 — aff-v1 から移植)。
 * URL は config/site.ts の LINE_ADD_URL(空文字なら何も表示しない)。
 * クリックは useAnalytics の line_click で計測する。
 */
interface Props {
  heading?: string
  label?: string
  note?: string
  /** 診断結果タイプ。指定すると LINE URL に ?type= を付与し、計測イベントにも含める */
  resultType?: ResultType
}
const props = withDefaults(defineProps<Props>(), {
  heading: '診断はここまで。次のステップへ',
  label: 'あなたに合う介護求人をLINEで無料で受け取る',
  note: '友だち追加は無料・LINEを閉じてもブロックはされません',
  resultType: undefined,
})

const { trackLineClick } = useAnalytics()

// resultType がある場合のみ ?type=xxx を付与(既存クエリの有無も考慮)
const finalHref = computed(() => {
  if (!LINE_ADD_URL) return null
  if (!props.resultType) return LINE_ADD_URL
  const sep = LINE_ADD_URL.includes('?') ? '&' : '?'
  return `${LINE_ADD_URL}${sep}type=${encodeURIComponent(props.resultType)}`
})

function onClick() {
  trackLineClick(props.resultType)
}
</script>

<template>
  <div v-if="finalHref" class="rounded-3xl border border-green-200 bg-green-50/70 p-5 text-center">
    <p class="text-sm font-semibold text-green-800">
      {{ heading }}
    </p>
    <a
      :href="finalHref"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#06C755] px-6 py-4 text-base font-bold text-white shadow-md transition hover:brightness-95 active:scale-[0.98]"
      @click="onClick"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">
        <path
          d="M12 2C6.477 2 2 5.79 2 10.45c0 4.18 3.49 7.69 8.21 8.36.32.07.75.21.86.49.1.25.06.65.03.91l-.14.84c-.04.25-.2.97.85.53 1.05-.44 5.66-3.33 7.72-5.71h-.01C20.97 14.34 22 12.51 22 10.45 22 5.79 17.52 2 12 2z"
        />
      </svg>
      <span>{{ label }}</span>
    </a>
    <p class="mt-3 text-xs text-green-900/70">{{ note }}</p>
  </div>
</template>
