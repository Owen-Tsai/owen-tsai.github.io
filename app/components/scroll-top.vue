<template>
  <Transition name="fab">
    <button
      v-show="visible"
      class="border border-slate-300/40 bg-slate-800/10 backdrop-blur-xs flex items-center justify-center rounded-full p-2 cursor-pointer hover:bg-slate-800/80"
      @click="onClick"
    >
      <Icon name="ri:arrow-up-line" size="1.6rem" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
const { y } = useWindowScroll()

const visible = computed(() => {
  return y.value > 300
})

const onClick = () => {
  y.value = 0
}
</script>

<style>
.fab-enter-active,
.fab-leave-active {
  transition: all 0.2s ease-in-out;
}

.fab-enter-from,
.fab-leave-to {
  transform: translateY(24px);
  opacity: 0;
}
</style>
