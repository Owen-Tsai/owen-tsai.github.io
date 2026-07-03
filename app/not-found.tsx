import type { Metadata } from 'next'
import NotFoundPage from '@/app/NotFoundPage'

export const metadata: Metadata = {
  title: 'Not Found | Owen',
}

export default function NotFound() {
  return (
    <NotFoundPage
      backHref="/"
      backLabel="Back home / 返回首页"
      title="Page not found."
      subtitle="页面未找到。"
    />
  )
}
