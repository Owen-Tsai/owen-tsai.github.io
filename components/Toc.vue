<template>
  <ul class="not-prose my-0 text-sm text-neutral-500 toc">
    <li v-for="(item, i) in links" :key="i" class="leading-loose text-ellipsis overflow-hidden">
      <a class="hover:text-secondary" :href="`#${item.id}`">{{ item.text }}</a>
      <Toc v-if="item.children" :links="item.children" class="pl-4" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const { links } = defineProps<{
  links?: TocLink[]
}>()

defineOptions({ name: 'Toc' })
</script>
