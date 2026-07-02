'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SyntheticEvent,
} from 'react'
import { createPortal } from 'react-dom'
import cn from 'classnames'
import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { gsap } from '@/lib/gsap'
import { XIcon } from 'lucide-react'
import useMounted from '@/hooks/useMounted'

type LightboxImageProps = ImageProps

const getReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const subscribeReducedMotion = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getExplicitSize(
  width?: ImageProps['width'],
  height?: ImageProps['height'],
): { width: number; height: number } | null {
  const w = typeof width === 'number' ? width : Number(width)
  const h = typeof height === 'number' ? height : Number(height)
  if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
    return { width: w, height: h }
  }
  return null
}

export default function LightboxImage({
  className,
  alt,
  width,
  height,
  ...props
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [renderOverlay, setRenderOverlay] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
  const mounted = useMounted()
  const overlayRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const [naturalSize, setNaturalSize] = useState(() => getExplicitSize(width, height))
  const hasSize = naturalSize !== null

  const handleImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      if (hasSize) return
      const img = e.currentTarget
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
    },
    [hasSize],
  )

  const finishCloseRef = useRef(() => {
    gsap.set('body', { overflow: 'auto' })
    triggerRef.current?.focus()
    setRenderOverlay(false)
  })

  const open = useCallback(() => {
    setRenderOverlay(true)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  useEffect(() => {
    if (!renderOverlay) return

    timelineRef.current?.kill()

    if (reducedMotion) {
      if (isOpen) {
        gsap.set(overlayRef.current, { opacity: 1, pointerEvents: 'auto' })
        gsap.set(imageRef.current, { opacity: 1, scale: 1 })
        closeButtonRef.current?.focus()
      } else {
        finishCloseRef.current()
      }
      return
    }

    if (isOpen) {
      gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'auto' })
      gsap.set(imageRef.current, { opacity: 0, scale: 0.96 })

      const tl = gsap.timeline()
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
      tl.to(
        imageRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        '-=0.2',
      )
      timelineRef.current = tl
      closeButtonRef.current?.focus()
    } else {
      const tl = gsap.timeline({ onComplete: () => finishCloseRef.current() })
      tl.to(imageRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.25,
        ease: 'power2.in',
      })
      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
        },
        '<',
      )
      timelineRef.current = tl
    }

    return () => {
      timelineRef.current?.kill()
    }
  }, [isOpen, renderOverlay, reducedMotion])

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  const triggerStyle = hasSize
    ? {
        width: naturalSize.width,
        aspectRatio: `${naturalSize.width}/${naturalSize.height}`,
      }
    : undefined

  const overlayStyle = hasSize
    ? { aspectRatio: `${naturalSize.width}/${naturalSize.height}` }
    : { width: '100%', minHeight: '50vh' }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className={cn(
          'relative block max-w-full cursor-zoom-in bg-transparent border-0 p-0',
          !hasSize && 'w-full min-h-48',
        )}
        style={triggerStyle}
        aria-label={alt ? `Enlarge image: ${alt}` : 'Enlarge image'}
      >
        <Image
          {...props}
          alt={alt ?? ''}
          className={cn('object-contain', className)}
          fill={!hasSize}
          width={hasSize ? naturalSize.width : undefined}
          height={hasSize ? naturalSize.height : undefined}
          sizes={!hasSize ? '100vw' : undefined}
          onLoad={handleImageLoad}
        />
      </button>

      {mounted &&
        renderOverlay &&
        createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
            className={cn(
              'fixed inset-0 z-60 bg-bg-primary/95 backdrop-blur-sm',
              'flex items-center justify-center p-6',
              'opacity-0 pointer-events-none',
            )}
            onClick={close}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              className={cn(
                'absolute top-6 right-6 p-2 rounded-full',
                'text-text-primary hover:bg-bg-secondary transition-colors',
              )}
              aria-label="Close preview"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <div
              className="relative flex flex-col items-center justify-center max-w-full max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
              style={overlayStyle}
            >
              <Image
                ref={imageRef}
                {...props}
                alt={alt ?? ''}
                className="object-contain rounded-lg shadow-2xl"
                fill={!hasSize}
                width={hasSize ? naturalSize.width : undefined}
                height={hasSize ? naturalSize.height : undefined}
                sizes={!hasSize ? '100vw' : undefined}
                onLoad={handleImageLoad}
              />
              {alt && (
                <p className="mt-4 text-caption text-text-secondary text-center max-w-2xl">{alt}</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
