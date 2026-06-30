import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="p-6 min-h-screen pb-[10vh] flex flex-col items-center justify-center text-center">
      <h1 className="font-clash uppercase text-display font-black text-text-primary">
        404
      </h1>
      <p className="mt-4 text-text-secondary text-body">文章未找到。</p>
      <Link
        href="/writings"
        className="nav-link mt-8 inline-block text-text-primary hover:text-text-secondary transition-colors"
      >
        返回文章列表
      </Link>
    </div>
  )
}
