<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const props = defineProps<{
  links: TocLink[]
}>()
</script>

<template>
  <ul class="text-sm">
    <li v-for="item in props.links" :key="item.id">
      <a
        :href="`#${item.id}`"
        class="underline-link leading-loose text-slate-500 hover:text-slate-300 truncate inline-block max-w-full"
      >
        {{ item.text }}
      </a>
      <Toc v-if="item.children" :links="item.children" class="pl-4" />
    </li>
  </ul>
</template>
