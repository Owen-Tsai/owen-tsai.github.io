import type { MDXComponents } from 'mdx/types'
import Callout from '@/components/Callout'
import LightboxImage from '@/components/LightboxImage'
import MdxLink from '@/components/MdxLink'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    img: LightboxImage,
    a: MdxLink,
  }
}
