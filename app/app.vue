<template>
  <div
    class="bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-100 h-auto relative flex flex-col min-h-screen font-[montserrat]"
  >
    <Navbar ref="navbar" class="sticky top-0 left-0 right-0 z-100 flex-none min-h-0" />
    <NuxtPage class="flex-1 min-h-0" />
    <div class="fixed bottom-12 right-4 z-10 flex flex-col items-center justify-center gap-4">
      <TransitionGroup name="list">
        <Trophy key="0" />
        <ScrollTop v-if="visible" key="1" />
      </TransitionGroup>
    </div>
    <div class="fixed bottom-12 left-4 z-20 w-[300px] flex flex-col gap-2">
      <TransitionGroup name="toast">
        <Popup
          v-for="achievement in achievementsToDisplay"
          :key="achievement.id"
          :entry="achievement"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
const { y } = useWindowScroll()
const navbar = useTemplateRef<HTMLElement>('navbar')
const { achievementsToDisplay } = useAchievements()

const visible = computed(() => {
  return y.value > 300
})

const { height } = useElementSize(navbar)

provide('navbarHeight', height)
</script>

<style>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

.toast-move, /* apply transition to moving elements */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease-in-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.toast-leave-to {
  opacity: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.toast-leave-active {
  position: absolute;
}
</style>
