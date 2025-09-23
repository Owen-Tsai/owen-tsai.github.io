<template>
  <Teleport v-if="loading && appState.isInitialLoad" to="body">
    <div
      class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-102 flex-col gap-2 pb-10"
    >
      <div>LOADING</div>
      <div class="text-6xl font-black font-mono">
        {{ percentage < 10 ? '0' + percentage : percentage }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const percentage = ref(0)

const loading = defineModel<boolean>('loading')
let intervalId: NodeJS.Timeout | null = null

const appState = useAppStates()

const inc = () => {
  if (percentage.value >= 100) {
    return
  }
  if (percentage.value >= 90) {
    percentage.value += Math.floor(((100 - percentage.value) / 2) * Math.random())
    return
  }
  percentage.value += Math.floor(Math.random() * 10)
}

const done = () => {
  percentage.value = 100
  appState.value.isInitialLoad = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

watch(
  () => loading.value,
  (newVal) => {
    if (newVal === false) {
      done()
    }
  },
)

onMounted(() => {
  if (!appState.value.isInitialLoad) {
    return
  }
  intervalId = setInterval(() => {
    inc()
  }, 500)
})
</script>
