import { useRef, useCallback, useEffect } from 'react'

export function useThrottle<T extends (...args: never[]) => unknown>(fn: T, limitMs: number): T {
  const lastCallRef = useRef(0)
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current)
        pendingRef.current = null
      }
    }
  }, [])

  const throttled = useCallback(
    (...args: unknown[]) => {
      const now = Date.now()
      if (now - lastCallRef.current >= limitMs) {
        lastCallRef.current = now
        if (pendingRef.current) {
          clearTimeout(pendingRef.current)
          pendingRef.current = null
        }
        fn(...(args as Parameters<T>))
      } else if (!pendingRef.current) {
        pendingRef.current = setTimeout(
          () => {
            lastCallRef.current = Date.now()
            pendingRef.current = null
            fn(...(args as Parameters<T>))
          },
          limitMs - (now - lastCallRef.current),
        )
      }
    },
    [fn, limitMs],
  )

  return throttled as unknown as T
}
