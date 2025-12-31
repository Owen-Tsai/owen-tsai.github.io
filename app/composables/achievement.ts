export const ACHIEVEMENTS: Record<string, Achievement> = {
  randomDistort: {
    id: 'randomDistort',
    name: 'Wild Magic',
    description: 'Random, but has a pattern',
    trigger: 'Press D to randomly distort the text on the home page',
  },
  distort: {
    id: 'distort',
    name: 'Action Surge',
    description: 'Not that hard, huh?',
    trigger: 'Use mouse to distort the text on the home page',
  },
  about: {
    id: 'about',
    name: "Devil's Sight",
    description: 'Oops, you spotted me.',
    trigger: 'Navigated to the about page',
  },
  blog: {
    id: 'blog',
    name: 'Scroll of Detect Thoughts',
    description: 'You just read my thoughts',
    trigger: 'Read a blog post',
  },
  workTree: {
    id: 'workTree',
    name: 'Plant Growth',
    description: 'Make weeds burst',
    trigger: 'Re-generated a tree',
  },
  github: {
    id: 'github',
    name: "Prey's Scent",
    description: 'Can smell bugs, but mostly create them',
    trigger: 'Visited my GitHub profile',
  },
  revisit: {
    id: 'revisit',
    name: 'Long Rest',
    description: '-80 Camp Supplies',
    trigger: 'Revisited my site after 12 hours',
  },
  lowBattery: {
    id: 'lowBattery',
    name: 'Draining Kiss',
    description: 'Better take a rest, now',
    trigger: 'Visited my site with less than 20% battery',
  },
  idle: {
    id: 'idle',
    name: 'Backbreaker',
    description: 'Get back on your feet!',
    trigger: 'Have been idle for 5 minutes',
  },
}

const detectAchievements = (unlock: (id: string) => void) => {
  // idle
  const { idle } = useIdle()
  const idleWatch = watch(idle, (newVal, oldVal) => {
    if (newVal === true && oldVal === false) {
      unlock('idle')
      idleWatch()
    }
  })

  // battery
  const { isSupported, level } = useBattery()
  if (isSupported.value && level.value < 0.2) {
    unlock('lowBattery')
  }

  // timer
  const lastVisitTime = useLocalStorage('lastVisitTime', 0)
  const currentTime = Date.now()
  if (lastVisitTime.value !== 0 && currentTime - lastVisitTime.value > 12 * 60 * 60 * 1000) {
    unlock('revisit')
  }
  lastVisitTime.value = currentTime
}

export const useAchievements = () => {
  const unlockedIds = useState<Set<string>>('unlockedIds', () => new Set())
  const achievementsToDisplay = useState<Achievement[]>('achievementsToDisplay', () => [])
  const storage = useLocalStorage<string[]>('achievements', [])

  const isUnlocked = (id: string) => {
    return unlockedIds.value.has(id)
  }

  const unlock = (id: string) => {
    if (!isUnlocked(id)) {
      unlockedIds.value.add(id)
      achievementsToDisplay.value.push(ACHIEVEMENTS[id]!)
    }
    storage.value = Array.from(unlockedIds.value || [])
    // remove from the displayed list after 3000 ms
    setTimeout(() => {
      achievementsToDisplay.value = achievementsToDisplay.value.filter(
        (achievement) => achievement.id !== id
      )
    }, 3000)
  }

  const load = () => {
    unlockedIds.value = new Set(storage.value.filter((id) => ACHIEVEMENTS[id]))
  }

  load()
  detectAchievements(unlock)

  return {
    isUnlocked,
    unlockedIds,
    achievementsToDisplay,
    unlock,
    load,
  }
}
