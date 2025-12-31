<template>
  <button
    class="border border-slate-300/40 bg-slate-800/10 backdrop-blur-xs flex items-center justify-center rounded-full p-2 cursor-pointer hover:bg-slate-800/80"
    @click="onClick"
  >
    <Icon name="ri:trophy-line" size="1.6rem" />
  </button>
</template>

<script setup lang="ts">
const { push } = useRouter()

const onClick = () => {
  push('/achievement')
}
</script>
