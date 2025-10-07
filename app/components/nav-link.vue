<template>
  <NuxtLink
    :target="to.includes('http') ? '_blank' : undefined"
    :to="to"
    class="relative inline-flex flex-col items-center justify-center"
    @mouseenter="playTweens"
    @mouseleave="reverseTweens"
  >
    <div ref="text">{{ label }}</div>
    <div ref="textHover" class="absolute origin-bottom pointer-events-none">
      {{ label }}
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { to, label } = defineProps<{
  to: string
  label: string
}>()

const textRef = useTemplateRef('text')
const textHoverRef = useTemplateRef('textHover')

const { playTweens, reverseTweens } = useSlideTween(textRef, textHoverRef)
</script>
