<script setup lang="ts">
import { questions } from '~/data/shindan/questions'

/**
 * 診断の質問フロー /shindan/start/(03章 T7)。
 * 診断途中ページのため noindex(05章 §3)。回答は ref のみで永続化しない。
 */
useSeoMeta({
  title: '診断スタート|介護タイプ診断',
  description: '15問の質問に答えて、あなたに向いている介護施設・働き方タイプを診断します。',
  robots: 'noindex',
})

const total = questions.length
const currentIndex = ref(0)
const answers = ref<(number | null)[]>(Array(total).fill(null))

const { trackDiagnosisStart, trackDiagnosisComplete } = useAnalytics()

// 質問フローの表示 = 診断開始
onMounted(() => {
  trackDiagnosisStart()
})

const currentQuestion = computed(() => questions[currentIndex.value])
const currentAnswer = computed({
  get: () => answers.value[currentIndex.value],
  set: (v: number | null) => {
    answers.value[currentIndex.value] = v
  },
})
const canGoNext = computed(() => answers.value[currentIndex.value] !== null)
const isLast = computed(() => currentIndex.value === total - 1)

function goBack() {
  if (currentIndex.value === 0) return
  currentIndex.value -= 1
}

async function goNext() {
  if (!canGoNext.value) return
  if (isLast.value) {
    const finalAnswers = answers.value as number[]
    const type = diagnose(questions, finalAnswers)
    trackDiagnosisComplete(type)
    await navigateTo(`/shindan/result/${type}/`)
    return
  }
  currentIndex.value += 1
}
</script>

<template>
  <main class="container-narrow space-y-5 py-10">
    <ShindanProgressBar :current="currentIndex + 1" :total="total" />

    <ShindanQuestionCard v-model="currentAnswer" :question="currentQuestion" />

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="btn-ghost flex-1"
        :disabled="currentIndex === 0"
        :class="{ 'cursor-not-allowed opacity-40': currentIndex === 0 }"
        @click="goBack"
      >
        ← 戻る
      </button>
      <button
        type="button"
        class="btn-primary flex-[2]"
        :disabled="!canGoNext"
        @click="goNext"
      >
        {{ isLast ? '診断結果を見る' : '次へ →' }}
      </button>
    </div>

    <p v-if="!canGoNext" class="text-center text-xs text-gray-400">
      回答を選ぶと次へ進めます
    </p>

    <p class="text-center">
      <NuxtLink to="/shindan/" class="text-xs text-gray-400 underline-offset-2 hover:underline">
        診断の説明にもどる
      </NuxtLink>
    </p>
  </main>
</template>
