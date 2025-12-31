<template>
  <div class="flex items-center justify-center bg-slate-100 w-full h-full relative">
    <P5Canvas v-if="isMounted" :sketch="sketch" />
  </div>
</template>

<script setup lang="ts">
import type P5 from 'p5'

const isMounted = useMounted()
const { unlock } = useAchievements()

const MIN_BRANCH_LENGTH = 14
let checked = false

const sketch = (p: P5) => {
  p.setup = () => {
    p.createCanvas(800, 800)
    p.angleMode(p.DEGREES)
    p.noLoop()
  }

  p.draw = () => {
    p.background('#F2F5F9')
    p.textAlign(p.CENTER)
    p.text('Press R for a new Tree', p.width / 2, 700)
    p.translate(p.width / 2, 680)
    branch(100)
  }

  const branch = (length: number) => {
    p.push()
    if (length > MIN_BRANCH_LENGTH) {
      p.stroke(70, 40, 20)
      p.strokeWeight(p.map(length, 12, 100, 1, 15))
      p.line(0, 0, 0, -length)
      p.translate(0, -length)
      p.rotate(p.random(20, 30))
      branch(length * p.random(0.7, 0.9))
      p.rotate(p.random(-50, -60))
      branch(length * p.random(0.7, 0.9))
    } else {
      leave()
    }
    p.pop()
  }

  const leave = () => {
    p.noStroke()
    const rad = 15
    p.fill(80 + p.random(-20, 20), 120 + p.random(-20, 20), 40 + p.random(-20, 20))
    p.beginShape()
    for (let i = 45; i < 135; i++) {
      const x = rad * p.cos(i)
      const y = rad * p.sin(i)
      p.vertex(x, y)
    }
    for (let i = 135; i > 40; i--) {
      const x = rad * p.cos(i)
      const y = rad * p.sin(-i) + 20
      p.vertex(x, y)
    }
    p.endShape(p.CLOSE)
  }

  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      p.redraw()
      if (!checked) {
        checked = true
        unlock('workTree')
      }
    }
  }
}
</script>
