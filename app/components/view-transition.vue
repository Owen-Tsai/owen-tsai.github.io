<template>
  <Teleport to="body">
    <div
      class="fixed h-screen w-full overflow-hidden inset-0"
      :class="isTransitioning ? 'z-102' : '-z-1'"
    >
      <div ref="container" class="absolute h-full w-full flex flex-col items-center justify-center">
        <img
          ref="topImg"
          :src="top"
          class="inline-block w-full object-cover scale-y-0 origin-bottom transform-3d"
          loading="eager"
        />
        <div class="w-full h-screen bg-[#1c1c1c] flex-none"></div>
        <img
          ref="bottomImg"
          :src="bottom"
          class="inline-block w-full object-cover origin-top scale-y-0 transform-3d"
          loading="eager"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import top from '~/assets/img/trans-top.avif'
import bottom from '~/assets/img/trans-bottom.avif'

const topImg = useTemplateRef('topImg')
const bottomImg = useTemplateRef('bottomImg')
const container = useTemplateRef('container')
const { $gsap } = useNuxtApp()

const isTransitioning = ref(true)

const TRANSITION_DURATION = 0.64

onMounted(() => {
  // 展示页面
  $gsap.set(container.value, {
    y: 0,
  })
  $gsap.to(container.value, {
    y: '100%',
    duration: TRANSITION_DURATION,
    ease: 'power1.inOut',
  })
  $gsap.fromTo(
    topImg.value,
    {
      scaleY: 1,
    },
    {
      scaleY: 0,
      duration: TRANSITION_DURATION,
      ease: 'power1.inOut',
      onComplete: () => {
        isTransitioning.value = false
      },
    }
  )
})

onBeforeRouteLeave((to, from, next) => {
  isTransitioning.value = true
  $gsap.set(container.value, {
    y: '-100%',
  })
  $gsap.to(container.value, {
    y: 0,
    duration: TRANSITION_DURATION,
    ease: 'power1.inOut',
  })
  $gsap.fromTo(
    bottomImg.value,
    {
      scaleY: 0,
    },
    {
      scaleY: 1,
      duration: TRANSITION_DURATION,
      ease: 'power1.inOut',
      onComplete: () => {
        next()
      },
    }
  )
})
</script>
