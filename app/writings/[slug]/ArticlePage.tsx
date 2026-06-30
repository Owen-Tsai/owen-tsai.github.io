'use client'

import gsap from 'gsap'
import HeroScene from '@/components/HeroScene'
import { useGSAP } from '@gsap/react'
import { useLoader } from '@/components/Loader/context'
import Link from '@/components/Link'
import { TerminalIcon } from 'lucide-react'
import TableOfContents from './TableOfContents'
import dayjs from 'dayjs'

type ArticlePageProps = Omit<Article, 'content'> & {
  content: React.ReactNode
  headings: Heading[]
}

export default function ArticlePageContent(data: ArticlePageProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:h-dvh h-[50vh] relative lg:w-2/5 lg:sticky lg:top-0 flex-none min-w-0">
        <HeroScene />
        <div className="flex flex-col h-full items-end justify-between mix-blend-difference px-[2vw] pt-[15vh] pb-[6vh]">
          <div className="text-right">
            <h1 className="text-heading leading-[1.2] font-black text-text-primary">
              {data.title}
            </h1>
            <div className="mt-6 font-clash text-caption">
              {dayjs(data.date).format('MMM DD, YYYY')}
            </div>
            <div className="font-clash text-caption">{data.topic.join(' / ')}</div>
          </div>

          <div className="hidden lg:block">
            <div className="text-right uppercase text-text-secondary text-caption font-bold font-clash">
              contents
            </div>
            <div className="max-h-40 overflow-auto no-scrollbar mask-fade-y">
              <TableOfContents headings={data.headings} />
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 min-w-0 flex justify-end">
        <article className="prose prose-invert max-w-full px-10 prose-lg flex-none min-w-0 prose-gray py-[10vh]">
          {data.content}
        </article>
      </div>
    </div>
  )
}
