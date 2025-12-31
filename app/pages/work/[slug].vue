<template>
  <div class="px-(--view-padding) py-6 relative flex flex-col">
    <div class="h-auto lg:flex-1 flex flex-col lg:flex-row relative">
      <div
        class="h-auto lg:flex-1 max-h-screen w-full lg:sticky lg:top-[90px] lg:w-1/2 flex-none"
        :style="{ maxHeight }"
      >
        <div
          ref="playground"
          class="border h-full border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden"
          :style="{ maxHeight }"
        >
          <component :is="compToRender" :height="height" :width="width" />
        </div>
      </div>
      <div class="w-full lg:w-1/2 flex-none pb-4">
        <div
          class="prose dark:prose-invert prose-slate prose-pre:bg-white prose-pre:dark:bg-[#17191e] mx-auto pt-8 lg:pt-4"
        >
          <h1 class="text-4xl font-semibold flex items-start">
            {{ data?.title }}
          </h1>
          <hr />
          <div>
            <ContentRenderer v-if="data" :value="data" class="mt-12" />
          </div>

          <div class="flex items-center justify-between mt-8">
            <NuxtLink v-if="prevEntry" :to="prevEntry.path" class="quick-link">
              <Icon name="ri:arrow-left-line" :size="20" />
              <div>
                <div class="caption">PREV</div>
                <div class="title">{{ prevEntry?.title }}</div>
              </div>
            </NuxtLink>
            <div v-else></div>
            <NuxtLink v-if="nextEntry" :to="nextEntry.path" class="quick-link flex-row-reverse">
              <Icon name="ri:arrow-right-line" :size="20" />
              <div class="text-right">
                <div class="caption">NEXT</div>
                <div class="title">{{ nextEntry?.title }}</div>
              </div>
            </NuxtLink>
            <div v-else></div>
          </div>
        </div>
      </div>
    </div>

    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const entries = import.meta.glob('./_entries/*.vue', { eager: true, import: 'default' })

const navbarHeight = inject<Ref<number>>('navbarHeight', toRef(0))
const maxHeight = computed(() => `calc(100vh - ${navbarHeight.value}px - 4rem)`)

const playground = useTemplateRef<HTMLElement>('playground')
const { height, width } = useElementSize(playground)

const compToRender = entries[`./_entries/${slug}.vue`]

// 获取所有 work 条目
const { data: workEntries } = await useAsyncData(() => {
  return queryCollection('work').select('idx', 'path', 'title').all()
})

// 获取当前条目的具体数据
const { data } = await useAsyncData(route.path, () => {
  return queryCollection('work').path(route.path).first()
})

const idx = data.value?.idx

if (idx === undefined) {
  throw createError({
    statusCode: 404,
    message: 'Work entry not found',
  })
}
// 计算上一个和下一个条目
const prevEntry = idx > 0 ? workEntries.value?.[idx - 1] : null
const nextEntry = idx < (workEntries.value?.length || 0) - 1 ? workEntries.value?.[idx + 1] : null
</script>

<style scoped>
.quick-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 12rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-slate-300);
  text-decoration: none;
  transition: background-color 0.15s ease-in-out;

  .caption {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-slate-500);
  }
  .title {
    line-height: 1;
  }

  &:hover {
    background-color: var(--color-slate-200);
  }
}

.dark .quick-link {
  border-color: var(--color-slate-700);
  color: var(--color-slate-300);
  &:hover {
    background-color: var(--color-slate-800);
  }
}
</style>
