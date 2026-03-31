<template>
  <div class="w-screen h-screen flex flex-col justify-end p-6 md:p-12">
    <div ref="canvas" class="absolute top-0 left-0 w-full h-full canvas-wrapper"></div>
    <div class="h-full max-w-4xl z-10 flex flex-col justify-center">
      <h2 class="text-zinc-500 text-sm tracking-widest mb-8 font-monospaced">
        // new Sr?.webDeveloper();
      </h2>
      <h1
        class="text-zinc-50 text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-[0.85] font-display"
      >
        ENGINEERING<br />
        <span class="italic text-zinc-400 font-artistic align-super lg:text-9xl">atmospheric</span
        ><br />
        EXPERIENCES.
      </h1>
      <p class="mt-8 text-zinc-500 max-w-md text-sm md:text-base leading-relaxed">
        Focusing on the intersection of design, motion, and robust engineering architecture.
        Crafting interfaces that feel alive.
      </p>
    </div>
    <PageTransition />
  </div>
</template>

<script setup lang="ts">
import Canvas from '../../utils/canvas'

const canvas = useTemplateRef('canvas')
let canvasInstance: Canvas

onMounted(() => {
  canvasInstance = new Canvas(canvas.value!)
})
onBeforeUnmount(() => {
  canvasInstance.cleanup()
})

useSeoMeta({
  title: 'Owen, Web Developer',
})
</script>
