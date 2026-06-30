import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import GithubSlugger from 'github-slugger'

const contentDir = path.join(process.cwd(), 'content')

export function getAllSlugs() {
  const files = fs.readdirSync(contentDir)
  return files.filter((file) => file.endsWith('.mdx')).map((file) => file.replace('.mdx', ''))
}

export function getAllArticles(): Article[] {
  const files = fs.readdirSync(contentDir)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))
  const articles: Article[] = mdxFiles
    .map((filename) => {
      const slug = filename.replace('.mdx', '')
      const filePath = path.join(contentDir, filename)
      const contents = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(contents)

      return {
        slug,
        date: data.date,
        excerpt: data.excerpt,
        title: data.title,
        topic: data.topic,
      }
    })
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1))

  return articles
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(contentDir, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContents)

  return {
    slug,
    ...data,
  } as Article
}

export function getHeadingsBySlug(slug: string): Heading[] {
  const filePath = path.join(contentDir, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return []
  }

  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { content } = matter(fileContents)
  const tree = remark().use(remarkGfm).use(remarkMdx).parse(content)
  const headings: Heading[] = []
  const slugger = new GithubSlugger()

  visit(tree, 'heading', (node) => {
    if (node.depth < 2 || node.depth > 4) {
      return
    }

    const text = toString(node)
    const id = slugger.slug(text)

    headings.push({
      level: node.depth,
      text,
      id,
    })
  })

  return headings
}
