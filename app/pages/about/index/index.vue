<template>
  <div class="px-(--view-padding) pb-[10vh]">
    <div class="py-[14vh] relative">
      <h1 class="text-6xl lg:text-8xl font-semibold flex items-start">ABOUT</h1>
      <div class="hidden lg:flex absolute items-center bottom-4 right-0 gap-8">
        <div class="flex items-center gap-1">
          <Icon name="ri:github-fill" />
          <a class="underline-link" href="https://github.com/Owen-Tsai" target="_blank"
            >Github Profile</a
          >
        </div>
        <div class="flex items-center gap-1">
          <Icon name="ri:mail-fill" />
          <a class="underline-link" href="mailto:owentsai.v@gmail.com">owentsai.v@gmail.com</a>
        </div>
        <div class="flex items-center gap-1">
          <Icon name="ri:file-fill" />
          <a class="underline-link" href="/resume.pdf" target="_blank">Get my Resume</a>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-800 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img :src="portrait" class="grayscale" />
        </div>
        <div>
          <div class="sticky top-20">
            <p class="text-3xl font-bold mb-2 font-[ruigslay]">Hi, there.</p>
            <p class="py-2 text-lg">I'm Owen, yet another web developer.</p>
            <p class="py-2 text-lg">
              I mainly focus on frontend techniques. Transforming static design drafts and
              conceptual art into actual running applications is where my passion lies.
            </p>
            <p class="py-2 text-lg">
              Outside the coding, I spent a lot of time playing video games. My collection spans
              nearly all genres, from popular AAA titles to indie gems. I've even dabbled in
              developing a few prototypes and provided Chinese localization for an indie game.
            </p>
            <p class="py-2 text-lg">
              I also love immersing myself in the worlds created within books. I mostly read
              detective novels, Chinese history and adventure stories. I’m also a huge fan of J.K
              Rowling’s HP series.
            </p>

            <div class="mt-8">
              <div class="flex items-center gap-2">
                <Icon name="ri:github-fill" />
                <a class="underline-link" href="https://github.com/Owen-Tsai" target="_blank"
                  >Github Profile</a
                >
              </div>
              <div class="flex items-center gap-2 mt-2">
                <Icon name="ri:mail-fill" />
                <a class="underline-link" href="mailto:owentsai.v@gmail.com"
                  >owentsai.v@gmail.com</a
                >
              </div>
              <div class="flex items-center gap-2 mt-2">
                <Icon name="ri:file-fill" />
                <a class="underline-link" href="/resume.pdf" target="_blank">Get my Resume</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
import portrait from '~/assets/img/portrait.jpg'
</script>
