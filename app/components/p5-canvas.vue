<template>
  <ClientOnly>
    <div ref="canvasRef"></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import P5 from 'p5'

type Sketch = (p5: P5) => void

const { sketch } = defineProps<{
  sketch: Sketch
}>()

const canvasRef = ref<HTMLDivElement>()

let p5Instance: P5 | null = null

// instance mode
onMounted(() => {
  if (canvasRef.value) {
    initP5()
  }
})

onBeforeUnmount(() => {
  disposeP5()
})

const initP5 = () => {
  p5Instance = new P5(sketch, canvasRef.value)
}

const disposeP5 = () => {
  p5Instance?.remove()
  p5Instance = null
}
</script>
