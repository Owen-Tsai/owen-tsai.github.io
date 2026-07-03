import NotFoundPage from '@/app/NotFoundPage'

export default function NotFound() {
  return (
    <NotFoundPage
      backHref="/writings"
      backLabel="Back to writings / 返回文章列表"
      title="Article not found."
      subtitle="文章未找到。"
    />
  )
}
