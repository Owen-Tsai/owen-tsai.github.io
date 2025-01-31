const useStatus = () => {
  const entries = [
    {
      title: 'Creating',
      icon: 'ri:terminal-window-fill',
      data: [
        {
          name: 'FusionX',
          desc: 'Enterprise level LCDP based on Vue3 and SpringBoot.'
        },
        {
          name: 'Melody',
          desc: 'A desktop graph app for creating mindmaps and graphs.'
        }
      ]
    },
    {
      title: 'Reading',
      icon: 'ri:book-3-fill',
      data: [
        {
          name: '《雍正王朝》',
          desc: 'Yongzheng Dynasty, the sequal of Kangxi Dynasty.'
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
          name: 'Balatro',
          desc: 'An example of how old mechanics can be innovated.'
        }
      ]
    }
  ]

  return entries
}

export default useStatus
