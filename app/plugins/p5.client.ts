import P5 from 'p5'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('p5', P5)
})
