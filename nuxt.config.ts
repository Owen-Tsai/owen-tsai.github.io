import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  hooks: {
    'build:done': () => {
      setTimeout(() => {
        process.exit(0)
      }, 5000)
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@vueuse/nuxt', '@nuxt/image'],
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
  css: ['~/styles/index.css'],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'houston',
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
