<template>
  <article class="prose prose-neutral dark:prose-invert">
    <ContentDoc v-slot="{ doc }">
      <h1>{{ doc.title }}</h1>
      <span class="text-muted">{{ $dayjs(doc.date, 'YYYY.MM.DD').format('MMM.DD, YYYY') }}</span>
      <hr />
      <ContentRenderer :value="doc" />

      <div class="fixed left-8 top-32 bottom-0 w-60 truncate hidden lg:block">
        <Icon name="ri:menu-2-fill" size="1.2rem" class="text-secondary opacity-60" />
        <Toc :links="doc.body?.toc?.links" class="mt-2" />
      </div>
    </ContentDoc>

    <div class="mt-20">
      <NuxtLink to="/posts" class="style-cd mt-8">&gt; cd ..</NuxtLink>
    </div>
  </article>
</template>
