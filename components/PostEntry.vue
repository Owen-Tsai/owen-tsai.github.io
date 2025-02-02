<template>
  <NuxtLink class="post-entry flex items-center gap-2 not-prose mb-4 group" :to="to">
    <span
      class="text-lg text-secondary group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors ease-in-out duration-200"
      >{{ title }}</span
    >
    <span
      class="text-muted text-sm group-hover:text-neutral-500 transition-colors ease-in-out duration-200"
      >{{ $dayjs(date, 'YYYY.MM.DD').format('MMM.DD') }}</span
    >
  </NuxtLink>
</template>

<script setup lang="ts">
const { date, title, to } = defineProps<{
  to?: string
  title?: string
  date?: string
}>()
</script>
