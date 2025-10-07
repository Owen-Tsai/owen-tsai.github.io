export const useSlideTween = (
  textRef: Ref<HTMLElement | null>,
  textHoverRef: Ref<HTMLElement | null>
) => {
  const { $gsap } = useNuxtApp()

  let tween: gsap.core.Timeline | null = null

  onMounted(() => {
    tween = $gsap.timeline({ paused: true })
    tween.fromTo(
      textRef.value,
      {
        y: 0,
        scale: 1,
      },
      {
        y: '-120%',
        filter: 'blur(8px)',
        duration: 0.2,
        scale: 0.8,
        opacity: 0,
        ease: 'power1.out',
      }
    )
    tween.fromTo(
      textHoverRef.value,
      {
        y: '120%',
        filter: 'blur(8px)',
        scale: 0.8,
        opacity: 0,
      },
      {
        y: 0,
        filter: 'blur(0px)',
        duration: 0.2,
        opacity: 1,
        scale: 1,
        ease: 'power1.out',
      },
      '<'
    )
  })

  onBeforeUnmount(() => {
    tween?.kill()
  })

  const playTweens = () => {
    tween?.play()
  }

  const reverseTweens = () => {
    tween?.reverse()
  }

  return {
    playTweens,
    reverseTweens,
  }
}
