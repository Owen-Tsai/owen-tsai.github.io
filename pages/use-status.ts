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
          name: 'Melody',
          desc: 'Desktop app for creating mindmaps and graphs.'
        }
      ]
    },
    {
      title: 'Reading',
      icon: 'ri:book-3-fill',
      data: [
        {
          name: '《乾隆王朝》',
          desc: 'Qianlong Dynasty, the sequal of Kangxi Dynasty and Yongzheng Dynasty.'
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
          desc: 'History game based on Medieval.'
        }
      ]
    }
  ]

  return entries
}

export default useStatus
