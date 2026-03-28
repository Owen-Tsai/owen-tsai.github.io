<template>
  <nav class="flex flex-col gap-2">
    <div v-for="(item, i) in links" :key="item.id">
      <a
        :href="`#${item.id}`"
        class="text-zinc-600 text-xs tracking-wide hover:text-zinc-50 transition-colors"
      >
        {{ num(i + 1) }} {{ item.text }}
      </a>
      <Toc v-if="item.children" :links="item.children" :depth="depth + 1" class="pl-4 mt-2" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links, depth = 1 } = defineProps<{
  links: TocLink[]
  depth?: number
}>()

const num = (i: number) => {
  if (depth > 1) {
    return ''
  }
  if (i < 10) {
    return `0${i}.`
  }
  return `${i}.`
}
</script>
