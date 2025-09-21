<template>
  <div class="relative pb-12">
    <div class="px-8 py-6 relative">
      <div v-if="!isMobile" class="grid grid-cols-4 absolute top-6 left-8 right-8">
        <!-- canvas -->
        <div ref="wrapper" class="overflow-hidden col-start-2 col-end-3">
          <P5Canvas v-if="mounted" class="w-full" :sketch="sketch" />
          <div class="mt-2 px-2 text-neutral-500">ASCII art of me</div>
        </div>
      </div>

      <div
        class="flex flex-col md:grid md:grid-cols-4 md:relative md:border-t md:border-t-neutral-800"
      >
        <div class="text-5xl font-thin py-6 md:border-r md:border-r-neutral-800">
          <h2 class="sticky top-16">ABOUT</h2>
        </div>
        <div
          class="md:col-start-3 md:col-end-5 md:px-6 prose prose-invert max-w-full md:border-l md:border-l-neutral-800"
        >
          <p class="text-2xl font-bold">Hi there,</p>
          <p>I'm Owen, yet another web developer.</p>
          <p>
            I mainly focus on frontend techniques. Transforming static design drafts and conceptual
            art into actual running applications is where my passion lies.
          </p>
          <p>
            Outside the coding, I spent a lot of time playing video games. My collection spans
            nearly all genres, from popular AAA titles to indie gems. I've even dabbled in
            developing a few prototypes and provided Chinese localization for an indie game.
          </p>
          <p>
            I also love immersing myself in the worlds created within books. I mostly read detective
            novels, Chinese history and adventure stories. I’m also a huge fan of J.K Rowling’s HP
            series.
          </p>
        </div>
      </div>

      <div
        class="flex flex-col md:grid md:grid-cols-4 md:border-t md:border-t-neutral-800 mb-4 md:mb-0"
      >
        <div class="text-5xl font-thin py-6 md:border-r md:border-r-neutral-800">
          <h2 class="sticky top-16">SITREP</h2>
        </div>
        <div
          class="md:col-start-3 md:col-end-5 md:px-6 md:grid md:grid-cols-subgrid md:py-6 md:gap-6 md:border-l md:border-l-neutral-800"
        >
          <div>
            <h3 class="flex items-center gap-2 border-b border-b-neutral-300 pb-1">
              <Icon name="ri:book-3-fill" />
              Reading
            </h3>
            <div v-for="(item, i) in stat.books" :key="i" class="mt-2">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-neutral-500"></div>
                  <div>{{ item.title }}</div>
                </div>
                <div class="text-sm">著 / {{ item.author }}</div>
              </div>
              <div class="text-neutral-500 text-sm pl-4">{{ item.subtitle }}</div>
            </div>
          </div>
          <div>
            <h3 class="flex items-center gap-2 border-b border-b-neutral-300 pb-1 mt-4 md:mt-0">
              <Icon name="ri:gamepad-fill" />
              Playing
            </h3>
            <div v-for="(item, i) in stat.games" :key="i" class="mt-2">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-neutral-500"></div>
                <div>{{ item.title }}</div>
              </div>
              <div class="mt-2 pl-4 flex items-center gap-2">
                <span
                  v-for="(tag, j) in item.tags"
                  :key="j"
                  class="text-xs bg-neutral-500 px-2 rounded"
                  >{{ tag }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col md:grid md:grid-cols-4 md:relative md:border-y md:border-y-neutral-800"
      >
        <div class="text-5xl font-thin py-6 md:border-r md:border-r-neutral-800 md:pb-12">
          <h2 class="sticky top-16">CONTACT</h2>
        </div>
        <div
          class="md:col-start-3 md:col-end-5 md:px-6 md:border-l md:border-l-neutral-800 md:py-6"
        >
          <div class="flex items-center gap-2">
            <Icon name="ri:github-fill" />
            <a class="underline-link" href="https://github.com/Owen-Tsai">Github Profile</a>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <Icon name="ri:mail-fill" />
            <a class="underline-link" href="mailto:owentsai.v@gmail.com">owentsai.v@gmail.com</a>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <Icon name="ri:file-fill" />
            <a class="underline-link" href="/resume.pdf" target="_blank">Get my Resume</a>
          </div>
        </div>
      </div>
    </div>
    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
import portrait from '@/assets/img/portrait.png'
import stat from '@/assets/stat.json'
import type P5 from 'p5'

const { smallerOrEqual } = breakpoints
const isMobile = computed(() => smallerOrEqual('sm').value)

const wrapper = useTemplateRef('wrapper')
const { width } = useElementSize(wrapper)

const mounted = useMounted()
const sketch = (p5: P5) => {
  let img: P5.Image
  let size = 10
  let ratio = 1
  const chars =
    // eslint-disable-next-line no-useless-escape
    "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1-_+~<>i!lI;:,^`'.                 "

  p5.preload = () => {
    img = p5.loadImage(portrait)
  }

  p5.setup = () => {
    ratio = width.value / img.width
    p5.createCanvas(width.value, img.height * ratio)
    img.resize(80, 0)
    size = p5.width / img.width
    p5.noLoop()
  }

  p5.windowResized = () => {
    setTimeout(() => {
      ratio = width.value / img.width
      p5.resizeCanvas(width.value, img.height * ratio)
      size = p5.width / img.width
      p5.redraw()
    }, 1)
  }

  p5.draw = () => {
    p5.background('#0a0a0a')
    img.loadPixels()

    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        const pixelIndex = (i + j * img.width) * 4
        const r = img.pixels[pixelIndex + 0] as number
        const g = img.pixels[pixelIndex + 1] as number
        const b = img.pixels[pixelIndex + 2] as number

        // let bright = brightness(color(r, g, b))
        const bright = (r + g + b) / 3
        const tIndex = p5.floor(p5.map(bright, 255, 0, 0, chars.length))

        const x = i * size
        const y = j * size

        p5.textSize(size)
        p5.fill('#fafafa')

        const t = chars.charAt(tIndex)
        p5.text(t, x, y)
      }
    }
  }
}
</script>
