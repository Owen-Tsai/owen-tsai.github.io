'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { useLoader } from '@/components/Loader/context'
import { setTransitionHandler } from '@/components/Link/registry'

type Phase = 'idle' | 'exiting' | 'entering'

interface ViewTransitionContextValue {
  phase: Phase
  isTransitioning: boolean
}

const ViewTransitionContext = createContext<ViewTransitionContextValue | null>(null)

export function useViewTransition() {
  const ctx = useContext(ViewTransitionContext)
  if (!ctx) {
    throw new Error('useViewTransition must be used within ViewTransition')
  }
  return ctx
}

interface ViewTransitionProps {
  children: React.ReactNode
}

export default function ViewTransition({ children }: ViewTransitionProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const enterTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const skipEnterRef = useRef(false)
  const isFirstPathname = useRef(true)
  const prevPathname = useRef<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const pathname = usePathname()
  const { isComplete } = useLoader()

  const handleTransition = useCallback(
    (navigate: () => void) => {
      // Skip animation during initial load, reduced motion, or when already busy.
      if (!isComplete || phase !== 'idle') {
        exitTimelineRef.current?.kill()
        enterTimelineRef.current?.kill()
        gsap.set(contentRef.current, { clearProps: 'all' })
        gsap.set(overlayRef.current, { opacity: 0 })
        skipEnterRef.current = true
        navigate()
        setPhase('idle')
        return
      }

      setPhase('exiting')

      const tl = gsap.timeline({
        onComplete: () => {
          exitTimelineRef.current = null
          navigate()
          setPhase('entering')
        },
      })

      exitTimelineRef.current = tl

      tl.to(
        contentRef.current,
        {
          opacity: 0,
          filter: 'blur(40px)',
          duration: 0.35,
          ease: 'power2.in',
        },
        0,
      )

      tl.to(
        overlayRef.current,
        {
          opacity: 1,
          duration: 0.25,
          ease: 'power2.in',
        },
        0.15,
      )
    },
    [isComplete, phase],
  )

  // Register the transition handler used by TransitionLink.
  useEffect(() => {
    setTransitionHandler(handleTransition)
    return () => {
      setTransitionHandler(null)
    }
  }, [handleTransition])

  // Run the enter animation whenever the pathname changes.
  useLayoutEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false
      prevPathname.current = pathname
      return
    }

    if (pathname === prevPathname.current) return
    prevPathname.current = pathname

    if (skipEnterRef.current) {
      skipEnterRef.current = false
      exitTimelineRef.current?.kill()
      enterTimelineRef.current?.kill()
      gsap.set(contentRef.current, { clearProps: 'all' })
      gsap.set(overlayRef.current, { opacity: 0 })
      return
    }

    // During initial load the animation was already skipped by the handler.
    if (!isComplete) {
      exitTimelineRef.current?.kill()
      enterTimelineRef.current?.kill()
      gsap.set(contentRef.current, { clearProps: 'all' })
      gsap.set(overlayRef.current, { opacity: 0 })
      return
    }

    gsap.set(contentRef.current, { opacity: 0, filter: 'blur(40px)' })
    gsap.set(overlayRef.current, { opacity: 1 })

    const tl = gsap.timeline({
      onComplete: () => {
        enterTimelineRef.current = null
        setPhase('idle')
      },
    })

    enterTimelineRef.current = tl

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      },
      0,
    )

    tl.to(
      contentRef.current,
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'all',
      },
      0.1,
    )

    return () => {
      tl.kill()
    }
  }, [pathname, isComplete])

  return (
    <ViewTransitionContext.Provider value={{ phase, isTransitioning: phase !== 'idle' }}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-30 bg-bg-primary pointer-events-none opacity-0"
        aria-hidden="true"
      />
      <div ref={contentRef} className="flex flex-col">
        {children}
      </div>
    </ViewTransitionContext.Provider>
  )
}
