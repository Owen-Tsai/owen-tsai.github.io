'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Link from '../Link'
import FlipText from '../FlipText'
import MobileMenu from '../MobileMenu'
import CursorLabel from '../CursorLabel'
import { useLoader } from '@/components/Loader/context'

export default function Navbar({ className }: CommonProps) {
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const { isReadyForEnter } = useLoader()

  function isActive(path: string) {
    return pathname.startsWith(path)
  }

  function isExactActive(path: string) {
    return pathname === path
  }

  useGSAP(
    () => {
      if (!isReadyForEnter || hasAnimated.current) return
      gsap.set('.link, .disabled-link', { opacity: 0 })
      hasAnimated.current = true

      // enter animation
      const tween1 = gsap.to('.link', {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
      })
      const tween2 = gsap.to('.disabled-link', {
        opacity: 0.4,
        delay: 0.16,
        stagger: 0.08,
        ease: 'none',
      })

      return () => {
        tween1.kill()
        tween1.revert()
        tween2.kill()
        tween2.revert()
      }
    },
    {
      scope: navRef,
      dependencies: [isReadyForEnter],
    },
  )

  return (
    <div
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 z-40 w-full grid grid-cols-2 lg:grid-cols-12 p-6 font-sans font-medium tracking-tight mix-blend-difference text-text-primary',
        className,
      )}
    >
      <div className="col-span-1 lg:col-span-2 font-clash font-black">
        <Link href="/">
          <FlipText text="Owen." />
        </Link>
      </div>

      <div className="col-span-1 lg:hidden flex justify-end">
        <MobileMenu />
      </div>

      <nav className="lg:col-span-7 col-span-2 hidden lg:flex items-center gap-8">
        <Link href="/" className={cn('nav-link link opacity-0', { active: isExactActive('/') })}>
          <FlipText text="Home" allowFlip={!isExactActive('/')} />
        </Link>
        <Link
          href="/writings"
          className={cn('nav-link link opacity-0', { active: isActive('/writings') })}
        >
          <FlipText text="Writings" allowFlip={!isActive('/writings')} />
        </Link>
        <CursorLabel label="coming soon">
          <span
            data-cursor-item
            className="nav-link disabled-link opacity-0 line-through cursor-default"
            aria-disabled="true"
          >
            &nbsp;Play&nbsp;
          </span>
        </CursorLabel>
        <Link
          href="/about"
          className={cn('nav-link link opacity-0', { active: isExactActive('/about') })}
        >
          <FlipText text="About" />
        </Link>
      </nav>

      <div className="hidden lg:col-span-3 col-span lg:flex items-center justify-end gap-6">
        <Link href="https://github.com/Owen-Tsai" target="_blank" className="link opacity-0">
          <FlipText text="Github" />
        </Link>
        <Link href="mailto:owentsai.v@gmail.com" className="link opacity-0">
          <FlipText text="Mail" />
        </Link>
      </div>
    </div>
  )
}
