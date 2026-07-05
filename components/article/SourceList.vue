<script setup lang="ts">
import type { ArticleSource } from '~/types/article'

/**
 * 出典ボックス(T6)— frontmatter の sources を表示する。
 * sources が空の記事はそもそも公開されない(utils/article.ts の公開ゲート)ため、
 * このコンポーネントは常に1件以上を前提としてよい。
 */
defineProps<{ sources: ArticleSource[] }>()
</script>

<template>
  <section class="mt-8">
    <h2 class="text-lg font-bold">出典・参考資料</h2>
    <ul class="mt-3 space-y-2 text-sm text-gray-700">
      <li v-for="(source, i) in sources" :key="i">
        <template v-if="source.url">
          <a :href="source.url" rel="noopener" target="_blank" class="text-brand-700 underline underline-offset-2">{{ source.name }}</a>
        </template>
        <template v-else>{{ source.name }}</template>
        <span v-if="source.publisher" class="text-gray-500">({{ source.publisher }})</span>
        <span class="ml-1 text-xs text-gray-400">最終確認日: {{ source.checkedAt }}</span>
      </li>
    </ul>
  </section>
</template>
