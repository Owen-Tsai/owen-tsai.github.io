'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import cn from 'classnames'
import style from './CursorLabel.module.css'

interface CursorLabelProps extends CommonProps {
  label: React.ReactNode | ((hoveredElement: Element | null) => React.ReactNode)
  itemSelector?: string
  offset?: { x?: number; y?: number }
  duration?: number
  ease?: string
}

const CursorLabel = forwardRef<HTMLDivElement, CursorLabelProps>(
  (
    {
      children,
      className,
      label,
      itemSelector = '[data-cursor-item]',
      offset = { x: 16, y: 16 },
      duration = 0.6,
      ease = 'power3.out',
    },
    ref,
  ) => {
    const localRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLDivElement>(null)
    const cursorX = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
    const cursorY = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
    const isVisibleRef = useRef(false)
    const [isVisible, setIsVisible] = useState(false)
    const [activeItem, setActiveItem] = useState<Element | null>(null)

    useEffect(() => {
      isVisibleRef.current = isVisible
    }, [isVisible])

    useEffect(() => {
      if (!cursorRef.current) return

      cursorX.current = gsap.quickTo(cursorRef.current, 'x', {
        duration,
        ease,
      })
      cursorY.current = gsap.quickTo(cursorRef.current, 'y', {
        duration,
        ease,
      })
    }, [duration, ease])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement
      const item = itemSelector ? target.closest(itemSelector) : localRef.current
      const isHovering = !!item

      if (isVisible !== isHovering) {
        setIsVisible(isHovering)
      }

      setActiveItem((prev) => (prev === item ? prev : item))

      if (!isHovering || !cursorRef.current || !cursorX.current || !cursorY.current) return

      const x = e.clientX + (offset.x ?? 16)
      const y = e.clientY + (offset.y ?? 16)

      if (!isVisibleRef.current) {
        gsap.set(cursorRef.current, { x, y })
      }

      cursorX.current(x)
      cursorY.current(y)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      setActiveItem(null)
    }

    return (
      <div
        ref={(node) => {
          localRef.current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn(className, style.container)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <div ref={cursorRef} className={cn(style.cursor, { [style.cursorVisible]: isVisible })}>
          {typeof label === 'function'
            ? label(activeItem)
            : typeof label === 'string'
              ? <span className={style.label}>{label}</span>
              : label}
        </div>
      </div>
    )
  },
)

CursorLabel.displayName = 'CursorLabel'

export default CursorLabel
