'use client'

import { forwardRef } from 'react'
import cn from 'classnames'
import { ArrowUpRight } from 'lucide-react'
import TransitionLink from '@/components/Link'

export interface MdxLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

const isExternal = (href: string) => /^https?:\/\//.test(href)

const MdxLink = forwardRef<HTMLAnchorElement, MdxLinkProps>(
  ({ href, children, className, ...rest }, ref) => {
    if (isExternal(href)) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn('inline-flex items-baseline gap-1', className)}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        >
          {children}
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
        </a>
      )
    }

    return (
      <TransitionLink ref={ref} href={href} className={className} {...rest}>
        {children}
      </TransitionLink>
    )
  },
)

MdxLink.displayName = 'MdxLink'

export default MdxLink
