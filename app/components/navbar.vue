<template>
  <header class="flex items-center justify-between px-8 py-2 mix-blend-difference z-999">
    <NuxtLink to="/">
      <Logo class="h-16 w-16" />
    </NuxtLink>
    <div v-if="!isMobile" class="flex items-center gap-20">
      <div v-for="nav in navs" :key="nav.name" class="relative group">
        <NuxtLink
          :to="nav.link"
          class="underline-link"
          :class="{ active: nav.link === '/blog' && route.path.includes('blog') }"
        >
          {{ nav.name }}
        </NuxtLink>
      </div>
    </div>
    <div v-else @click="toggle()">
      <Icon :name="visible ? 'ri-close-line' : 'ri-menu-line'" size="24px" />
    </div>

    <Teleport to="body">
      <Menu ref="menu" />
    </Teleport>
  </header>
</template>

<script setup lang="ts">
const { smallerOrEqual } = breakpoints
const isMobile = computed(() => smallerOrEqual('sm').value)

const menu = useTemplateRef('menu')

const visible = ref(false)
const route = useRoute()

const toggle = () => {
  visible.value = !visible.value
  if (visible.value) {
    menu.value?.open()
  } else {
    menu.value?.close()
  }
}

const navs = [
  { name: 'HOME', link: '/' },
  { name: 'BLOG', link: '/blog' },
  { name: 'ABOUT', link: '/about' },
  { name: 'GITHUB', link: 'https://github.com/Owen-Tsai' },
]

watch(
  () => route.path,
  (to, from) => {
    if (to !== from) {
      visible.value = false
      menu.value?.close()
    }
  },
)
</script>
>
