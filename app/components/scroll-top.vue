<template>
  <button
    class="border border-slate-300/40 bg-slate-800/10 backdrop-blur-xs flex items-center justify-center rounded-full p-2 cursor-pointer hover:bg-slate-800/80"
    @click="onClick"
  >
    <Icon name="ri:arrow-up-line" size="1.6rem" />
  </button>
</template>

<script setup lang="ts">
const { y } = useWindowScroll()

const onClick = () => {
  y.value = 0
}
</script>
