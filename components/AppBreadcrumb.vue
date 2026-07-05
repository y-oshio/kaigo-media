<script setup lang="ts">
import { SITE_URL } from '~/config/site'

/**
 * パンくず+BreadcrumbList JSON-LD(設計書05章 §2)。
 * items は先頭=ホーム、末尾=現在ページ(path なし)で渡す。
 */
const props = defineProps<{
  items: { name: string; path?: string }[]
}>()

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: props.items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
        })),
      }),
    },
  ],
})
</script>

<template>
  <nav aria-label="パンくずリスト" class="text-xs text-gray-500">
    <ol class="flex flex-wrap items-center gap-1">
      <li v-for="(item, i) in items" :key="item.name" class="flex items-center gap-1">
        <NuxtLink v-if="item.path" :to="item.path" class="underline-offset-2 hover:underline">
          {{ item.name }}
        </NuxtLink>
        <span v-else aria-current="page" class="text-gray-700">{{ item.name }}</span>
        <span v-if="i < items.length - 1" aria-hidden="true">›</span>
      </li>
    </ol>
  </nav>
</template>
