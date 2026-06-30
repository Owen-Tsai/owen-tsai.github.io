import type { ComponentType } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticlePageContent from './ArticlePage'
import { getAllSlugs, getArticleBySlug, getHeadingsBySlug } from '@/lib/content'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    return { title: 'Not Found' }
  }

  return {
    title: article.title,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  const headings = getHeadingsBySlug(slug)

  if (!article) {
    notFound()
  }

  const { default: MDXContent } = (await import(`@/content/writings/${slug}.mdx`)) as {
    default: ComponentType
  }

  return <ArticlePageContent {...article} content={<MDXContent />} headings={headings} />
}
