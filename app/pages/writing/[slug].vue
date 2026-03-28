<template>
  <div class="p-6 md:p-14 mb-20 max-w-4xl mx-auto">
    <aside class="hidden lg:block md:col-span-3 lg:col-span-2 fixed left-12 top-49">
      <div class="sticky top-49">
        <div
          class="text-[10px] font-mono text-zinc-500 mb-6 uppercase tracking-widest border-b border-zinc-900 pb-2"
        >
          contents
        </div>
        <Toc v-if="data?.body.toc" :links="data.body.toc.links" />
      </div>
    </aside>
    <div class="pt-36 mb-16 md:mb-24 mx-auto">
      <NuxtLink
        class="flex items-center gap-2 text-zinc-500 hover:text-zinc-50 transition-colors mb-12 text-xs font-mono uppercase tracking-widest group"
        to="/writing"
      >
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        cd ../
      </NuxtLink>

      <header class="mb-16 md:mb-20">
        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tighter text-zinc-50 leading-[1.15]"
        >
          {{ data?.title }}
        </h1>
        <div class="flex gap-4 items-center mt-8">
          <span class="text-zinc-400 font-mono text-sm">{{ data?.date }}</span>
          <span class="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span class="text-zinc-500 text-xs tracking-widest uppercase">{{
            data?.tags.join(' / ')
          }}</span>
        </div>
      </header>

      <hr class="border-zinc-800 mb-12" />

      <article
        class="prose prose-invert prose-zinc max-w-full text-zinc-300 font-light leading-relaxed prose-pre:bg-zinc-900 prose-img:my-0 prose-img:mx-auto"
      >
        <ContentRenderer v-if="data" :value="data" />
        <div class="text-zinc-400 font-mono text-xs mb-2 mt-8">Fin.</div>
        <NuxtLink
          class="flex items-center gap-2 text-zinc-500 hover:text-zinc-50 transition-colors mb-12 text-xs not-prose font-mono uppercase tracking-widest group"
          to="/writing"
        >
          cd ../
        </NuxtLink>
      </article>
    </div>

    <PageTransition />
    <ToTop class="fixed right-6 md:right-12 bottom-26" />
    <div
      ref="viewerRef"
      class="viewer fixed top-0 left-0 bottom-0 right-0 bg-zinc-500/10 backdrop-blur-sm flex items-center justify-center -z-10 opacity-0"
      @click="zoomOut"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Flip } from 'gsap/Flip'
import gsap from 'gsap'

gsap.registerPlugin(Flip)

/* -------------------- 数据获取 -------------------- */
const route = useRoute()
const { data } = await useAsyncData(route.path, () =>
  queryCollection('writing').path(route.path).first(),
)

/* -------------------- 模板引用与滚动 -------------------- */
const viewerRef = useTemplateRef('viewerRef')
const { y: scrollY } = useWindowScroll()

/* -------------------- 状态管理 -------------------- */
const imgEls = ref<HTMLImageElement[]>([])
const activeImg = ref<HTMLImageElement>()
const originalContainer = ref<HTMLElement>()
const zoomScrollY = ref(0)

/* -------------------- 动画常量 -------------------- */
const DURATION = 0.2
const EASE = 'power1.inOut'
const SCROLL_THRESHOLD = 60

/* -------------------- 缩放逻辑 -------------------- */
const zoomIn = (img: HTMLImageElement) => {
  const state = Flip.getState(img)
  activeImg.value = img
  originalContainer.value = img.parentElement!
  zoomScrollY.value = scrollY.value

  const { height } = useElementSize(originalContainer)
  gsap.set(originalContainer.value, { height: height.value })

  viewerRef.value?.appendChild(img)

  Flip.from(state, { duration: DURATION, ease: EASE, absolute: true })

  gsap.set(viewerRef.value, { zIndex: 1000 })
  gsap.to(viewerRef.value, { duration: DURATION, ease: EASE, opacity: 1 })
}

const zoomOut = () => {
  if (!activeImg.value) return

  const state = Flip.getState('.viewer > img')
  originalContainer.value!.appendChild(activeImg.value)
  activeImg.value = undefined

  Flip.from(state, {
    duration: DURATION,
    ease: EASE,
    absolute: true,
    onComplete: () => {
      gsap.set(viewerRef.value, { zIndex: -10 })
      gsap.set(originalContainer.value!, { height: 'auto' })
    },
  })

  gsap.to(viewerRef.value, { duration: DURATION, ease: EASE, opacity: 0 })
}

/* -------------------- 事件处理 -------------------- */
const handleImgClick = (img: HTMLImageElement) =>
  activeImg.value === img ? zoomOut() : zoomIn(img)

/* -------------------- 生命周期 -------------------- */
onMounted(() => {
  imgEls.value = Array.from(document.querySelectorAll('article .article-img'))
  imgEls.value.forEach((img) => img.addEventListener('click', () => handleImgClick(img)))
})

onBeforeUnmount(() => {
  imgEls.value.forEach((img) => img.removeEventListener('click', () => handleImgClick(img)))
})

/* -------------------- 滚动监听 -------------------- */
watch(scrollY, (newY) => {
  if (!activeImg.value) return
  if (Math.abs(newY - zoomScrollY.value) > SCROLL_THRESHOLD) zoomOut()
})

useSeoMeta({
  title: `${data.value?.title} // Owen`,
  description: data.value?.description,
})
</script>

<style lang="css" scoped>
.viewer :deep(img) {
  max-height: 90vh;
}
</style>
