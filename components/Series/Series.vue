<template>
  <div
    v-if="content?.children && content.children.length > 0"
    class="flex flex-col gap-5 text-white lg:px-[104px] mt-16 sm:mt-20 md:mt-28 px-4 sm:px-6 md:px-12"
  >
    <h1 class="text-[31px]">Seasons</h1>

    <!-- Season Tabs -->
    <div>
      <div
        class="border-b border-1 border-gold w-full flex gap-3 overflow-x-auto"
      >
        <button
          v-for="season in content.children"
          :key="season.id"
          @click="selectedSeasonId = season.id"
          class="px-4 py-3 border-b-2 transition-colors whitespace-nowrap"
          :class="
            selectedSeasonId === season.id
              ? 'border-gold text-gold'
              : 'border-transparent text-gray-400 hover:text-white'
          "
        >
          Season {{ season.season_number || "N/A" }}
        </button>
      </div>
    </div>

    <!-- Episodes List -->
    <div v-if="selectedSeason">
      <div
        class="h-[420px] overflow-y-auto overflow-x-hidden bg-[#1A1A1A] rounded-lg"
      >
        <button
          v-for="episode in selectedSeason.children || []"
          :key="episode.id"
          @click="navigateToEpisode(episode)"
          class="flex gap-4 items-center px-6 py-4 hover:bg-black/50 transition-colors w-full cursor-pointer group"
        >
          <!-- Episode Thumbnail -->
          <div
            class="relative min-w-[120px] h-[68px] bg-gray-800 rounded overflow-hidden flex-shrink-0"
          >
            <img
              :src="buildImageUrl(episode.thumbnail_image_id)"
              :alt="episode.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="handleImageError"
            />
            <!-- Progress Bar Overlay -->
            <div
              v-if="
                episode.progress_percentage && episode.progress_percentage > 0
              "
              class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700"
            >
              <div
                class="h-full bg-gold transition-all duration-300"
                :style="`width: ${episode.progress_percentage}%`"
              />
            </div>
            <!-- Play Icon Overlay -->
            <div
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Episode Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-white font-medium truncate">
                Episode {{ episode.episode_number }}: {{ episode.title }}
              </p>
              <!-- Watch Status Indicators -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <!-- Completed Badge -->
                <span
                  v-if="episode.is_completed"
                  class="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30"
                >
                  Completed
                </span>
                <!-- In Progress Badge -->
                <span
                  v-else-if="episode.has_been_watched && !episode.is_completed"
                  class="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30"
                >
                  In Progress
                </span>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <p v-if="episode.duration_in_seconds" class="text-gold text-sm">
                {{ formatDuration(episode.duration_in_seconds) }}
              </p>
              <!-- Progress Percentage -->
              <p
                v-if="
                  episode.progress_percentage && episode.progress_percentage > 0
                "
                class="text-gray-400 text-xs"
              >
                {{ episode.progress_percentage }}% watched
              </p>
            </div>
            <p
              v-if="episode.description"
              class="text-gray-400 text-sm line-clamp-2 mt-1 text-left"
            >
              {{ episode.description }}
            </p>
          </div>
        </button>

        <!-- Empty State -->
        <div
          v-if="
            !selectedSeason.children || selectedSeason.children.length === 0
          "
          class="flex items-center justify-center h-full text-gray-400"
        >
          <p>No episodes available for this season</p>
        </div>
      </div>
    </div>

    <!-- No Season Selected State -->
    <div
      v-else
      class="flex items-center justify-center h-[420px] bg-[#1A1A1A] rounded-lg"
    >
      <p class="text-gray-400">Please select a season</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Content } from "~/src/types/content";
import { buildImageUrl, formatDuration } from "~/src/utils/helpers";

// Props
const props = defineProps<{
  content: Content | null;
}>();

// State
const selectedSeasonId = ref<string | null>(null);

// Computed - Get selected season
const selectedSeason = computed(() => {
  if (!props.content?.children) return null;
  if (!selectedSeasonId.value) {
    selectedSeasonId.value = props.content.children[0]?.id || null;
  }
  return (
    props.content.children.find(
      (season: Content) => season.id === selectedSeasonId.value
    ) || null
  );
});

// Navigation
const navigateToEpisode = (episode: Content) => {
  navigateTo(`/watch/${episode.slug}/video`);
};

// Image error handler
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
};

// Initialize selected season on mount
onMounted(() => {
  if (props.content?.children && props.content.children.length > 0) {
    selectedSeasonId.value = props.content.children[0].id;
  }
});
</script>