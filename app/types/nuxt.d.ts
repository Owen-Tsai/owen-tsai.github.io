import type P5 from 'p5'

declare module '#app' {
  interface NuxtApp {
    $p5: typeof P5
    $gsap: typeof import('gsap')['gsap']
  }
}
