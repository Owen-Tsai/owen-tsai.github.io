// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/styles/global.scss',
    'custom-vue-scrollbar/dist/style.css',
  ],

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
    '@unocss/nuxt',
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
