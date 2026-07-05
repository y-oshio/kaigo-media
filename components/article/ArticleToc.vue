<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

/** 目次(T6)— 本文のH2/H3から自動生成された TOC を表示する。見出しが1件以下なら出さない */
const props = defineProps<{ links: TocLink[] }>()
const show = computed(() => props.links.length >= 2)
</script>

<template>
  <nav v-if="show" aria-label="目次" class="card mt-6">
    <p class="text-sm font-bold text-gray-700">目次</p>
    <ol class="mt-2 space-y-1 text-sm">
      <li v-for="link in links" :key="link.id">
        <a :href="`#${link.id}`" class="text-brand-700 underline-offset-2 hover:underline">{{ link.text }}</a>
        <ol v-if="link.children?.length" class="mt-1 space-y-1 pl-4">
          <li v-for="child in link.children" :key="child.id">
            <a :href="`#${child.id}`" class="text-gray-600 underline-offset-2 hover:underline">{{ child.text }}</a>
          </li>
        </ol>
      </li>
    </ol>
  </nav>
</template>
