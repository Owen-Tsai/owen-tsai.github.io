<template>
  <div class="pb-12 relative">
    <div class="px-8">
      <div class="flex flex-col md:grid md:grid-cols-4 gap-4 border-t border-t-neutral-800">
        <div v-if="!isMobile" class="border-r border-r-neutral-800 p-4">
          <div class="sticky top-18">
            <Icon name="ri:menu-4-fill" :size="20" />
            <Toc v-if="data?.body.toc" :links="data?.body.toc.links" />
          </div>
        </div>
        <div class="md:col-start-2 md:col-end-5 md:pl-8 md:py-12">
          <article class="prose prose-neutral prose-invert font-thin max-w-2xl">
            <h1 class="text-6xl font-thin leading-tight">{{ data?.title }}</h1>
            <div class="mt-6 text-neutral-500">{{ dayjs(data?.date).format('MMM DD, YYYY') }}</div>
            <ContentRenderer v-if="data" :value="data" class="mt-12" />
          </article>
        </div>
      </div>
    </div>

    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const isMobile = computed(() => breakpoints.smallerOrEqual('sm').value)

const { data } = await useAsyncData(route.path, () => {
  return queryCollection('blog').path(route.path).first()
})
</script>
