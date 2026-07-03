import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep static export for production builds, but disable it in development so
  // unknown dynamic routes (e.g. /writings/missing-slug) fall back to 404
  // instead of throwing a "missing param in generateStaticParams" error.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: { unoptimized: true },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-gfm'],
    // rehypePlugins: ['rehype-slug', ['@shikijs/rehype', { theme: 'aurora-x' }]],
    rehypePlugins: ['rehype-slug', ['@shikijs/rehype', { theme: 'kanagawa-wave' }]],
  },
})

export default withMDX(nextConfig)
