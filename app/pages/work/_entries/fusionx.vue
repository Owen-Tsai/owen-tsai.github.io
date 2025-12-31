<template>
  <div class="bg-black h-full flex items-center justify-center p-4">
    <video autoplay muted loop class="w-full h-full">
      <source :src="fuxVid" type="video/mp4" />
      Not supported
    </video>
  </div>
</template>

<script setup lang="ts">
import fuxVid from '@/assets/img/fux-vid.mp4'
</script>
