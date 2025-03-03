<template>
  <div
    class="bg-gray-100 dark:bg-neutral-800 rounded-lg my-4"
    :class="cn(type, { 'no-title': !title })"
  >
    <div class="py-4 px-6">
      <div v-if="title" class="flex items-center gap-2">
        <Icon v-if="icon" :name="iconToRender" size="1.3rem" class="icon" />
        <div class="leading-normal text-primary">{{ title }}</div>
      </div>
      <div class="flex gap-2" :class="{ 'mt-2': title }">
        <div v-if="icon && !title" class="flex-shrink-0 leading-normal">
          <Icon :name="iconToRender" size="1.3rem" class="icon align-middle" />
        </div>
        <div class="text-secondary inner max-w-full">
          <ContentSlot :use="($slots as any).default" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import cn from 'classnames'

const {
  type = 'info',
  icon = true,
  title
} = defineProps<{
  type?: 'info' | 'success' | 'warning' | 'error'
  icon?: string | boolean
  title?: string
}>()

const iconToRender = computed(() => {
  if (typeof icon === 'string' && icon.trim() !== '') return icon
  switch (type) {
    case 'info':
      return 'ri:information-2-fill'
    case 'success':
      return 'ri:checkbox-circle-fill'
    case 'warning':
      return 'ri:error-warning-fill'
    case 'error':
      return 'ri:close-circle-fill'
  }
})
</script>

<style lang="scss" scoped>
.info {
  @apply border-blue border-1;

  .icon {
    @apply text-blue;
  }
}
.success {
  @apply border-green border-1;

  .icon {
    @apply text-green;
  }
}
.warning {
  @apply border-orange border-1;

  .icon {
    @apply text-orange;
  }
}
.error {
  @apply border-red border-1;

  .icon {
    @apply text-red;
  }
}

.inner :deep(p:last-child) {
  @apply mb-1;
}
.inner :deep(p:first-child) {
  @apply mt-1;
}
.no-title .inner :deep(p) {
  @apply my-0;
}
</style>
