<template>
  <div class="px-(--view-padding) pt-[14vh] pb-[10vh] relative">
    <div class="hidden lg:block fixed top-[14vh] left-(--view-padding) w-[200px]">
      <Icon name="ri:menu-2-line" class="w-6 h-6 text-slate-400" />
      <Toc v-if="data?.body.toc" :links="data?.body.toc.links" />
    </div>
    <div
      class="prose prose-slate prose-invert prose-headings:text-slate-200 prose-pre:bg-slate-500/20 mx-auto"
    >
      <h1 class="text-4xl font-semibold flex items-start">
        {{ data?.title }}
      </h1>
      <p class="text-slate-400">
        {{ dayjs(data?.date).format('MMM DD, YYYY') }}
      </p>
      <hr />
      <div>
        <ContentRenderer v-if="data" :value="data" class="mt-12" />
      </div>
    </div>
    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()

const { data } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path(route.path).first()
})
</script>
