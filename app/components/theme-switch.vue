<template>
  <button
    class="inline-flex items-center justify-center p-2 min-w-[34px] cursor-pointer"
    @mouseenter="playTweens()"
    @mouseleave="reverseTweens()"
    @click="toggleDark()"
  >
    <div class="inline-flex flex-col items-center justify-center relative">
      <span ref="iconRef" class="inline-flex items-center justify-center">
        <Icon :name="!isDark ? 'ri:sun-line' : 'ri:moon-line'" size="18px" />
      </span>
      <span
        ref="iconHoverRef"
        class="absolute origin-bottom pointer-events-none inline-flex items-center justify-center"
      >
        <Icon :name="!isDark ? 'ri:moon-line' : 'ri:sun-line'" size="18px" />
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)

const iconRef = useTemplateRef<HTMLElement>('iconRef')
const iconHoverRef = useTemplateRef<HTMLElement>('iconHoverRef')

const { playTweens, reverseTweens } = useSlideTween(iconRef, iconHoverRef)
</script>
