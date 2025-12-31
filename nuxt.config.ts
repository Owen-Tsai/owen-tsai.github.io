import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  css: ['~/assets/css/index.css'],

  app: {
    head: {
      title: 'Owen | Web Dev',
    },
  },

  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/icon', '@nuxt/image', '@vueuse/nuxt'],

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'slack-ochin',
            dark: 'houston',
          },
        },
      },
    },
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth',
      linkActiveClass: 'active',
    },
  },
})
