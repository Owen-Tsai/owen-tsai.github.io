<template>
  <NuxtLink :href="props.href" :target="isEXternal ? '_blank' : props.target">
    <slot />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  href: {
    type: String,
    default: ''
  },
  target: {
    type: String as PropType<
      '_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined
    >,
    default: undefined,
    required: false
  }
})

const isEXternal = computed(() => props.href?.startsWith('http'))
</script>
