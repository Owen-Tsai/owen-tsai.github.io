<template>
  <NuxtLink
    :href="props.href"
    :target="isExternal ? '_blank' : props.target"
    class="inline-flex items-center text-blue-500"
  >
    <slot />
    <Icon v-if="isExternal" name="ri:arrow-right-up-long-line" />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String as PropType<
      '_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined
    >,
    default: undefined,
    required: false,
  },
})

const isExternal = computed(() => props.href?.startsWith('http'))
</script>
