'use client'

import { useCallback, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import HeroScene from '@/components/HeroScene'
import HeroTitle from '@/components/HeroTitle'
import Link from '@/components/Link'
import { useLoader } from '@/components/Loader/context'
import { MoveUpRight } from 'lucide-react'

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const { isReadyForEnter, signalReady } = useLoader()

  const handleSceneReady = useCallback(() => {
    signalReady('scene')
  }, [signalReady])

  useGSAP(
    () => {
      gsap.set('.text', { opacity: 0 })
      if (!pageRef.current || !isReadyForEnter) return

      const spans = gsap.utils.toArray<HTMLElement>('.text span')
      const splits: SplitText[] = []
      gsap.set('.text', { opacity: 1 })

      spans.forEach((span) => {
        const split = SplitText.create(span, { type: 'chars' })
        splits.push(split)
        gsap.set(split.chars, { opacity: 0 })
        gsap.to(split.chars, { opacity: 1, ease: 'none', stagger: 0.02 })
      })

      return () => {
        splits.forEach((split) => split.revert())
      }
    },
    {
      scope: pageRef,
      dependencies: [isReadyForEnter],
    },
  )

  return (
    <div ref={pageRef} className="relative h-dvh w-screen">
      <HeroScene onReady={handleSceneReady} />

      <div className="mt-[15vh] grid grid-cols-12 gap-6 p-6 pb-[10vh] font-sans font-normal leading-normal text-text-primary mix-blend-difference">
        <div className="col-span-6 md:col-span-3 lg:col-span-2">
          <p className="text">
            <span>&copy; 2026</span>
          </p>
        </div>
        <div className="col-span-6 md:col-span-3 lg:col-span-3 text-right md:text-left">
          <p className="text">
            <span>Focusing on the intersection</span>
            <br />
            <span>of design, motion and</span>
            <br />
            <span>robust architecture.</span>
            <br />
            <span>Crafting interfaces that feel alive.</span>
          </p>
        </div>
        <div className="col-span-6 md:col-span-3 lg:col-span-3">
          <p className="text">
            <span>Yet another web developer,</span>
            <br />
            <span>honkaku lover,</span>
            <br />
            <span>video game enthusiast,</span>
            <br />
            <span>fan of Harry Potter,</span>
          </p>
        </div>
        <div className="col-span-6 md:col-span-3 lg:col-span-4 flex items-start justify-end">
          <Link href="/about">
            <div className="text-label bg-accent text-accent-text px-2 py-1 inline-flex items-center gap-1">
              我正在寻找工作机会
              <MoveUpRight size={14} />
            </div>
          </Link>
        </div>
      </div>

      <HeroTitle className="absolute bottom-10 right-6 left-6" />
    </div>
  )
}
