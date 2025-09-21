<template>
  <Teleport to="body">
    <div
      ref="mask"
      class="fixed top-0 left-0 right-0 bottom-0 z-101 grid grid-rows-5 md:grid-cols-5 md:grid-rows-1"
    >
      <div v-for="i in 5" ref="els" :key="i" class="w-full h-full bg-neutral-200"></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { gsap } from '@/utils/gsap'

const { smallerOrEqual } = breakpoints
const isMobile = computed(() => smallerOrEqual('sm').value)

const maskEl = useTemplateRef('mask')
const els = useTemplateRef('els')

const duration = 0.8

// page is mounted with this component:
onMounted(() => {
  if (!isMobile.value) {
    gsap.set(els.value, {
      y: 0,
    })
    gsap.to(els.value, {
      y: '100%',
      duration,
      ease: 'power2.inOut',
      stagger: 0.1,
      onComplete() {
        gsap.set(maskEl.value, {
          zIndex: -999,
        })
      },
    })
  } else {
    gsap.set(els.value, {
      x: 0,
    })
    gsap.to(els.value, {
      x: '100%',
      duration,
      ease: 'power2.inOut',
      stagger: 0.1,
      onComplete() {
        gsap.set(maskEl.value, {
          zIndex: -999,
        })
      },
    })
  }
})

onBeforeRouteLeave((to, from, next) => {
  if (!isMobile.value) {
    gsap.set(maskEl.value, {
      zIndex: 999,
    })
    gsap.set(els.value, {
      y: '-100%',
    })
    gsap.to(els.value, {
      y: 0,
      duration,
      ease: 'power2.inOut',
      stagger: 0.1,
      onComplete() {
        next()
      },
    })
  } else {
    next()
  }
})
</script>
