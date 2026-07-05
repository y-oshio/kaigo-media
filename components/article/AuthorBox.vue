<script setup lang="ts">
import { authors } from '~/data/authors'

/**
 * 監修者・執筆者ボックス(T6 記事テンプレートの構成要素 — 03章 §4)。
 * data/authors.ts に実在の登録があるときだけ人物を表示する(架空の監修者表示は禁止 — 04章)。
 * id が未設定・未登録の間は「準備中」と正直に表示する(P3承認条件4)。
 */
const props = defineProps<{
  authorId?: string
  supervisorId?: string
  reviewedAt?: string
}>()

const author = computed(() => authors.find((a) => a.id === props.authorId))
const supervisor = computed(() => authors.find((a) => a.id === props.supervisorId && a.role === 'supervisor'))
</script>

<template>
  <aside class="card mt-8">
    <template v-if="supervisor">
      <div class="flex items-start gap-3">
        <div>
          <p class="text-xs font-bold text-gray-500">監修者</p>
          <p class="mt-0.5 font-bold text-gray-800">
            <NuxtLink :to="`/supervisor/${supervisor.slug}/`" class="underline-offset-2 hover:underline">
              {{ supervisor.name }}
            </NuxtLink>
          </p>
          <p class="mt-0.5 text-xs text-gray-500">{{ supervisor.credentials.join(' / ') }}</p>
          <p v-if="reviewedAt" class="mt-0.5 text-xs text-gray-400">監修日: {{ reviewedAt }}</p>
        </div>
      </div>
    </template>
    <div v-if="author" class="mt-3 border-t border-gray-50 pt-3 first:mt-0 first:border-0 first:pt-0">
      <p class="text-xs font-bold text-gray-500">執筆</p>
      <p class="mt-0.5 text-sm text-gray-700">{{ author.name }}</p>
    </div>
    <div v-if="!supervisor && !author">
      <p class="text-xs font-bold text-gray-500">執筆・監修</p>
      <p class="mt-1 text-sm text-gray-600">
        準備中 — 執筆・監修体制は現在整備中です。整い次第、実名・資格とあわせて掲載します。
      </p>
    </div>
  </aside>
</template>
