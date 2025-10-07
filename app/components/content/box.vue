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
</script>

<template>
  <div :class="[`box-${theme}`, title ? 'items-start' : 'items-center']" class="flex gap-4 box">
    <Icon
      :name="iconName"
      :size="20"
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

.box-info {
  @apply bg-gradient-to-tl from-[70%] to-[120%] from-[#111a2c] to-[#15325b] rounded-lg border-[#15325b] border text-neutral-300 p-4;
  .icon {
    @apply text-blue-500;
  }
}

.box-warning {
  @apply bg-gradient-to-tl from-[70%] to-[120%] from-[#2b2111] to-[#594214] rounded-lg border-[#594214] border text-neutral-300 p-4;
  .icon {
    @apply text-yellow-500;
  }
}

.box-danger {
  @apply bg-gradient-to-tl from-[70%] to-[120%] from-[#2c1618] to-[#5b2526] rounded-lg border-[#5b2526] border text-neutral-300 p-4;
  .icon {
    @apply text-red-500;
  }
}

.box-success {
  @apply bg-gradient-to-tl from-[70%] to-[120%] from-[#162312] to-[#274916] rounded-lg border-[#274916] border text-neutral-300 p-4;
  .icon {
    @apply text-green-500;
  }
}
</style>
