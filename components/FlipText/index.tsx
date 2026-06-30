import cn from 'classnames'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap, SplitText } from '@/lib/gsap'

interface FlipTextProps extends CommonProps {
  text: string
  allowFlip?: boolean
}

export default function FlipText({ text, className, allowFlip = true }: FlipTextProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(() => {
    if (!wrapper.current) return

    const tl = gsap.timeline({
      defaults: {
        ease: 'circ.inOut',
      },
      paused: true,
    })
    tlRef.current = tl

    const lines = wrapper.current.querySelectorAll('.line')
    const splitLines = Array.from(lines).map((line) => new SplitText(line, { type: 'chars' }))

    splitLines.forEach((split, index) => {
      tl.fromTo(
        split.chars,
        {
          y: 0,
        },
        {
          y: '-100%',
          stagger: 0.02,
          duration: 0.2,
        },
        index * 0.1,
      )
    })

    return () => {
      tl.kill()
      splitLines.forEach((split) => split.revert())
      if (tlRef.current === tl) {
        tlRef.current = null
      }
    }
  })

  function handleMouseEnter() {
    if (allowFlip) {
      tlRef.current?.play()
    }
  }

  function handleMouseLeave() {
    tlRef.current?.reverse()
  }

  return (
    <div
      ref={wrapper}
      className={cn(className, 'relative overflow-hidden')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="line t">{text}</span>
      <span className="line absolute left-0 right-0 top-full">{text}</span>
    </div>
  )
}
