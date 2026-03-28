<template>
  <Teleport to="body">
    <svg
      class="overlay fill-zinc-300"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        ref="overlayEl"
        class="overlay__path"
        vector-effect="non-scaling-stroke"
        d="M 0 0 V 100 Q 50 100 100 100 V 0 z"
      />
    </svg>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { NavigationGuard } from 'vue-router'

const overlayEl = useTemplateRef('overlayEl')

const paths = {
  step1: {
    unfilled: 'M 0 100 V 100 Q 50 100 100 100 V 100 z',
    inBetween: {
      curve1: 'M 0 100 V 50 Q 50 0 100 50 V 100 z',
      curve2: 'M 0 100 V 50 Q 50 100 100 50 V 100 z',
    },
    filled: 'M 0 100 V 0 Q 50 0 100 0 V 100 z',
  },
  step2: {
    filled: 'M 0 0 V 100 Q 50 100 100 100 V 0 z',
    inBetween: {
      curve1: 'M 0 0 V 50 Q 50 0 100 50 V 0 z',
      curve2: 'M 0 0 V 50 Q 50 100 100 50 V 0 z',
    },
    unfilled: 'M 0 0 V 0 Q 50 0 100 0 V 0 z',
  },
}

const isAnimating = ref(false)

const onEnter = () => {
  isAnimating.value = true
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    },
  })

  tl.set(overlayEl.value, {
    attr: { d: paths.step2.filled },
  })
    .to(
      overlayEl.value,
      {
        duration: 0.2,
        ease: 'sine.in',
        attr: { d: paths.step2.inBetween.curve1 },
      },
      0,
    )
    .to(overlayEl.value, {
      duration: 0.5,
      ease: 'power4',
      attr: { d: paths.step2.unfilled },
    })

  tl.play()
}

const onLeave: NavigationGuard = (to, from, next) => {
  isAnimating.value = true
  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
      next()
    },
  })

  tl.set(overlayEl.value, {
    attr: { d: paths.step1.unfilled },
  })
    .to(
      overlayEl.value,
      {
        duration: 0.5,
        ease: 'power4.in',
        attr: { d: paths.step1.inBetween.curve1 },
      },
      0,
    )
    .to(overlayEl.value, {
      duration: 0.2,
      ease: 'power1',
      attr: { d: paths.step1.filled },
    })
    .play()
}

onMounted(() => {
  onEnter()
})

onBeforeRouteUpdate((to, from, next) => {
  if (to.path === from.path) {
    return
  }
  onLeave(to, from, next)
})
onBeforeRouteLeave((to, from, next) => {
  if (to.path === from.path) {
    return
  }
  onLeave(to, from, next)
})
</script>

<style lang="css" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  pointer-events: none;
  width: 100%;
  height: 100%;
}
</style>
