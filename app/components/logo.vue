<template>
  <NuxtLink to="/" class="pointer-events-auto cursor-pointer">
    <h1 class="text-zinc-50 tracking-tighter">Owen, yet another <span ref="targetEl"></span></h1>
  </NuxtLink>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import scrambleText from 'gsap/dist/ScrambleTextPlugin'

gsap.registerPlugin(scrambleText)

const targetEl = useTemplateRef('targetEl')
const tl = gsap.timeline({ repeat: -1 })

const startAnim = () => {
  tl.to(targetEl.value!, {
    scrambleText: {
      text: 'web developer.',
      chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    },
    duration: 1,
  })
    .to(targetEl.value!, {
      scrambleText: {
        text: '',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
      delay: 1,
    })
    .to(targetEl.value!, {
      scrambleText: {
        text: 'game enthusiast.',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
    })
    .to(targetEl.value!, {
      scrambleText: {
        text: '',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
      delay: 1,
    })
    .to(targetEl.value!, {
      scrambleText: {
        text: 'Honkaku lover.',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
    })
    .to(targetEl.value!, {
      scrambleText: {
        text: '',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
      delay: 1,
    })
    .to(targetEl.value!, {
      scrambleText: {
        text: 'fan of Harrry Potter.',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
    })
    .to(targetEl.value!, {
      scrambleText: {
        text: '',
        chars: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
      },
      duration: 1,
      delay: 1,
    })
}

onMounted(() => {
  startAnim()
})

onBeforeUnmount(() => {
  tl.kill()
})
</script>
