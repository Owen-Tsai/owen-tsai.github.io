'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { useLoader } from '@/components/Loader/context'
import Link from '@/components/Link'
import cn from 'classnames'
import HeroScene from '@/components/HeroScene'

export interface NotFoundPageProps {
  backHref: string
  backLabel: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}

export default function NotFoundPage({
  backHref,
  backLabel,
  title = 'Page not found.',
  subtitle = '页面未找到。',
  className,
}: NotFoundPageProps) {
  const pageRef = useRef<HTMLDivElement>(null)
  const { isReadyForEnter } = useLoader()

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const targets = ['.nf-code', '.nf-title', '.nf-subtitle', '.nf-action']

      gsap.set(targets, { opacity: 0 })

      if (!isReadyForEnter) return

      if (prefersReducedMotion) {
        gsap.set(targets, { opacity: 1 })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      gsap.set('.nf-code', { opacity: 1 })
      const split = SplitText.create('.nf-code', {
        type: 'chars',
        charsClass: 'nf-letter',
      })

      tl.fromTo(
        split.chars,
        { opacity: 0, yPercent: 20 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.5,
          stagger: 0.05,
        },
      )
        .fromTo('.nf-title', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
        .fromTo('.nf-subtitle', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .fromTo('.nf-action', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')

      return () => {
        tl.kill()
        tl.revert()
        split.revert()
      }
    },
    { scope: pageRef, dependencies: [isReadyForEnter] },
  )

  return (
    <div
      ref={pageRef}
      className={cn(
        'p-6 min-h-screen pb-[10vh] flex flex-col items-center justify-center text-center',
        className,
      )}
    >
      <h1 className="nf-code font-clash uppercase text-display font-black leading-tight-display text-text-primary mix-blend-difference">
        404
      </h1>
      <p className="nf-title mt-4 text-text-secondary text-body mix-blend-difference">{title}</p>
      <p className="nf-subtitle mt-2 text-text-tertiary text-sm mix-blend-difference">{subtitle}</p>
      <Link
        href={backHref}
        className="nf-action nav-link mt-8 inline-block text-text-primary hover:text-text-secondary transition-colors"
      >
        {backLabel}
      </Link>
      <HeroScene />
    </div>
  )
}
