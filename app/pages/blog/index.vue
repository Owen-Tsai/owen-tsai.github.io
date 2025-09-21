<template>
  <div class="pb-12 relative">
    <div class="px-8">
      <div
        v-for="([year, posts], _idx) in processedData"
        :key="_idx"
        class="my-6 border-t border-t-neutral-800"
      >
        <div class="flex flex-col md:grid md:grid-cols-4 gap-6 my-6">
          <div class="text-5xl font-thin">
            <h2 class="sticky top-16">{{ year }}</h2>
          </div>
          <div class="grid md:grid-cols-subgrid col-start-2 col-end-5 gap-6">
            <NuxtLink v-for="post in posts" :key="post.id" :to="post.path" class="group">
              <div
                class="aspect-[16/10] rounded-lg border border-neutral-800 relative after:absolute after:left-0 after:top-0 after:w-full after:h-full after:bg-transparent group-hover:opacity-80"
              >
                <NuxtImg
                  v-if="post.cover"
                  :src="`/cover/${post.cover}`"
                  class="w-full h-full rounded-lg"
                />
              </div>
              <div class="text-lg font-bold mt-4 group-hover:text-neutral-400">
                {{ post.title }}
              </div>
              <div class="text-neutral-500 mt-1">
                {{ post.tags.join(' / ') }}
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'

const { data } = await useAsyncData(() => {
  return queryCollection('blog')
    .select('title', 'date', 'path', 'id', 'tags', 'cover')
    .order('date', 'DESC')
    .all()
})

const processedData = computed(() => {
  if (!data.value) return []
  const ret: Map<
    string,
    Pick<BlogCollectionItem, 'title' | 'date' | 'path' | 'id' | 'tags' | 'cover'>[]
  > = new Map()
  data.value.forEach((post) => {
    const year = post.date.split('-')[0] || ''
    if (ret.has(year)) {
      ret.get(year)!.push(post)
    } else {
      ret.set(year, [post])
    }
  })
  return ret
})
</script>
