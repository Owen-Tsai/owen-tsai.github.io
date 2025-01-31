<template>
  <NuxtLink
    class="tag inline-flex items-center gap-0.5 justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 text-sm decoration-none rounded cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700"
    :to="link"
    :target="link?.startsWith('http') ? '_blank' : undefined"
  >
    <slot name="icon">
      <Icon v-if="icon" :name="icon" />
    </slot>
    <slot>
      <span class="font-slim">{{ text }}</span>
    </slot>
  </NuxtLink>
</template>

<script lang="ts" setup>
const { text, icon, link } = defineProps<{
  text: string
  icon?: string
  link?: string
}>()
</script>
