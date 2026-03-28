<script setup lang="ts">
import { Milestone, Sparkles, Ban, FilePenLine } from 'lucide-vue-next'

const iconMap = {
  Milestone,
  Sparkles,
  Ban,
  FilePenLine,
}

const { title, icon = 'Sparkles' } = defineProps<{
  title?: string
  icon?: keyof typeof iconMap
}>()
</script>

<template>
  <div class="callout p-6 md:p-8 border-l border-r border-zinc-700 bg-zinc-500/10 relative">
    <div class="absolute top-0 left-0 w-full h-px bg-radial to-zinc-700 from-transparent"></div>
    <div class="absolute bottom-0 right-0 w-full h-px bg-radial to-zinc-700 from-transparent"></div>
    <div class="flex items-start gap-2">
      <component :is="iconMap[icon]" class="w-5 h-5 flex-none leading-none" />
      <div>
        <div v-if="title" class="font-bold leading-none mb-4 mt-px">{{ title }}</div>
        <div class="text-base">
          <slot mdc-unwrap="p"></slot>
        </div>
      </div>
    </div>
  </div>
</template>
