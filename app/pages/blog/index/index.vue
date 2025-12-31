<template>
  <div class="px-(--view-padding) pb-[10vh]">
    <div class="py-[14vh]">
      <h1 class="text-6xl lg:text-8xl font-semibold flex items-start">
        BLOG<sup class="text-2xl">({{ data?.length }})</sup>
      </h1>
    </div>
    <div class="border-t border-gray-200 dark:border-gray-800 py-6">
      <div class="hidden lg:grid grid-cols-12 gap-4 text-sm text-gray-500 py-2">
        <div class="col-span-7">TITLE</div>
        <div class="col-span-3">TOPIC</div>
        <div class="col-span-2 text-right">DATE</div>
      </div>
      <BlogEntry v-for="item in data" :key="item.id" :item="item" :dir="dir" />
    </div>
    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
const { y } = useMouse({ touch: false })
const dir = ref<'up' | 'down'>('up')

const { data } = await useAsyncData(() => {
  return queryCollection('blog')
    .select('title', 'date', 'path', 'id', 'tags', 'cover')
    .order('date', 'DESC')
    .all()
})

const hoverBgEls = ref<NodeListOf<HTMLDivElement>>()

onMounted(() => {
  hoverBgEls.value = document.querySelectorAll('.hover-bg')
})

watch(
  () => y.value,
  (newY, oldY) => {
    if (typeof window === 'undefined') {
      return
    }
    if (newY > oldY) {
      // moved down
      dir.value = 'down'
    } else {
      // moved up
      dir.value = 'up'
    }
  }
)
</script>
