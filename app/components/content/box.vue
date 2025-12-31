<script setup lang="ts">
const {
  theme = 'info',
  title = undefined,
  icon = true,
} = defineProps<{
  theme?: 'info' | 'warning' | 'danger' | 'success'
  title?: string
  icon?: boolean | string
}>()

const iconName = computed(() => {
  if (typeof icon === 'string' && icon.trim() !== '') return icon
  switch (theme) {
    case 'success':
      return 'ri:checkbox-circle-fill'
    case 'warning':
      return 'ri:error-warning-fill'
    case 'danger':
      return 'ri:close-circle-fill'
    default:
      return 'ri:information-2-fill'
  }
})

const themeCls = computed(() => {
  switch (theme) {
    case 'info':
      return 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:bg-blue-400/10 dark:border-blue-400/25 dark:text-blue-300 dark:[&_a]:text-blue-400'
    case 'danger':
      return 'bg-red-500/10 border-red-500/25 text-red-600 dark:bg-red-400/10 dark:border-red-400/25 dark:text-red-300 dark:[&_a]:text-red-400'
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:bg-yellow-400/10 dark:border-yellow-400/25 dark:text-yellow-300 dark:[&_a]:text-yellow-400'
    case 'success':
      return 'bg-green-500/10 border-green-500/25 text-green-600 dark:bg-green-400/10 dark:border-green-400/25 dark:text-green-300 dark:[&_a]:text-green-400'
    default:
      return undefined
  }
})
</script>

<template>
  <div
    :class="['callout', themeCls, title ? 'items-start' : 'items-center']"
    class="flex gap-4 box"
  >
    <Icon
      :name="iconName"
      :size="24"
      class="min-w-0 flex-none icon"
      :class="title ? 'mt-3px' : null"
    />
    <div class="min-w-0">
      <div v-if="title" class="text-lg font-bold">{{ title }}</div>
      <slot mdc-unwrap="p"></slot>
    </div>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

.callout {
  @apply rounded-lg border px-4 py-3;
}
</style>
