import cn from 'classnames'

function headingSuffix(level: number, isLast?: boolean): string {
  const end = isLast ? '┘' : '┤'
  return ' ' + '─'.repeat(level - 2) + end
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null

  return (
    <nav>
      <ul className="text-right py-4">
        {headings.map((heading, idx) => (
          <li key={heading.id} className={cn('leading-normal')}>
            <a
              href={`#${heading.id}`}
              className="hover:text-text-primary transition-colors duration-200 text-caption font-mono focus:outline-none focus:ring-2 focus:ring-text-primary/50"
            >
              {heading.text}
              {heading.level > 2 &&
                headingSuffix(
                  heading.level,
                  headings[idx + 1] && headings[idx + 1].level !== heading.level,
                )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
