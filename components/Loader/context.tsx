'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import gsap from 'gsap'

interface LoaderContextValue {
  progress: number
  isLoading: boolean
  isComplete: boolean
  isReadyToExit: boolean
  isTransitioning: boolean
  isTransitionExited: boolean
  isReadyForEnter: boolean
  signalReady: (key: string) => void
  markExited: () => void
  startTransition: () => void
  markTransitionExited: () => void
}

const LoaderContext = createContext<LoaderContextValue>({
  progress: 0,
  isLoading: true,
  isComplete: false,
  isReadyToExit: false,
  isTransitioning: false,
  isTransitionExited: true,
  isReadyForEnter: false,
  signalReady: () => {},
  markExited: () => {},
  startTransition: () => {},
  markTransitionExited: () => {},
})

export const useLoader = () => useContext(LoaderContext)

const BASE_REQUIRED_KEYS = ['fonts', 'window']
const MIN_VISIBLE_MS = 1200

let globalLoaderCompleted = false

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(globalLoaderCompleted ? 100 : 0)
  const progressRef = useRef(globalLoaderCompleted ? 100 : 0)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  const [readySignals, setReadySignals] = useState<Set<string>>(new Set())
  const [registeredSignals, setRegisteredSignals] = useState<Set<string>>(new Set())
  const [minimumElapsed, setMinimumElapsed] = useState(globalLoaderCompleted)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isComplete, setIsComplete] = useState(globalLoaderCompleted)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isTransitionExited, setIsTransitionExited] = useState(true)

  const progressTweenRef = useRef<gsap.core.Tween | null>(null)
  const finalTweenRef = useRef<gsap.core.Tween | null>(null)

  const signalReady = useCallback((key: string) => {
    setRegisteredSignals((prev) => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
    setReadySignals((prev) => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const markExited = useCallback(() => {
    globalLoaderCompleted = true
    setIsComplete(true)
    setIsTransitionExited(true)
  }, [])

  const startTransition = useCallback(() => {
    setIsTransitioning(true)
    setIsTransitionExited(false)
  }, [])

  const markTransitionExited = useCallback(() => {
    setIsTransitioning(false)
    setIsTransitionExited(true)
  }, [])

  useEffect(() => {
    if (globalLoaderCompleted) return

    const minTimer = setTimeout(() => setMinimumElapsed(true), MIN_VISIBLE_MS)

    document.fonts.ready.then(() => signalReady('fonts'))

    if (document.readyState === 'complete') {
      queueMicrotask(() => signalReady('window'))
    } else {
      window.addEventListener('load', () => signalReady('window'), { once: true })
    }

    const obj = { value: 0 }
    progressTweenRef.current = gsap.to(obj, {
      value: 95,
      duration: 2.5,
      ease: 'none',
      onUpdate: () => setProgress(Math.round(obj.value)),
    })

    return () => {
      clearTimeout(minTimer)
      progressTweenRef.current?.kill()
      finalTweenRef.current?.kill()
    }
  }, [signalReady])

  useEffect(() => {
    if (globalLoaderCompleted || isComplete || isCompleting) return

    const baseReady = BASE_REQUIRED_KEYS.every((key) => readySignals.has(key))
    const registeredReady = Array.from(registeredSignals).every((key) => readySignals.has(key))
    if (!baseReady || !registeredReady || !minimumElapsed) return

    queueMicrotask(() => {
      setIsCompleting(true)
      progressTweenRef.current?.kill()

      const obj = { value: progressRef.current }
      finalTweenRef.current = gsap.to(obj, {
        value: 100,
        duration: 0.3,
        ease: 'none',
        onUpdate: () => setProgress(Math.round(obj.value)),
      })
    })
  }, [readySignals, registeredSignals, minimumElapsed, isComplete, isCompleting])

  const value = useMemo(
    () => ({
      progress,
      isLoading: !isComplete,
      isComplete,
      isReadyToExit: isCompleting,
      isTransitioning,
      isTransitionExited,
      isReadyForEnter: isComplete && isTransitionExited,
      signalReady,
      markExited,
      startTransition,
      markTransitionExited,
    }),
    [
      progress,
      isComplete,
      isCompleting,
      isTransitioning,
      isTransitionExited,
      signalReady,
      markExited,
      startTransition,
      markTransitionExited,
    ],
  )

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
}
