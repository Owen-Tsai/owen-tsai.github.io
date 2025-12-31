import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        date: z.string(),
        tags: z.array(z.string()),
        cover: z.string(),
      }),
    }),
    work: defineCollection({
      type: 'page',
      source: 'work/*.md',
      schema: z.object({
        title: z.string(),
        entry: z.string(),
        idx: z.number(),
      }),
    }),
  },
})
