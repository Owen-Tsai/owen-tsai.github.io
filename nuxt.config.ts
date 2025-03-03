import { resolve } from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  app: {
    head: {
      title: 'Owen | Web Dev'
    }
    // pageTransition: {
    //   name: 'page',
    //   mode: 'out-in'
    // }
  },
  modules: [
    '@nuxt/content',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    '@unocss/nuxt',
    'dayjs-nuxt'
  ],
  dayjs: {
    plugins: ['customParseFormat']
  },
  css: ['@unocss/reset/tailwind.css', '~/assets/styles/global.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  },
  fonts: {
    defaults: {
      weights: [100, 400, 900],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext']
    }
  },
  content: {
    markdown: {
      toc: {
        depth: 3
      }
    },
    highlight: {
      langs: [
        'json',
        'js',
        'ts',
        'html',
        'css',
        'vue',
        'shell',
        'jsx',
        'md',
        'tsx',
        'yaml',
        'scss'
      ],
      theme: {
        default: 'catppuccin-latte',
        dark: 'catppuccin-mocha'
      }
    }
  }
})

