'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import ShaderPlane from './ShaderPlane'
import { useThrottle } from '@/hooks/useThrottle'

function SceneReadyGate({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.()
  }, [onReady])
  return null
}

export interface InkSceneProps {
  onReady?: () => void
  active?: boolean
}

export default function InkScene({ onReady, active = true }: InkSceneProps) {
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })
  const [dpr, setDpr] = useState<[number, number]>([1, 2])

  const handleRawPointerMove = useCallback((event: PointerEvent) => {
    targetMouseRef.current.x = event.clientX
    targetMouseRef.current.y = window.innerHeight - event.clientY
  }, [])

  const handlePointerMove = useThrottle(handleRawPointerMove, 16)

  useEffect(() => {
    if (!active) return

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerMove, active])

  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={dpr}
        orthographic
        camera={{ position: [0, 0, 1], near: 0, far: 1 }}
        style={{ width: '100%', height: '100%' }}
      >
        <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr([1, 2])}>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>
        <SceneReadyGate onReady={onReady} />
        <ShaderPlane mouseRef={mouseRef} targetMouseRef={targetMouseRef} active={active} />
      </Canvas>
    </div>
  )
}
