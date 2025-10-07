<template>
  <div class="bg-slate-200 text-slate-950 rounded p-1 font-medium flex flex-col">
    <div class="h-1.5 w-1.5 rounded-full bg-current"></div>
    <div class="flex flex-col text-sm pl-4 overflow-hidden" @click="menuActive = !menuActive">
      <span ref="menuRef">Menu</span>
      <span ref="closeRef" class="absolute">Close</span>
    </div>

    <Teleport to="body">
      <div
        class="menu fixed top-0 left-0 w-screen h-screen -z-99 bg-slate-200 text-slate-950 flex flex-col justify-end p-(--view-padding) pb-[4vh]"
      >
        <div>Yet another wev developer.</div>
        <nav class="border-t border-t-slate-950 mt-4">
          <ul class="flex flex-col">
            <li
              v-for="(item, i) in menuItems"
              :key="item.name"
              ref="navEls"
              class="flex items-center gap-2 border-b border-b-slate-950"
            >
              <template v-if="item.to">
                <span class="font-mono">0{{ i + 1 }}</span>
                <NuxtLink :to="item.to" class="block py-4 font-bold text-3xl flex-1">{{
                  item.name
                }}</NuxtLink>
              </template>
              <template v-else>
                <span class="font-mono">0{{ i + 1 }}</span>
                <a :href="item.href" target="_blank" class="block py-4 font-bold text-3xl flex-1">
                  {{ item.name }}
                </a>
              </template>
            </li>
          </ul>
        </nav>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const menuItems = [
  { name: 'Home', to: '/' },
  { name: 'Blog', to: '/blog' },
  { name: 'About', to: '/about' },
  { name: 'Github', to: 'https://github.com/Owen-Tsai' },
  { name: 'Get my Resume', href: '/resume.pdf' },
]

const menuRef = useTemplateRef('menuRef')
const closeRef = useTemplateRef('closeRef')
const navEls = useTemplateRef('navEls')

const menuActive = ref(false)

const route = useRoute()

const { playTweens, reverseTweens } = useSlideTween(menuRef, closeRef)

let timeline: gsap.core.Timeline | null = null
const { $gsap } = useNuxtApp()

onMounted(() => {
  timeline = $gsap.timeline({ paused: true })
  timeline.fromTo(
    '.menu',
    {
      opacity: 0,
      zIndex: -99,
    },
    {
      opacity: 1,
      duration: 0.3,
      zIndex: 99,
      ease: 'power1.inOut',
    }
  )
  timeline.fromTo(
    navEls.value,
    {
      y: -4,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.15,
      ease: 'power1.inOut',
      stagger: 0.01,
    }
  )
})

onBeforeUnmount(() => {
  timeline?.kill()
})

watch(
  () => menuActive.value,
  (newVal) => {
    if (newVal) {
      timeline?.timeScale(1)
      playTweens()
      timeline?.play()
    } else {
      timeline?.timeScale(2.5)
      reverseTweens()
      timeline?.reverse()
    }
  }
)

watch(
  () => route.path,
  (to, from) => {
    if (to !== from) {
      menuActive.value = false
    }
  }
)
</script>
