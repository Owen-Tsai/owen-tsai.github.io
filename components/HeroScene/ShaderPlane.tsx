'use client'

import { useMemo, useRef, useEffect, RefObject } from 'react'
import * as THREE from 'three'
// import GUI from 'lil-gui'
import { useFrame, useThree, createPortal } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { vertexShader, feedbackFragmentShader, displayFragmentShader } from './shader'
import { THEME } from '@/lib/theme'

interface ShaderPlaneProps {
  mouseRef: RefObject<{ x: number; y: number }>
  targetMouseRef: RefObject<{ x: number; y: number }>
  active?: boolean
}

export default function ShaderPlane({ mouseRef, targetMouseRef, active = true }: ShaderPlaneProps) {
  const { size, gl, camera } = useThree()
  const feedbackScene = useMemo(() => new THREE.Scene(), [])
  const feedbackMatRef = useRef<THREE.ShaderMaterial>(null)
  const displayMatRef = useRef<THREE.ShaderMaterial>(null)

  const readTarget = useFBO({
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    stencilBuffer: false,
    depthBuffer: false,
  })

  const writeTarget = useFBO({
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    stencilBuffer: false,
    depthBuffer: false,
  })

  const readRef = useRef(readTarget)
  const writeRef = useRef(writeTarget)

  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), [])

  const paramsRef = useRef({
    falloff: 0.25,
    alpha: 0.9,
    dissipation: 0.985,
    blurMix: 0.4,
    velocityScale: 0.15,
    revert: false,
    colorDark: THEME.colorDark,
    colorLight: THEME.colorLight,
  })

  const feedbackUniforms = useMemo(
    () => ({
      tMap: { value: null },
      uFalloff: { value: 0.25 },
      uAlpha: { value: 0.9 },
      uDissipation: { value: 0.985 },
      uAspect: { value: 1.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [],
  )

  const displayUniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uEffectiveTime: { value: 0.0 },
      uBlurMix: { value: 0.4 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      tFlow: { value: null },
      uRevert: { value: 0.0 },
      uColorDark: { value: new THREE.Color(THEME.colorDark) },
      uColorLight: { value: new THREE.Color(THEME.colorLight) },
    }),
    [],
  )

  // useEffect(() => {
  //   const params = paramsRef.current
  //   const gui = new GUI({ title: 'Ink Controls' })

  //   gui.add(params, 'falloff', 0.05, 0.5).name('Falloff')
  //   gui.add(params, 'alpha', 0.0, 1.0).name('Alpha')
  //   gui.add(params, 'dissipation', 0.9, 1.0).name('Dissipation')
  //   gui.add(params, 'blurMix', 0.0, 1.0).name('Blur Mix')
  //   gui.add(params, 'velocityScale', 0.05, 0.5).name('Velocity Scale')
  //   gui
  //     .add(params, 'revert')
  //     .name('Invert')
  //     .onChange(() => {
  //       if (displayMatRef.current) {
  //         displayMatRef.current.uniforms.uRevert.value = params.revert ? 1.0 : 0.0
  //       }
  //     })
  //   gui
  //     .addColor(params, 'colorDark')
  //     .name('Dark Color')
  //     .onChange(() => {
  //       if (displayMatRef.current) {
  //         displayMatRef.current.uniforms.uColorDark.value.set(params.colorDark)
  //       }
  //     })
  //   gui
  //     .addColor(params, 'colorLight')
  //     .name('Light Color')
  //     .onChange(() => {
  //       if (displayMatRef.current) {
  //         displayMatRef.current.uniforms.uColorLight.value.set(params.colorLight)
  //       }
  //     })

  //   return () => gui.destroy()
  // }, [])

  const prevMouseRef = useRef({ x: 0.5, y: 0.5 })
  const prevTimeRef = useRef(0)

  // Initialize the flow map to the neutral 0.5 value that the display shader
  // decodes as zero displacement.
  useEffect(() => {
    const restoreColor = gl.getClearColor(new THREE.Color())
    const restoreAlpha = gl.getClearAlpha()

    gl.setClearColor(new THREE.Color(0.5, 0.5, 0.5), 1.0)
    gl.setRenderTarget(readTarget)
    gl.clear()
    gl.setRenderTarget(writeTarget)
    gl.clear()
    gl.setRenderTarget(null)
    gl.setClearColor(restoreColor, restoreAlpha)
  }, [gl, readTarget, writeTarget])

  useFrame(({ clock }) => {
    if (!active || document.visibilityState === 'hidden') return

    const feedbackMat = feedbackMatRef.current
    const displayMat = displayMatRef.current
    if (!feedbackMat || !displayMat) return

    const params = paramsRef.current
    const elapsed = clock.elapsedTime
    const dt = Math.max(elapsed - prevTimeRef.current, 0.001)
    prevTimeRef.current = elapsed

    // Smooth and clamp normalized mouse position.
    const tx = targetMouseRef.current.x / size.width
    const ty = targetMouseRef.current.y / size.height
    const mx = THREE.MathUtils.clamp(mouseRef.current.x + (tx - mouseRef.current.x) * 0.08, 0, 1)
    const my = THREE.MathUtils.clamp(mouseRef.current.y + (ty - mouseRef.current.y) * 0.08, 0, 1)
    mouseRef.current.x = mx
    mouseRef.current.y = my

    // Normalized mouse velocity per second.
    const rawVx = (mx - prevMouseRef.current.x) / dt
    const rawVy = (my - prevMouseRef.current.y) / dt
    prevMouseRef.current.x = mx
    prevMouseRef.current.y = my

    // The display shader decodes the flow texture with:
    //   flowVector = (flow.rg * 2.0 - 1.0) * 0.5
    // so a value of 0.5 produces no displacement. The feedback shader flips
    // the y channel, so pre-flip y here to keep the distortion aligned with
    // the cursor movement.
    const encVx = rawVx * params.velocityScale + 0.5
    const encVy = rawVy * params.velocityScale - 0.5

    feedbackMat.uniforms.tMap.value = readRef.current.texture
    feedbackMat.uniforms.uFalloff.value = params.falloff
    feedbackMat.uniforms.uAlpha.value = params.alpha
    feedbackMat.uniforms.uDissipation.value = params.dissipation
    feedbackMat.uniforms.uAspect.value = size.width / size.height
    feedbackMat.uniforms.uMouse.value.set(mx, my)
    feedbackMat.uniforms.uVelocity.value.set(encVx, encVy)

    gl.setRenderTarget(writeRef.current)
    gl.render(feedbackScene, camera)
    gl.setRenderTarget(null)

    displayMat.uniforms.uTime.value = elapsed
    displayMat.uniforms.uEffectiveTime.value = elapsed
    displayMat.uniforms.uBlurMix.value = params.blurMix
    displayMat.uniforms.uResolution.value.set(size.width, size.height)
    displayMat.uniforms.uMouse.value.set(mx, my)
    displayMat.uniforms.tFlow.value = writeRef.current.texture

    // Swap ping-pong targets.
    const temp = readRef.current
    readRef.current = writeRef.current
    writeRef.current = temp
  })

  return (
    <>
      {createPortal(
        <mesh geometry={geometry}>
          <shaderMaterial
            ref={feedbackMatRef}
            vertexShader={vertexShader}
            fragmentShader={feedbackFragmentShader}
            uniforms={feedbackUniforms}
          />
        </mesh>,
        feedbackScene,
      )}
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={displayMatRef}
          vertexShader={vertexShader}
          fragmentShader={displayFragmentShader}
          uniforms={displayUniforms}
        />
      </mesh>
    </>
  )
}
