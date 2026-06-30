import WritingsPage from './WritingsPage'
import { getAllArticles } from '@/lib/content'

export default function Writings() {
  const articles = getAllArticles()
  return <WritingsPage articles={articles} />
}
