'use client'

import { forwardRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import cn from 'classnames'
import { navigateWithTransition } from './registry'
import type { LinkProps } from 'next/link'

interface TransitionLinkProps extends Omit<LinkProps, 'href'> {
  href: string
  className?: string
  children: React.ReactNode
  target?: string
  rel?: string
}

const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ href, children, className, replace, scroll, onClick, target, rel, ...rest }, ref) => {
    const router = useRouter()
    const pathname = usePathname()

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e)

        const isModified =
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.nativeEvent.button === 1
        const target = e.currentTarget.getAttribute('target')
        if (isModified || (target && target !== '_self')) return

        let url: URL
        try {
          url = new URL(href, window.location.href)
          if (url.origin !== window.location.origin) return
        } catch {
          return
        }

        // Only animate when moving to a different page. Clicking a link that
        // points to the current pathname (including query/hash variants) should
        // behave like a normal link and not run the exit transition.
        if (url.pathname === pathname) return

        e.preventDefault()

        const navigate = () => {
          if (replace) {
            router.replace(href, { scroll: scroll ?? true })
          } else {
            router.push(href, { scroll: scroll ?? true })
          }
        }

        navigateWithTransition(navigate)
      },
      [href, replace, scroll, onClick, router, pathname],
    )

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        className={cn(className)}
        replace={replace}
        scroll={scroll}
        target={target}
        rel={rel}
        {...rest}
      >
        {children}
      </Link>
    )
  },
)

TransitionLink.displayName = 'TransitionLink'

export default TransitionLink
