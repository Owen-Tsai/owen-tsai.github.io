<template>
  <div class="px-(--view-padding) py-6 relative">
    <div class="py-[14vh]">
      <h1 class="text-6xl lg:text-8xl font-semibold flex items-start">
        ACHIEVEMENTS<sup class="text-2xl">({{ unlockedIds.size }}/{{ total }})</sup>
      </h1>
    </div>
    <div class="border-t border-gray-200 dark:border-gray-800 py-6">
      <main class="max-w-prose">
        <p class="mb-2">
          You have unlocked
          <span class="font-bold text-2xl font-[ruigslay]"
            >{{ unlockedIds.size }} out of {{ total }}</span
          >
          achievements.
        </p>
        <p class="mb-2">
          Achievements are all named after the terms from one of my favorite games,
          <span class="font-bold font-[ruigslay] text-2xl">Baldur's Gate 3</span>. Try to unlock all
          of them!
        </p>
      </main>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div
          v-for="achievement in ACHIEVEMENTS"
          :key="achievement.name"
          class="border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center gap-4"
          :class="isUnlocked(achievement.id) ? '' : 'opacity-50'"
        >
          <div>
            <Icon
              :name="
                isUnlocked(achievement.id)
                  ? 'material-symbols:trophy-rounded'
                  : 'material-symbols:lock'
              "
              :size="40"
            />
          </div>
          <div>
            <p class="text-lg font-bold">{{ achievement.name }}</p>
            <p class="text-sm">{{ achievement.description }}</p>
            <p v-if="isUnlocked(achievement.id)" class="text-sm text-gray-500">
              {{ achievement.trigger }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <ViewTransition />
  </div>
</template>

<script setup lang="ts">
const total = computed(() => Object.keys(ACHIEVEMENTS).length)
const { unlockedIds, isUnlocked } = useAchievements()
</script>
