<template>
  <header class="flex items-center justify-center text-slate-100 mix-blend-difference">
    <div
      class="px-(--view-padding) pt-(--view-padding) w-full mx-auto flex items-center justify-between"
    >
      <Logo />
      <nav class="hidden lg:flex items-center gap-8 font-[montserrat] font-medium">
        <NavLink to="/" label="Home" class="indicator-dot" />
        <NavLink
          to="/blog"
          label="Blog"
          class="indicator-dot"
          :class="{ active: isActive('/blog') }"
        />
        <NavLink
          label="Work"
          :to="data!.path"
          class="indicator-dot"
          :class="{ active: isActive('/work') }"
        />
        <NavLink to="/about" label="About" class="indicator-dot" />
        <NavLink to="https://github.com/Owen-Tsai" label="Github" @click="unlock('github')" />
        <ThemeSwitch />
      </nav>
      <div class="flex lg:hidden items-center gap-4">
        <ThemeSwitch />
        <HamMenu class="block lg:hidden" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { path } = toRefs(useRoute())
const { unlock } = useAchievements()

const isActive = (pathname: string) => {
  return path.value.includes(pathname)
}

const { data } = await useAsyncData(() => {
  return queryCollection('work').select('path').first()
})
</script>
