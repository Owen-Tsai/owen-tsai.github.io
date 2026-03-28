<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { WritingCollectionItem } from '@nuxt/content'

const { item } = defineProps<{
  item: Pick<WritingCollectionItem, 'title' | 'date' | 'intro' | 'path' | 'id' | 'tags'>
}>()
</script>

<template>
  <NuxtLink
    :to="item.path"
    class="group py-8 md:py-12 border-b border-zinc-800 cursor-pointer flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 transition-colors duration-500 hover:bg-zinc-500/10"
  >
    <div
      class="text-zinc-600 font-mono text-sm md:w-32 shrink-0 group-hover:text-zinc-400 transition-all group-hover:translate-x-2"
    >
      {{ item.date }}
    </div>

    <div class="flex-1">
      <h2
        class="text-2xl md:text-3xl font-medium tracking-tight text-zinc-300 group-hover:text-zinc-50 transition-colors flex items-center gap-3"
      >
        {{ item.title }}
        <ArrowUpRight
          class="w-5 h-5 text-zinc-400 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
        />
      </h2>
      <p
        class="text-zinc-500 mt-4 leading-relaxed max-w-2xl text-sm md:text-base group-hover:text-zinc-400 transition-colors"
      >
        {{ item.intro }}
      </p>
      <div class="flex gap-4 mt-6">
        <span
          v-for="tag in item.tags"
          :key="tag"
          class="uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1 rounded-sm text-xs"
          >{{ tag }}</span
        >
      </div>
    </div>
  </NuxtLink>
</template>
