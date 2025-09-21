<template>
  <div ref="wrapper" class="p-2" @mouseenter="enter" @mousemove="move" @mouseleave="leave">
    <div
      class="relative border-neutral-200 bg-neutral-950 border text-lg rounded-full inline-block mix-blend-difference overflow-hidden"
    >
      <a
        :href="to"
        :target="target"
        class="w-full h-full px-6 py-2 inline-block mix-blend-difference"
      >
        <slot></slot>
      </a>
      <div ref="el" class="absolute left-0 top-0 w-full h-full rounded bg-neutral-200 -z-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

const { to, target = '' } = defineProps<{
  to: string
  target?: string
}>()

const el = useTemplateRef('el')
const wrapper = useTemplateRef<HTMLElement>('wrapper')

const { x, y } = useMouse({ target: wrapper })
const { width, height, left, top } = useElementBounding(wrapper)

let tween: gsap.core.Tween | undefined = undefined

onMounted(() => {
  gsap.set(el.value, {
    y: '100%',
  })
  tween = gsap.to(el.value, {
    y: 0,
    duration: 0.3,
    scale: 1,
    ease: 'power4.inOut',
    paused: true,
  })
})

onBeforeUnmount(() => {
  tween?.kill()
})

const enter = () => {
  if (wrapper.value) {
    tween?.play()
  }
  move()
}

const leave = () => {
  tween?.reverse()

  gsap.to(wrapper.value, {
    x: 0,
    y: 0,
    ease: 'power1.inOut',
  })
}

const move = () => {
  // 确保元素尺寸已正确获取
  const relX = x.value - left.value - width.value / 2
  const relY = y.value - top.value - height.value / 2
  const moveX = magnize(relX)
  const moveY = magnize(relY)

  if (Math.abs(moveX) > 1 || Math.abs(moveY) > 1) {
    return
  }

  gsap.to(wrapper.value, {
    x: moveX * relX,
    y: moveY * relY,
  })
}

const magnize = (val: number) => {
  const dist = gsap.utils.normalize(0, width.value, Math.abs(val))
  const interpolate = gsap.utils.interpolate([1, 0.4, 0], dist)
  return interpolate
}
</script>
