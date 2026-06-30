'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useLoader } from './context'

export default function Loader() {
  const loaderRef = useRef<HTMLDivElement>(null)
  const hasExited = useRef(false)
  const { progress, isReadyToExit, isComplete, markExited } = useLoader()

  useGSAP(() => {
    if (!isReadyToExit || !loaderRef.current || hasExited.current) return

    hasExited.current = true
    gsap.to(loaderRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        if (loaderRef.current) {
          loaderRef.current.style.zIndex = '-999'
          loaderRef.current.style.pointerEvents = 'none'
        }
        markExited()
        gsap.set('body', { overflow: 'auto', height: 'auto' })
      },
    })
  }, [isReadyToExit])

  if (isComplete) return null

  return (
    <div
      ref={loaderRef}
      className="w-screen h-dvh fixed left-0 top-0 z-50 bg-bg-primary text-text-primary"
    >
      <div className="font-medium text-hero font-clash flex flex-col leading-tight-display absolute left-6 bottom-10">
        OWEN
        <br />
        &nbsp;
        <br />
        &nbsp;
      </div>

      <div className="absolute right-6 bottom-10 font-clash text-display leading-tight-display">
        {progress}%
      </div>
    </div>
  )
}
