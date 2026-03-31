import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@vueuse/nuxt', '@nuxt/image', '@nuxt/fonts'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'lucide-vue-next',
        'gsap',
        'gsap/dist/ScrambleTextPlugin', // CJS
        'three',
        'lodash-es',
        'three/addons/loaders/FontLoader.js',
        'three/addons/geometries/TextGeometry.js',
      ],
    },
  },
  fonts: {
    families: [
      { name: 'Space Grotesk', weight: 300 },
      { name: 'Cormorant Garamond', weight: 300 },
      { name: 'Space Mono', weight: [300, 500] },
    ],
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
