'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import cn from 'classnames'
import { useLoader } from '@/components/Loader/context'
import status from './sitrep'
import style from './about.module.css'

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorX = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const cursorY = useRef<ReturnType<typeof gsap.quickTo> | null>(null)
  const isCursorVisibleRef = useRef(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { isComplete, isReadyForEnter } = useLoader()

  useEffect(() => {
    isCursorVisibleRef.current = hoveredIndex !== null
  }, [hoveredIndex])

  useEffect(() => {
    if (!cursorRef.current) return

    cursorX.current = gsap.quickTo(cursorRef.current, 'x', {
      duration: 0.6,
      ease: 'power3.out',
    })
    cursorY.current = gsap.quickTo(cursorRef.current, 'y', {
      duration: 0.6,
      ease: 'power3.out',
    })
  }, [])

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = (e.target as HTMLElement).closest('.sitrep-item')
    if (!item) {
      setHoveredIndex(null)
      return
    }

    const indexAttr = item.getAttribute('data-index')
    const index = indexAttr ? Number(indexAttr) : null
    if (index !== null) {
      setHoveredIndex((prev) => (prev !== index ? index : prev))
    }

    if (cursorRef.current && cursorX.current && cursorY.current) {
      if (!isCursorVisibleRef.current) {
        gsap.set(cursorRef.current, { x: e.clientX, y: e.clientY })
      }
      cursorX.current(e.clientX)
      cursorY.current(e.clientY)
    }
  }

  const handleGridMouseLeave = () => {
    setHoveredIndex(null)
  }

  // Keep the original heading image animation untouched.
  useGSAP(() => {
    if (!isComplete || !imageRef.current) return

    gsap.to(imageRef.current, {
      width: '20vw',
      opacity: 1,
      duration: 0.5,
      delay: 0.5,
      marginLeft: '1rem',
      marginRight: '1rem',
      ease: 'circ.inOut',
    })
  }, [isComplete])

  // Enter and scroll animations for the rest of the page.
  useGSAP(
    () => {
      gsap.set('.role-label, .intro-text, .bio-text, .sitrep-title, .sitrep-item', {
        opacity: 0,
      })

      if (!isReadyForEnter) return

      const tl = gsap.timeline({
        delay: 0.6,
        defaults: { ease: 'power2.out' },
      })

      tl.fromTo(
        '.role-label',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        0,
      )

      tl.fromTo('.intro-text', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, 0.15)

      gsap.fromTo(
        '.bio-text',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.bio-text',
            start: 'top 85%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.sitrep-title',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.sitrep-title',
            start: 'top 80%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.sitrep-item',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.sitrep-grid',
            start: 'top 80%',
            once: true,
          },
        },
      )

      return () => {
        tl.kill()
      }
    },
    { scope: pageRef, dependencies: [isReadyForEnter] },
  )

  return (
    <div ref={pageRef} className="min-h-screen p-6 pb-[10vh]">
      <div className="mt-[15vh]">
        <h1 className="font-clash uppercase text-display font-black relative flex">
          <span className="heading leading-tight-display inline-block">ab</span>
          <span ref={imageRef} className={cn('w-0 opacity-0', style.image)}></span>
          <span className="heading leading-tight-display inline-block">out</span>
        </h1>
      </div>

      <div className="grid grid-cols-12 mt-[20vh]">
        <div className="md:col-span-4 col-span-12">
          <div className="font-black text-text-primary mix-blend-difference text-right md:pr-[2vw] text-heading flex flex-col leading-tight-heading">
            <span className="role-label font-mono font-normal">engineer</span>
            <span className="role-label font-serif italic font-thin">creator</span>
            <span className="role-label font-slash">myself</span>
          </div>
        </div>
        <div className="col-span-12 md:col-span-8 text-heading mt-8 md:mt-0 font-clash md:pl-[2vw] leading-tight-heading text-text-secondary bg-bg-primary">
          <p className="intro-text indent-[3ch]">
            Hi there. I’m a web developer focusing on the intersection of design, motion, and robust
            engineering architecture. I craft interfaces that feel alive.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 mt-[10vh] md:pr-[2vw] text-text-secondary">
          <p className="bio-text md:text-right">
            我是一名前端工程师。作为产品链中最接近用户的开发者，致力于在理性的代码架构和感性的视觉体验之间寻找平衡。无论是构建复杂的
            SPA，还是探索 WebGL 的前沿美学，我都希望做到克制、精准且充满直觉
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 mt-4 md:mt-[10vh] md:pl-[2vw] text-text-secondary">
          <p className="bio-text">
            在编码之外，我也玩电子游戏。我获得了「艾尔登法环」「黑神话：悟空」等高难度动作游戏的全部成就，但我的游戏喜好囊括了从独立作品到
            3A 系列的几乎所有类型。我甚至还为某游戏提供了中文本地化翻译。
          </p>
          <p className="bio-text mt-4">
            我也花了很多时间读书。我是 J.K. Rowing
            的「哈利·波特」系列粉丝，每年我都会读上一遍！但总的来说，我通常阅读本格推理小说。
          </p>
        </div>
      </div>
      <div className="mt-[10vh]">
        <h2 className="sitrep-title font-clash text-lead font-black">SITREP.</h2>
        <div
          className="sitrep-grid mt-4"
          onMouseMove={handleGridMouseMove}
          onMouseLeave={handleGridMouseLeave}
        >
          {status.map((item, idx) => (
            <div
              key={item.title}
              data-index={idx}
              className="sitrep-item grid grid-cols-12 py-4 border-t border-border-secondary"
            >
              <div className="font-clash text-text-secondary col-span-6 md:col-span-2">
                {item.type}
              </div>
              <div className="text-text-primary text-body col-span-6 md:col-span-4 text-right md:text-left">
                {item.title}
              </div>
              <div className="text-text-secondary col-span-6 md:col-span-4">{item.subtitle}</div>
              <div className="text-text-secondary col-span-6 md:col-span-2 text-right">
                {item.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={cursorRef}
        className={cn(style.cursor, { [style.cursorVisible]: hoveredIndex !== null })}
      >
        {status.map((item, idx) => (
          <img
            key={item.title}
            src={item.image}
            alt=""
            className={cn(style.cursorImage, { [style.cursorImageActive]: hoveredIndex === idx })}
          />
        ))}
      </div>
    </div>
  )
}
