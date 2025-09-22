<template>
  <div ref="canvasRef"></div>
</template>

<script setup lang="ts">
import type P5 from 'p5'

type Sketch = (p5: P5) => void

const { $p5 } = useNuxtApp()

const { sketch } = defineProps<{
  sketch: Sketch
}>()

const canvasRef = ref<HTMLDivElement>()

let p5Instance: any | null = null

// instance mode
// onMounted(async () => {
//   const P5 = await import('p5')
//   if (canvasRef.value) {
//     p5Instance = new P5.default(sketch, canvasRef.value)
//   }
// })

onMounted(() => {
  console.log($p5)
  if (canvasRef.value) {
    p5Instance = new $p5(sketch, canvasRef.value)
  }
})

onBeforeUnmount(() => {
  disposeP5()
})

const disposeP5 = () => {
  p5Instance?.remove()
  p5Instance = null
}
</script>
