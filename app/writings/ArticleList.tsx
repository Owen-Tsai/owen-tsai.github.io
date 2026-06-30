'use client'

import Link from '@/components/Link'
import CursorLabel from '@/components/CursorLabel'
import { padStart } from 'lodash-es'
import { TerminalIcon } from 'lucide-react'
import cn from 'classnames'
import { forwardRef } from 'react'

interface ArticleListProps extends CommonProps {
  articles: Article[]
  cursorLabel?: React.ReactNode | false
}

const ArticleList = forwardRef<HTMLDivElement, ArticleListProps>(({ articles, className }, ref) => {
  const content = (
    <>
      {articles.map((item, idx) => (
        <Link
          href={`/writings/${item.slug}`}
          key={item.slug}
          data-cursor-item
          data-slug={item.slug}
          className="entry grid grid-cols-12 border-t border-t-border-primary py-10 group bg-bg-primary hover:bg-transparent"
        >
          <div className="font-mono hidden md:block col-span-2 text-text-tertiary text-caption">
            {padStart(`${idx + 1}`, 2, '0')}
          </div>
          <div className="col-span-11 md:col-span-7">
            <div className="flex items-center text-text-tertiary gap-4 text-caption">
              <span>{item.date}</span>
              <span className="dot"></span>
              <span className="uppercase">{item.topic.join(' / ')}</span>
            </div>
            <h2 className="font-black text-lead mt-4 text-text-secondary group-hover:text-text-primary leading-tight-heading">
              {item.title}
            </h2>
            <p className="mt-4 text-text-tertiary text-body">{item.excerpt}</p>
          </div>
          <div className="hidden md:block col-span-3"></div>
        </Link>
      ))}
    </>
  )

  const cursorLabel = (hoveredElement: Element | null) => {
    const slug = hoveredElement?.getAttribute('data-slug') ?? 'slug'
    return (
      <div className="inline-flex items-center gap-1">
        <TerminalIcon size={16} />
        <span className="font-mono leading-0 text-sm">cd ./{slug}</span>
      </div>
    )
  }

  return (
    <CursorLabel ref={ref} className={cn(className, 'relative')} label={cursorLabel}>
      {content}
    </CursorLabel>
  )
})

ArticleList.displayName = 'ArticleList'

export default ArticleList
