<template>
  <NuxtLink
    to="/"
    class="flex items-center gap-[1px]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div ref="svgRef" class="font-[ruigslay] text-2xl origin-left">O</div>
    <div ref="textRef" class="font-[ruigslay] text-2xl">wen.</div>
  </NuxtLink>
</template>

<script setup lang="ts">
const svgRef = useTemplateRef('svgRef')
const textRef = useTemplateRef('textRef')

const { $gsap } = useNuxtApp()

let tween: gsap.core.Timeline | null = null

const onMouseEnter = () => {
  tween?.play()
}

const onMouseLeave = () => {
  tween?.reverse()
}

onMounted(() => {
  tween = $gsap.timeline({
    paused: true,
  })
  tween.fromTo(
    svgRef.value,
    {
      scale: 1.8,
    },
    {
      scale: 1,
      duration: 0.2,
      ease: 'power1.inOut',
    }
  )
  tween.fromTo(
    textRef.value,
    {
      x: -8,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 0.2,
      ease: 'power1.inOut',
    },
    '>-0.1'
  )
})

onBeforeUnmount(() => {
  tween?.kill()
})
</script>
