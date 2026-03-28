<template>
  <NuxtLink
    class="inline-flex items-center font-light"
    :href="href"
    :target="isExternal ? '_blank' : target"
  >
    <slot />
    <ExternalLink v-if="isExternal" class="ml-1 w-4 h-4" />
  </NuxtLink>
</template>

<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'

const { href = '' } = defineProps<{
  href: string
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined
}>()

const isExternal = computed(() => href.startsWith('http'))
</script>
