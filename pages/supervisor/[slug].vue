<script setup lang="ts">
import { authors } from '~/data/authors'
import { SITE_URL } from '~/config/site'

/**
 * T8: 監修者ページ /supervisor/<slug>/(03章 §4)。
 * data/authors.ts が空の間はどのURLも404(=SSGでページ生成されない)。
 * 実在の監修者が登録され次第、Person JSON-LD つきで公開される。
 */
const route = useRoute()
const supervisor = authors.find((a) => a.slug === route.params.slug && a.role === 'supervisor')

if (!supervisor) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}

useSeoMeta({
  title: `監修者 ${supervisor.name}`,
  description: `${supervisor.name}(${supervisor.credentials.join('・')})のプロフィール。当サイトで監修している記事の一覧。`,
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: supervisor.name,
        url: `${SITE_URL}/supervisor/${supervisor.slug}/`,
        jobTitle: supervisor.credentials.join('・'),
        ...(supervisor.sameAs?.length ? { sameAs: supervisor.sameAs } : {}),
      }),
    },
  ],
})
</script>

<template>
  <main class="container-article py-10">
    <AppBreadcrumb
      :items="[{ name: 'ホーム', path: '/' }, { name: `監修者 ${supervisor.name}` }]"
    />
    <h1 class="mt-4 text-2xl font-bold">{{ supervisor.name }}</h1>
    <p class="mt-2 text-sm text-gray-500">{{ supervisor.credentials.join(' / ') }}</p>
    <p v-if="supervisor.experienceYears" class="mt-1 text-sm text-gray-500">
      実務経験 {{ supervisor.experienceYears }}年
    </p>

    <section class="mt-8">
      <h2 class="text-lg font-bold">プロフィール</h2>
      <p class="mt-3 leading-relaxed text-gray-700">{{ supervisor.bio }}</p>
    </section>

    <section v-if="supervisor.sameAs?.length" class="mt-8">
      <h2 class="text-lg font-bold">外部リンク</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5">
        <li v-for="url in supervisor.sameAs" :key="url">
          <a :href="url" rel="noopener" target="_blank" class="text-sm text-brand-700 underline underline-offset-2">
            {{ url }}
          </a>
        </li>
      </ul>
    </section>
  </main>
</template>
