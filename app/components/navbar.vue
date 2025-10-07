<template>
  <header class="flex items-center justify-center mix-blend-difference">
    <div
      class="px-(--view-padding) pt-(--view-padding) w-full mx-auto flex items-center justify-between"
    >
      <Logo />
      <ClientOnly>
        <nav v-if="!isMobile" class="flex items-center gap-8 font-[montserrat] font-medium">
          <NavLink to="/" label="Home" class="indicator-dot" />
          <NavLink to="/blog" label="Blog" class="indicator-dot" :class="{ active: isActive }" />
          <NavLink to="/about" label="About" class="indicator-dot" />
          <NavLink to="https://github.com/Owen-Tsai" label="Github" />
        </nav>
        <HamMenu v-else />
      </ClientOnly>
    </div>
  </header>
</template>

<script setup lang="ts">
const { path } = toRefs(useRoute())

const isActive = computed(() => path.value.includes('/blog/'))
</script>
