<template>
  <div ref="canvasEl"></div>
</template>

<script setup lang="ts">
import type P5 from 'p5'

type Sketch = (p5: P5) => void

const { sketch } = defineProps<{
  sketch: Sketch
}>()

const canvasEl = useTemplateRef('canvasEl')
const { $p5 } = useNuxtApp()

let p5Instance: P5 | null = null

onMounted(() => {
  if (canvasEl.value) {
    p5Instance = new $p5(sketch, canvasEl.value)
  }
})

onBeforeUnmount(() => {
  if (p5Instance) {
    p5Instance.remove()
    p5Instance = null
  }
})
</script>
