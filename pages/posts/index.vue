<template>
  <article class="prose prose-neutral dark:prose-invert">
    <h1>Blog</h1>

    <ContentList path="/posts" :query="query">
      <template v-slot="{ list }">
        <div v-for="[year, entry] in processList(list)" :key="year" class="relative mb-8">
          <div
            class="text-8xl text-stroke-2 text-stroke-neutral-200 dark:text-stroke-neutral-700 text-transparent font-900 mb-4 relative h-8 -z-1"
          >
            <span class="absolute -left-8 top-0">{{ year }}</span>
          </div>
          <PostEntry
            v-for="post in entry"
            :key="post._path"
            :title="post.title"
            :date="post.date"
            :to="post._path"
          />
        </div>
      </template>
    </ContentList>

    <div class="mt-20">
      <NuxtLink to="/" class="style-cd mt-8">&gt; cd ..</NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ParsedContent, QueryBuilderParams } from '@nuxt/content'

const dayjs = useDayjs()

const processList = (list: ParsedContent[]) => {
  const ret: Map<string, ParsedContent[]> = new Map()
  list.forEach((post) => {
    const year = dayjs(post.date, 'YYYY.MM.DD').format('YYYY')
    if (ret.has(year)) {
      ret.get(year)!.push(post)
    } else {
      ret.set(year, [post])
    }
  })
  return ret
}

const query: QueryBuilderParams = { sort: [{ date: -1 }] }
</script>
