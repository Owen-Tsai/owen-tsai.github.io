'use client'

import cn from 'classnames'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { useLoader } from '../Loader/context'

export default function HeroTitle(props: CommonProps) {
  const { isReadyForEnter } = useLoader()

  useGSAP(() => {
    gsap.set('.title-text', { opacity: 0 })
    if (!isReadyForEnter) return
    const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } })
    const lines = gsap.utils.toArray<HTMLSpanElement>('.title-text')
    const splits = SplitText.create(lines, {
      type: 'chars',
      charsClass: 'letter',
    })

    const createdWrappers: HTMLDivElement[] = []

    // create dummy elements for rotationY effects
    splits.chars.forEach((charEl) => {
      const random = Math.floor(Math.random() * 4) + 1
      const innerEl = document.createElement('div')
      innerEl.className = 'inner'
      const text = charEl.textContent ?? ''
      charEl.innerHTML = ''
      charEl.appendChild(innerEl)
      createdWrappers.push(innerEl)

      for (let i = 0; i < random; i++) {
        const span = document.createElement('span')
        span.textContent = text
        innerEl.appendChild(span)
      }
    })

    gsap.set('.title-text', { opacity: 1 })
    tl.set(createdWrappers, { opacity: 0 })

    tl.to(createdWrappers, {
      yPercent: (i, target) => -(target.children.length - 1) * 100,
      opacity: 1,
      duration: 1.5,
      stagger: {
        each: 0.03,
        from: 'start',
      },
    })

    return () => {
      tl.kill()
      createdWrappers.forEach((el) => el.remove())
      splits.revert()
    }
  }, [isReadyForEnter])

  return (
    <h1
      className={cn(
        'title font-medium text-hero font-clash flex flex-col leading-tight-display text-text-primary mix-blend-difference uppercase',
        props.className,
      )}
    >
      <span className="w-full flex items-center justify-between">
        <span>owen</span>
        <span className="title-text">crafts</span>
      </span>
      <span className="text-right title-text">atomspheric</span>
      <span className="text-right title-text">experiences</span>
    </h1>
  )
}
