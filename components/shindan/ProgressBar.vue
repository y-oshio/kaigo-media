<script setup lang="ts">
/** 診断の進捗バー(aff-v1 から移植 — 03章 T7) */
interface Props {
  current: number
  total: number
}
const props = defineProps<Props>()
const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.min(100, Math.round((props.current / props.total) * 100))
})
</script>

<template>
  <div>
    <div class="flex items-end justify-between text-xs text-gray-500">
      <span>質問 {{ current }} / {{ total }}</span>
      <span>{{ percent }}%</span>
    </div>
    <div
      class="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100"
      role="progressbar"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="percent"
    >
      <div
        class="h-full rounded-full bg-brand-500 transition-all duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
