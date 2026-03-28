<template>
  <Transition name="slide-up">
    <button
      v-show="y > 400"
      class="inline-flex items-center justify-center border border-zinc-800 hover:bg-zinc-800/30 hover:border-zinc-700 text-zinc-200 p-2 cursor-pointer"
      @click="scrollToTop"
    >
      <ArrowUp />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next'

const { y } = useWindowScroll()

const scrollToTop = () => {
  y.value = 0
}
</script>
