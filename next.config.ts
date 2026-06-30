import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
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
