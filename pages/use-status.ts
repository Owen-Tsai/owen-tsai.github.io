const useStatus = () => {
  const entries = [
    {
      title: 'Creating',
      icon: 'ri:terminal-window-fill',
      data: [
        {
          name: 'FusionX',
          desc: 'Enterprise level LCDP.'
        },
        {
          name: 'Tide UI',
          desc: 'A Vue 3 component library.'
        }
      ]
    },
    {
      title: 'Reading',
      icon: 'ri:book-3-fill',
      data: [
        {
          name: '《The Thursday Murder Club》',
          desc: '周四推理俱乐部'
        }
      ]
    },
    {
      title: 'Playing',
      icon: 'ri:gamepad-fill',
      data: [
        {
          name: 'Gates of Hell: Ostfront',
          desc: 'A tactical strategy game based on WWII.'
        },
        {
          name: 'Kingdom Come: Deliverance 2',
          desc: 'Just finished this masterpiece.'
        }
      ]
    }
  ]

  return entries
}

export default useStatus
