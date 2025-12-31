<template>
  <div v-if="entry" class="w-full max-w-sm">
    <div
      class="relative flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_0_40px_-10px_rgba(251,191,36,0.15)]"
    >
      <div
        class="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600"
      ></div>

      <div
        class="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
      >
        <Icon name="material-symbols:trophy-rounded" :size="40" />
      </div>

      <div class="flex-1">
        <p
          class="mb-0.5 text-[10px] font-black tracking-[0.15em] text-yellow-600 dark:text-yellow-500"
        >
          ACHIEVEMENT UNLOCKED
        </p>
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
          {{ entry.name }}
        </h3>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
          {{ entry.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { entry = undefined } = defineProps<{
  entry?: Achievement
}>()
</script>
