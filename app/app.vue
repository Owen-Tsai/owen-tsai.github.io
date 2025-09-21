<template>
  <div class="bg-neutral-950 text-neutral-200 h-auto relative">
    <div class="relative max-w-[var(--max-width-view)] mx-auto w-full flex flex-col min-h-screen">
      <Navbar class="flex-none sticky top-0 min-h-0" />
      <NuxtPage class="flex-grow min-h-0" />
    </div>
    <ScrollTop class="bottom-12 right-8 fixed" />
  </div>
</template>
