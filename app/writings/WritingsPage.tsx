'use client'

import { useRef } from 'react'
import { useLoader } from '@/components/Loader/context'
import { gsap, SplitText } from '@/lib/gsap'
import { useGSAP } from '@gsap/react'
import ArticleList from './ArticleList'

interface WritingsPageProps {
  articles: Article[]
}

export default function WritingsPage({ articles }: WritingsPageProps) {
  const { isReadyForEnter } = useLoader()
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // hide the element so the enter animation won't flash
    gsap.set('.heading, .count', { opacity: 0 })
    gsap.set('.entry', { opacity: 0, y: 24 })
    if (!isReadyForEnter) return

    const tl = gsap.timeline({ paused: true })

    gsap.set('.heading, .count', { opacity: 1 })
    const split = SplitText.create('.heading', {
      type: 'chars',
    })

    tl.fromTo(
      split.chars,
      {
        opacity: 0,
        yPercent: -20,
      },
      {
        opacity: 1,
        yPercent: 0,
        ease: 'power2.out',
        duration: 0.5,
        stagger: 0.05,
      },
    )
    tl.fromTo(
      '.count',
      {
        opacity: 0,
        y: 16,
      },
      {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.5,
      },
      '-=0.3',
    )
    tl.fromTo(
      listRef.current?.querySelectorAll('.entry') ?? [],
      {
        opacity: 0,
        y: 24,
      },
      {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        duration: 0.5,
        stagger: 0.08,
      },
      '-=0.2',
    )

    tl.play()

    return () => {
      tl.kill()
      tl.revert()
    }
  }, [isReadyForEnter])

  return (
    <div className="p-6 min-h-screen pb-[10vh]">
      <div className="mt-[15vh]">
        <h1 className="font-clash uppercase font-black relative">
          <span className="heading text-display inline-block leading-tight-display">writings</span>
          <sup className="count font-clash text-2xl md:text-5xl absolute font-extrabold text-text-tertiary">
            ({articles.length})
          </sup>
        </h1>
      </div>

      <ArticleList ref={listRef} articles={articles} className="mt-[10vh]" />
    </div>
  )
}
