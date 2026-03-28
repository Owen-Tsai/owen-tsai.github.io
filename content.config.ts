import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    writing: defineCollection({
      type: 'page',
      source: 'writing/*.md',
      schema: z.object({
        date: z.string(),
        tags: z.array(z.string()),
        intro: z.string().optional(),
      }),
    }),
  },
})
