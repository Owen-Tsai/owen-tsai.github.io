interface CommonProps {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}

interface Heading {
  level: number
  text: string
  id: string
}

interface Article {
  title: string
  topic: string[]
  excerpt: string
  date: string
  slug: string
  content?: string
}
