import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { CONTENT_CLUSTERS } from './config/routes'

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式')

/** 出典 — publishBlockers(utils/article.ts)と同じ必須性を型で表現(L1はあくまで utils 側) */
const articleSource = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  publisher: z.string().optional(),
  checkedAt: DATE, // 公開ゲートの核心 — 型レベルでも必須
})

export default defineContentConfig({
  collections: {
    articles: defineCollection({
      type: 'page',
      // README.md 等を拾わないようクラスタ直下の md のみに限定(03章 §2 と一致)。
      // 47章はブレース展開グロブ('{shikaku,...}/*.md')を1本の文字列で指定していたが、
      // 実際のv3(3.15.0)ではファイル監視の解決でENOENTになり機能しなかった(実機確認)。
      // クラスタごとの include を配列で指定する形に修正(意図・スコープは同一)。
      source: CONTENT_CLUSTERS.map((cluster) => ({ include: `${cluster}/*.md` })),
      schema: z.object({
        // title / description は type:'page' の組み込み。以下は独自 frontmatter
        cluster: z.enum(CONTENT_CLUSTERS),
        targetQueries: z.array(z.string()).min(1),
        authorId: z.string().optional(),
        supervisorId: z.string().optional(),
        reviewedAt: DATE.optional(),
        publishedAt: DATE,
        updatedAt: DATE.optional(),
        sources: z.array(articleSource).min(1),
        prRelated: z.boolean().optional(),
      }),
    }),
  },
})
