<template>
  <Transition name="fab">
    <button
      v-show="visible"
      @click="onClick"
      class="border border-neutral-3 dark:border-neutral-7 flex items-center justify-center rounded-full p-2 bg-neutral-1 dark:bg-neutral-8"
    >
      <Icon name="ri:arrow-up-line" size="1.2rem" />
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

<style lang="scss">
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
