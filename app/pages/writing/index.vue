<template>
  <div class="p-6 md:p-12 mb-20 max-w-5xl mx-auto">
    <div class="pt-32 md:pt-48 mb-16 md:mb-24">
      <h1 class="text-4xl md:text-6xl font-light tracking-tighter text-zinc-50">Writing</h1>
      <p class="text-zinc-500 mt-4 text-sm tracking-widest uppercase">Thoughts & Architecture</p>
    </div>
    <div class="border-t border-zinc-800">
      <ArticleEntry v-for="item in data" :key="item.id" :item="item" />
    </div>
    <PageTransition />
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData(() => {
  return queryCollection('writing')
    .select('title', 'date', 'path', 'id', 'tags', 'intro')
    .order('date', 'DESC')
    .all()
})

useSeoMeta({
  title: 'Writing // Owen',
})
</script>
