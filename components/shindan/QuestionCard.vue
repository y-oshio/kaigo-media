<script setup lang="ts">
import type { Question } from '~/types/shindan'

/** 質問カード(aff-v1 から移植 — 03章 T7)。選択肢はタップで即選択 */
interface Props {
  question: Question
  modelValue: number | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function select(index: number) {
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="card">
    <h2 class="text-lg font-bold leading-snug text-gray-800">
      Q{{ question.id }}. {{ question.text }}
    </h2>
    <ul class="mt-4 space-y-3">
      <li v-for="(choice, i) in question.choices" :key="i">
        <button
          type="button"
          class="block w-full rounded-2xl border px-4 py-4 text-left text-sm leading-relaxed transition"
          :class="
            props.modelValue === i
              ? 'border-brand-600 bg-brand-50 text-brand-800 shadow-sm'
              : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/40'
          "
          @click="select(i)"
        >
          <span class="flex items-start gap-3">
            <span
              class="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border"
              :class="
                props.modelValue === i
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-gray-300 bg-white text-transparent'
              "
            >
              <svg
                v-if="props.modelValue === i"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            <span>{{ choice.label }}</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
