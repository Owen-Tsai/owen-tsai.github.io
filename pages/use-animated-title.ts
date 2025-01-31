import gsap from '@/utils/gsap'

const useTitle = (el: Ref<HTMLElement | null>, cursor: Ref<HTMLElement | null>) => {
  const texts = ['Web Developer.', 'Game Enthusiast.', 'Fan of Harry Potter.']

  let tl: gsap.core.Timeline

  onMounted(() => {
    tl = gsap.timeline({ defaults: { duration: 2, ease: 'power2.inOut' } })
    tl.addLabel('start')
      .to(el.value, { text: texts[0], delay: 1 })
      .to(el.value, { text: { value: '', rtl: true }, delay: 2 })
      .to(el.value, { text: texts[1], delay: 1 })
      .to(el.value, { text: { value: '', rtl: true }, delay: 2 })
      .to(el.value, { text: texts[2], delay: 1 })
      .to(el.value, { text: { value: '', rtl: true }, delay: 2 })
      .addLabel('end')

    tl.tweenFromTo('start', 'end', { repeat: -1 })

    gsap.fromTo(cursor.value, { opacity: 0 }, { opacity: 1, repeat: -1, yoyo: true, duration: 0.5 })
  })

  onBeforeUnmount(() => {
    gsap.killTweensOf(cursor.value)
    tl.kill()
  })
}

export default useTitle
