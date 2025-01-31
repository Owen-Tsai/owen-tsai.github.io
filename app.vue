<template>
  <div class="view relative">
    <div class="m-6 absolute md:fixed top-0 left-0">
      <NuxtLink to="/">
        <Logo size="4.5rem" />
      </NuxtLink>
    </div>

    <nav class="flex gap-8 items-center justify-end p-10">
      <NuxtLink class="link" to="/">About</NuxtLink>
      <NuxtLink class="link" to="/posts">Blog</NuxtLink>
      <!-- <NuxtLink class="link" to="/projects">Projects</NuxtLink> -->
      <NuxtLink class="leading-0 link" to="https://github.com/owen-tsai" target="_blank">
        <Icon name="ri:github-line" size="1.2rem" />
      </NuxtLink>
      <NuxtLink class="leading-0 cursor-pointer link" @click="toggleDark()">
        <Icon :name="isDark ? 'ri:sun-line' : 'ri:moon-line'" size="1.2rem" />
      </NuxtLink>
    </nav>

    <main class="mx-auto max-w-prose py-10 px-8 box-content">
      <NuxtLoadingIndicator color="repeating-linear-gradient(to right, #E5E7EB 0%, #374151 100%)" />
      <NuxtPage />

      <p class="prose mt-8 text-muted">
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
          class="text-muted"
          target="_blank"
          >CC BY-NC-SA 4.0</a
        >
        &copy; Owen 2025
      </p>
    </main>

    <ScrollTop class="fixed bottom-8 right-8" />
  </div>
</template>

<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<style lang="scss" scoped>
nav {
  @apply 1.2rem;
  .link {
    @apply opacity-60 transition-opacity duration-200 ease-in-out;
    &:hover {
      @apply opacity-100;
    }
  }
}
</style>

