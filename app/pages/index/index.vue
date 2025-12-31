<template>
  <div class="w-full h-full flex flex-col justify-end relative">
    <P5Canvas
      v-if="isMounted"
      :sketch="sketch"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-10"
    />
    <div class="absolute left-1/2 bottom-[10vh] -translate-x-1/2 mix-blend-difference">
      <a
        href="/resume.pdf"
        target="_blank"
        class="cta relative border border-slate-300 text-slate-100 px-6 py-2 rounded-full flex flex-col items-center justify-center"
        @mouseenter="playTweens"
        @mouseleave="reverseTweens"
      >
        <div ref="textRef">download <span class="font-[ruigslay]">Resume</span></div>
        <div ref="hoverTextRef" class="absolute origin-bottom pointer-events-none">
          download <span class="font-[ruigslay]">Resume</span>
        </div>
      </a>
    </div>
    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
import { useHero } from './_hero'

const { isMounted, sketch } = useHero()

const textRef = useTemplateRef('textRef')
const hoverTextRef = useTemplateRef('hoverTextRef')

const { playTweens, reverseTweens } = useSlideTween(textRef, hoverTextRef)
</script>

<style scoped>
.cta > div {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
