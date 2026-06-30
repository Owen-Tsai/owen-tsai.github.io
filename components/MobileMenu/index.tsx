'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import cn from 'classnames'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { useLoader } from '@/components/Loader/context'
import Link from '@/components/Link'
import useMounted from '@/hooks/useMounted'

interface MobileMenuProps {
  className?: string
}

export default function MobileMenu({ className }: MobileMenuProps) {
  const [visible, setVisible] = useState(false)
  const mounted = useMounted()
  const overlayRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const { isComplete } = useLoader()
  const isCompleteRef = useRef(isComplete)

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  useEffect(() => {
    isCompleteRef.current = isComplete
  }, [isComplete])

  // If the loader finishes while the menu is open, re-assert the scroll lock.
  useLayoutEffect(() => {
    if (visible) {
      gsap.set('body', { overflow: 'hidden' })
    }
  }, [visible, isComplete])

  useGSAP(
    () => {
      if (!overlayRef.current || !linksRef.current) return

      if (visible) {
        gsap.set('body', { overflow: 'hidden' })
        gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'auto' })
        gsap.set(linksRef.current.children, { opacity: 0, y: 24 })

        const tl = gsap.timeline()
        tl.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
        tl.to(
          linksRef.current.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '-=0.15',
        )
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            if (isCompleteRef.current) {
              gsap.set('body', { overflow: 'auto' })
            }
            gsap.set(overlayRef.current, { pointerEvents: 'none' })
          },
        })
      }
    },
    { dependencies: [visible] },
  )

  // Restore body scroll if the component unmounts while the menu is open.
  useEffect(() => {
    return () => {
      if (isCompleteRef.current) {
        gsap.set('body', { overflow: 'auto' })
      }
    }
  }, [])

  return (
    <>
      <div className={cn(className)}>
        <button
          className="relative bg-accent text-accent-text text-label inline-flex items-center justify-center px-2 py-1 font-sans font-medium min-w-11 min-h-11"
          onClick={open}
        >
          MENU
        </button>
      </div>

      {mounted &&
        createPortal(
          <div
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-bg-primary opacity-0 pointer-events-none flex flex-col p-6"
            onClick={close}
          >
            <div className="flex justify-end">
              <button
                className="bg-accent text-accent-text text-label inline-flex items-center justify-center px-2 py-1 font-sans font-medium min-w-11 min-h-11"
                onClick={close}
              >
                CLOSE
              </button>
            </div>

            <div
              ref={linksRef}
              className="flex-1 flex flex-col items-center justify-center gap-6 font-clash text-heading font-black text-text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Link href="/" onClick={close}>
                Home
              </Link>
              <Link href="/writings" onClick={close}>
                Writings
              </Link>
              <Link href="/play" onClick={close}>
                Play
              </Link>
              <Link href="/about" onClick={close}>
                About
              </Link>
              <Link
                href="https://github.com/Owen-Tsai"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
              >
                Github
              </Link>
              <Link href="mailto:hello@example.com" onClick={close}>
                Mail
              </Link>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
