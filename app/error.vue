<template>
  <div class="flex items-center justify-center w-screen h-screen">
    <div class="z-10 text-center flex flex-col items-center">
      <h1
        class="text-8xl md:text-[12rem] font-light tracking-tighter text-white leading-none mix-blend-difference"
      >
        {{ error?.status }}
      </h1>
      <div class="w-12 h-px bg-zinc-800 my-8"></div>
      <div class="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-12">
        {{ errorText }}
      </div>
      <NuxtLink
        to="/"
        class="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
        Back to Home
      </NuxtLink>
    </div>

    <PageTransition />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const { error } = defineProps({
  error: Object as () => NuxtError,
})

const MAP: Record<number, string> = {
  404: 'Page.Not_Found // Void',
  500: 'Page.Internal_Error // BUG',
}

const DEFAULT_ERROR_TEXT = 'Page.Unknown_Error'

const errorText = computed(() =>
  error?.status ? MAP[error.status] || DEFAULT_ERROR_TEXT : DEFAULT_ERROR_TEXT,
)
</script>
