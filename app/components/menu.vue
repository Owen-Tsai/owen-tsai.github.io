<template>
  <div ref="el" class="fixed top-0 left-0 right-0 bottom-0 z-98">
    <div
      class="w-full h-full bg-neutral-200 text-neutral-950 relative px-10 py-12 pt-[15vh] flex flex-col gap-6 text-3xl"
    >
      <NuxtLink class="underline-link" to="/">HOME</NuxtLink>
      <NuxtLink class="underline-link" to="/blog">BLOG</NuxtLink>
      <NuxtLink class="underline-link" to="/about">ABOUT</NuxtLink>
      <hr class="my-16" />
      <a href="https://github.com/Owen-Tsai" target="_blank">GITHUB</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from '@/utils/gsap'

const el = useTemplateRef('el')

let openTween: gsap.core.Tween | undefined = undefined

onMounted(() => {
  gsap.set(el.value, {
    x: '100%',
  })
  openTween = gsap.to(el.value, {
    x: 0,
    duration: 0.3,
    ease: 'power3.inOut',
    paused: true,
  })
})

const close = () => {
  openTween?.reverse()
}

const open = () => {
  openTween?.play()
}

defineExpose({
  close,
  open,
})
</script>
