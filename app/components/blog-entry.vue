<template>
  <NuxtLink
    :to="item.path"
    class="grid grid-cols-12 gap-x-4 gap-y-2 lg:gap-y-4 group text-lg relative font-bold hover:text-slate-950 transition-all duration-300 ease-in-out mb-6 lg:mb-0"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="col-span-12 lg:col-span-4 relative lg:py-2">
      <div
        :class="cls"
        class="absolute hover-bg bg-slate-200 w-full h-full left-0 top-0 origin-top scale-y-0"
      ></div>
      <div
        class="z-10 relative group-hover:pl-3 transition-all duration-300 ease-in-out text-xl lg:text-lg"
      >
        {{ item.title }}
      </div>
    </div>
    <div
      class="col-span-12 lg:col-span-3 row-start-1 lg:row-start-auto relative w-full pointer-events-none lg:py-2"
    >
      <div
        class="lg:absolute top-1/2 lg:-translate-y-1/2 flex items-center gap-4 scale-100 lg:scale-0 group-hover:scale-100 transition-transform duration-300 w-full left-0 right-0"
      >
        <div class="hidden lg:block dot"></div>
        <NuxtImg
          :src="`/cover/${item.cover}`"
          class="flex-1 lg:aspect-[16/10] pointer-events-none z-1 bg-slate-950 min-w-0"
        />
        <div class="hidden lg:block dot"></div>
      </div>
    </div>
    <div class="hidden lg:block col-span-12 lg:col-span-3 relative lg:py-2">
      <div
        :class="cls"
        class="absolute hover-bg bg-slate-200 w-full h-full left-0 top-0 origin-top scale-y-0"
      ></div>
      <div class="z-10 relative group-hover:pl-3 transition-all duration-300 ease-in-out truncate">
        {{ item.tags.join(' / ') }}
      </div>
    </div>
    <div
      class="col-span-12 lg:col-span-2 row-start-3 lg:row-start-auto text-left lg:text-right relative lg:py-2"
    >
      <div
        :class="cls"
        class="absolute hover-bg bg-slate-200 w-full h-full left-0 top-0 origin-top scale-y-0"
      ></div>
      <div class="z-10 relative group-hover:pr-3 transition-all duration-300 ease-in-out">
        {{ dayjs(item.date).format('MMM DD, YYYY') }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { BlogCollectionItem } from '@nuxt/content'

const { item, dir } = defineProps<{
  item: Pick<BlogCollectionItem, 'title' | 'date' | 'tags' | 'cover' | 'path' | 'id'>
  dir: 'up' | 'down'
}>()

const { $gsap } = useNuxtApp()
const cls = computed(() => `hover-bg-${item.path.split('/').pop()}`)

const onMouseEnter = () => {
  $gsap.set(`.${cls.value}`, {
    transformOrigin: dir === 'up' ? 'bottom' : 'top',
  })
  $gsap.fromTo(
    `.${cls.value}`,
    {
      scaleY: 0,
    },
    {
      scaleY: 1,
      duration: 0.3,
      ease: 'power1.inOut',
    }
  )
}

const onMouseLeave = () => {
  $gsap.set(`.${cls.value}`, {
    transformOrigin: dir === 'up' ? 'top' : 'bottom',
  })
  $gsap.to(`.${cls.value}`, {
    scaleY: 0,
    duration: 0.3,
    ease: 'power1.inOut',
  })
}

onBeforeUnmount(() => {
  $gsap.killTweensOf(`.${cls.value}`)
})
</script>

<style scoped>
.dot {
  height: 8px;
  width: 8px;
  flex: none;
  background-color: var(--color-slate-200);
  min-width: 0;
  /* border-radius: 50%; */
}
</style>
