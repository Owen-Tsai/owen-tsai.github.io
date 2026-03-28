<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 mix-blend-difference p-6 md:p-12 flex justify-between items-start pointer-events-none"
  >
    <Logo />
    <div class="flex flex-col items-end space-y-2 pointer-events-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.id"
        :to="`/${item.id}`"
        class="text tracking-widest uppercase transition-colors duration-300 hover:text-zinc-50 text-zinc-400"
        active-class="router-active"
      >
        {{ item.label }}
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { id: '', label: 'HOME' },
  { id: 'writing', label: 'Writing' },
  { id: 'about', label: 'About' },
]
</script>
