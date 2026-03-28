<template>
  <div class="p-6 md:p-12 pt-32 md:pt-48 max-w-5xl mx-auto min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-6">
      <div class="md:col-span-5">
        <h1 class="text-4xl md:text-6xl font-light tracking-tighter text-zinc-50 sticky top-48">
          Engineer.<br />
          Creator.<br />
          Me.
        </h1>
      </div>
      <div
        class="md:col-span-7 flex flex-col gap-12 text-zinc-400 leading-relaxed font-light pb-10"
      >
        <img :src="portrait" class="grayscale-100 h-80 lg:h-60 object-cover" />
        <div class="space-y-6 text-sm md:text-base text-zinc-300">
          <p>
            我是一名前端工程师。作为产品链中最接近用户的开发者，致力于在理性的代码架构和感性的视觉体验之间寻找平衡。无论是构建复杂的
            SPA，还是探索 WebGL 的前沿美学，我都希望做到克制、精准且充满直觉。
          </p>
          <p>
            在编码之外，我也玩电子游戏。我获得了「艾尔登法环」「黑神话：悟空」等高难度动作游戏的全部成就，但我的游戏喜好囊括了从独立作品到
            3A 系列的几乎所有类型。我甚至还为某游戏提供了中文本地化翻译。
          </p>
          <p>
            我也花了很多时间读书。我是 J.K. Rowing
            的「哈利·波特」系列粉丝，每年我都会读上一遍！但总的来说，我通常阅读本格推理小说。
          </p>
        </div>
        <div>
          <h3
            class="text-zinc-50 text-sm uppercase tracking-widest mb-6 pb-2 border-b border-zinc-800"
          >
            SITREP
          </h3>
          <ul class="space-y-4">
            <li
              v-for="(entry, i) in status"
              :key="i"
              class="flex justify-between items-center border-b border-zinc-900 pb-2"
            >
              <span class="text-zinc-300"
                >{{ entry.title }}<span class="text-zinc-600 ml-1">{{ entry.subtitle }}</span></span
              >
              <span class="font-mono text-xs text-zinc-600 capitalize">{{ entry.type }}</span>
            </li>
          </ul>
        </div>
        <div>
          <h3
            class="text-zinc-50 text-sm uppercase tracking-widest mb-6 pb-2 border-b border-zinc-800"
          >
            Connect
          </h3>
          <div class="flex gap-6">
            <a
              href="#"
              class="text-zinc-500 hover:text-zinc-50 transition-colors flex items-center gap-2"
            >
              <Github class="w-5 h-5" />
              <span class="text-sm">GitHub</span>
            </a>
            <a
              href="#"
              class="text-zinc-500 hover:text-zinc-50 transition-colors flex items-center gap-2"
            >
              <Mail class="w-5 h-5" />
              <span class="text-sm">Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
    <PageTransition />
  </div>
</template>

<script setup lang="ts">
import portrait from '~/assets/portrait.jpg'
import { Github, Mail } from 'lucide-vue-next'
import status from '~/assets/status.json'

useSeoMeta({
  title: 'About // Owen',
})
</script>
