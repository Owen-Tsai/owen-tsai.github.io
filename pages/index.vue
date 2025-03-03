<template>
  <article class="prose prose-neutral dark:prose-invert">
    <h1 class="h-90px md:h-unset">
      Owen is a <span ref="animRef"></span><span ref="cursorRef">|</span>
    </h1>
    <p>Hi there, I'm Owen, another web developer.</p>
    <p>Recently I've been:</p>
    <div class="grid grid-cols-1 md:grid-cols-3 grid-gap-4">
      <div v-for="item in status" :key="item.title" class="flex flex-col">
        <div class="flex items-center gap-2 border-b border-b-neutral-3 dark:border-b-neutral-7">
          <Icon :name="item.icon" />
          <span>{{ item.title }}</span>
        </div>
        <div v-for="entry in item.data" class="mt-2">
          <div class="text-primary font-bold text-truncate" :title="entry.name">
            {{ entry.name }}
          </div>
          <div class="text-muted text-xs">{{ entry.desc || ' ' }}</div>
        </div>
      </div>
    </div>
    <p>
      I mainly focus on frontend techniques. Transforming static design drafts and conceptual art
      into actual running applications is where my passion lies.
    </p>
    <p>
      Outside the coding, I spent a lot of time playing video games. My collection spans nearly all
      genres, from popular AAA titles to indie gems. I've even dabbled in developing a few
      prototypes and provided Chinese localization for an indie game.
    </p>
    <p>
      I also love immersing myself in the worlds created within books. I mostly read detective
      novels, Chinese history and adventure stories. I’m also a huge fan of J.K Rowling’s HP series.
    </p>
    <p class="mt-18">
      If you happen to have any fun ideas, or books to recommend, or even challenging job
      opportunities to offer, shoot me an email at
      <a href="mailto:owentsai.v@gmail">owentsai.v@gmail.com</a>.
    </p>
    <p>
      And yes, you can always find me on
      <Tag link="https://github.com/owen-tsai" icon="ri:github-fill" text="GitHub" />.
    </p>
  </article>
</template>

<script setup lang="ts">
import useAnimatedTitle from './use-animated-title'
import useStatus from './use-status'

useHead({
  title: 'Owen | Web Dev'
})

const el = useTemplateRef('animRef')
const cursor = useTemplateRef('cursorRef')

useAnimatedTitle(el, cursor)
const status = useStatus()
</script>
