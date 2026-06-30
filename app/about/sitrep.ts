interface StatusEntry {
  title: string
  subtitle: string
  type: 'reading' | 'playing' | 'creating'
  image: string
  author: string
}

const status: StatusEntry[] = [
  {
    title: 'File 23: 本所七大不可思议',
    subtitle: 'The Seven Mysteries of Honjo',
    author: 'SQUARE ENIX',
    type: 'playing',
    image: '/img/_status/1.png',
  },
  {
    title: '007 初露锋芒',
    subtitle: '007 First Light',
    author: 'IO Interactive',
    type: 'playing',
    image: '/img/_status/2.png',
  },
  {
    title: '里斯本围城记',
    subtitle: 'História do cerco de Lisboa',
    author: '[葡]若泽·萨拉马戈',
    type: 'reading',
    image: '/img/_status/3.png',
  },
  {
    title: '恐怖呢喃',
    subtitle: '天使の轉り',
    author: '[日]贵志佑介',
    type: 'reading',
    image: '/img/_status/4.png',
  },
]

export default status
