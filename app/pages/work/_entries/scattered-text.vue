<template>
  <div class="flex items-center justify-center w-full h-full bg-slate-950">
    <P5Canvas v-if="isMounted" :sketch="sketch" />
  </div>
</template>

<script setup lang="ts">
import type P5 from 'p5'

const isMounted = useMounted()

const tile = 8
const text = 'Hi'

const sketch = (p: P5) => {
  let font: P5.Font
  let tileW: number, tileH: number
  let pg: P5.Graphics

  p.setup = async () => {
    font = await p.loadFont('/ruigslay.ttf')
    p.createCanvas(400, 400)
    pg = p.createGraphics(400, 400)

    tileW = p.width / tile
    tileH = p.height / tile
  }

  p.draw = () => {
    pg.push()
    pg.background('#030616')
    pg.textFont(font)
    pg.textAlign(p.CENTER, p.CENTER)
    pg.textStyle(p.ITALIC)
    pg.textSize(300)
    pg.fill(255)
    pg.text(text, p.width / 2, p.height / 2)
    pg.pop()

    for (let y = 0; y < tile; y++) {
      for (let x = 0; x < tile; x++) {
        const wave = p.int(p.sin(p.frameCount * x * y * 0.0005) * 30)
        // source
        const sx = p.floor(x * tileW + wave)
        const sy = p.floor(y * tileH)
        const sw = tileW
        const sh = tileH
        // destination
        const dx = p.floor(x * tileW)
        const dy = p.floor(y * tileH)
        const dw = tileW
        const dh = tileH

        p.copy(pg, sx, sy, sw, sh, dx, dy, dw, dh)
      }
    }
  }
}
</script>
