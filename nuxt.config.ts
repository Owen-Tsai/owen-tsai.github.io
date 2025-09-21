import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    plugins: [tailwindcss()],
  },

  ssr: false,

  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  css: ['~/assets/styles/global.css'],

  app: {
    head: {
      title: 'Owen',
    },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'material-theme-ocean',
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
