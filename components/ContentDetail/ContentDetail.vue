<template>
  <div class="w-full h-auto">
    <div class="px-4 sm:px-6 md:px-9 lg:px-28">
      <div class="relative">
        <div
          class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start md:items-center"
        >
          <!-- Poster Image -->
          <div
            class="md:col-span-3 grid relative mb-6 md:mb-0 justify-center items-center"
          >
            <img
              :src="
                buildImageUrl(
                  content.poster_image_id || content.thumbnail_image_id
                )
              "
              :alt="content.title"
              class="w-full max-w-xs mx-auto md:mx-0 rounded-lg shadow-lg"
            />
            <!-- Premium Badge -->
            <PremiumBadge :is-premium="content.is_premium" />

            <!-- Play Icon and Label Overlay -->
            <div
              v-if="showPosterOverlay"
              class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg cursor-pointer hover:bg-black/50 transition-colors duration-300 max-w-xs mx-auto"
              @click="navigateToTrailer"
            >
              <div
                class="bg-[#FFD005] p-3 md:p-4 rounded-full mb-2 md:mb-3 hover:bg-[#CE8F00] transition-colors duration-300"
              >
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-6 h-6 md:w-8 md:h-8"
                />
              </div>
              <span
                class="text-white text-xs md:text-sm font-medium bg-black/50 px-2 md:px-3 py-1 rounded-full"
                >Watch Trailer</span
              >
            </div>
          </div>

          <!-- Content Information -->
          <div class="md:col-span-9 text-white">
            <!-- Title Row with Rating -->
            <div
              class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4"
            >
              <div class="flex-1">
                <div
                  class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 mb-2"
                >
                  <h1
                    class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold flex items-center leading-tight"
                  >
                    {{ content.title }}
                  </h1>
                  <span
                    class="text-gray-300 text-lg sm:text-xl md:text-2xl self-start sm:self-end mb-1.5 flex items-center"
                    >{{ formatDate(content.release_date) }}</span
                  >
                </div>
              </div>
              <div
                class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"
              >
                <div
                  class="text-gray-300 whitespace-nowrap text-sm sm:text-base"
                >
                  {{ content.interactions?.comments.top_level_count || 0 }}
                  {{
                    (content.interactions?.comments.top_level_count || 0) === 1
                      ? "Comment"
                      : "Comments"
                  }}
                </div>
                <div
                  v-if="content.interactions?.rating"
                  class="flex items-center"
                >
                  <div class="flex">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="text-base md:text-lg leading-none"
                    >
                      <span
                        class="text-yellow-400"
                        v-if="
                          i <= Math.round(content.interactions.rating.average)
                        "
                        >★</span
                      >
                      <span class="text-gray-600" v-else>★</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Genre -->
            <div
              v-if="genres.length"
              class="text-gray-300 mb-3 text-sm sm:text-base"
            >
              <span class="text-white font-semibold">Genre: </span>
              {{ genres.join(", ") }}
            </div>

            <!-- Duration -->
            <div class="text-gray-300 mb-3 text-sm sm:text-base">
              <span class="text-white font-semibold">Time: </span>
              {{ formatDuration(content.duration_in_seconds) }}
            </div>

            <!-- Cast -->
            <div
              v-if="cast.length"
              class="text-gray-300 mb-3 text-sm sm:text-base"
            >
              <span class="text-white font-semibold">Stars: </span>
              {{ cast.join(", ") }}
            </div>

            <!-- Creator -->
            <div class="text-gray-300 mb-3 text-sm sm:text-base">
              <span class="text-white font-semibold">Created by: </span>
              {{ creator }}
            </div>

            <!-- Rating Box -->
            <!-- <div
              class="inline-block bg-[#FFD005] text-black px-3 py-1 rounded mb-6 font-medium"
            >
              {{
                content.interactions?.rating
                  ? content.interactions.rating.average.toFixed(1)
                  : "N/A"
              }}
            </div> -->

            <!-- Description -->
            <p
              class="text-gray-300 text-sm sm:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed"
            >
              {{ content.description }}
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                v-if="!isContentReleased"
                disabled
                class="bg-gray-500 text-white h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium cursor-not-allowed text-sm sm:text-base"
              >
                <span>Coming Soon</span>
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-4 h-4 sm:w-5 sm:h-5 opacity-50"
                />
              </button>
              <button
                v-else-if="shouldShowUpgradeButton"
                @click="handleUpgradeClick"
                class="bg-gradient-to-r from-[#FFD005] to-[#FFA500] hover:from-[#CE8F00] hover:to-[#FF8C00] text-black h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl"
              >
                <span>Upgrade to Watch</span>
                <svg
                  class="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </button>
              <button
                v-else-if="isAuthenticated"
                @click="handleWatchClick"
                :disabled="watchLoading"
                class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{{ watchButtonText }}</span>
                <img
                  v-if="!watchLoading"
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-4 h-4 sm:w-5 sm:h-5"
                />
                <div
                  v-else
                  class="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
                ></div>
              </button>
              <NuxtLink
                v-else
                :to="loginUrl"
                class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <span>Sign In to Watch</span>
                <img
                  src="../../assets/icons/play.svg"
                  alt="Play"
                  class="w-4 h-4 sm:w-5 sm:h-5"
                />
              </NuxtLink>
              <button
                v-if="isAuthenticated"
                @click="handleAddToListClick"
                :disabled="watchlistLoading"
                class="h-12 w-full sm:w-auto px-6 sm:px-10 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-3 group text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                :class="
                  isInWatchlist
                    ? 'hover:bg-red-700 text-white border-2 border-red-600 hover:border-red-700'
                    : 'border-2 border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black'
                "
              >
                <span>{{
                  watchlistLoading
                    ? "Loading..."
                    : isInWatchlist
                    ? "Remove from List"
                    : "Add to List"
                }}</span>
                <img
                  v-if="isInWatchlist"
                  src="@/assets/icons/minus.svg"
                  alt="remove"
                  class="w-4 h-4 sm:w-5 sm:h-5 brightness-0 invert"
                />
                <img
                  v-else
                  src="@/assets/icons/plus.svg"
                  alt="add"
                  class="w-4 h-4 sm:w-5 sm:h-5 group-hover:brightness-0"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useWatchlistStore } from "~/stores/watchlist";
import { useSubscriptionStore } from "~/stores/subscription";
import { buildImageUrl, formatDate, formatDuration } from "~/src/utils/helpers";
import { useRouter, useRoute } from "vue-router";
import { useAdvertStore } from "~/stores/adverts";
import { useToast } from "~/composables/useToast";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  showPosterOverlay: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const watchlistStore = useWatchlistStore();
const subscriptionStore = useSubscriptionStore();
const { showSuccess, showError } = useToast();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Loading states
const watchLoading = ref(false);

// Login URL with redirect parameter
const loginUrl = computed(() => {
  const redirectPath = `/watch/${props.content.slug}/video`;
  return `/login?redirect-to=${encodeURIComponent(redirectPath)}`;
});

// Advert store
const advertStore = useAdvertStore();

// Metadata access - support both old and new structure
const genres = computed(() => {
  const content = props.content;
  // New structure: metadata directly on content
  if (content.genres && content.genres.length > 0) {
    return content.genres;
  }
  // Old structure: metadata in nested object
  if (content[content.type]?.genres) {
    return content[content.type].genres;
  }
  return [];
});

const cast = computed(() => {
  const content = props.content;
  // New structure: metadata directly on content
  if (content.cast && content.cast.length > 0) {
    return content.cast;
  }
  // Old structure: metadata in nested object
  if (content[content.type]?.cast) {
    return content[content.type].cast;
  }
  return [];
});

const creator = computed(() => {
  const content = props.content;
  // New structure: metadata directly on content
  if (content.creator) {
    return content.creator;
  }
  // Old structure: metadata in nested object
  if (content[content.type]?.creator) {
    return content[content.type].creator;
  }
  return "N/A";
});

// Watchlist computed properties
const isInWatchlist = computed(() => props.content?.in_watch_list || false);
const watchlistLoading = computed(() => watchlistStore.loading);

// Find the next episode to watch for series
const findNextEpisode = () => {
  if (
    !props.content ||
    props.content.type !== "series" ||
    !props.content.children
  ) {
    return null;
  }

  // Iterate through seasons
  for (const season of props.content.children) {
    if (!season.children) continue;

    // Iterate through episodes in season
    for (const episode of season.children) {
      // If episode has been watched but not completed, this is the next one
      if (episode.has_been_watched && !episode.is_completed) {
        return { episode, season };
      }
      // If episode hasn't been watched yet, this is the next one
      if (!episode.has_been_watched) {
        return { episode, season };
      }
    }
  }

  // If all episodes completed, return first episode
  const firstSeason = props.content.children[0];
  if (firstSeason?.children?.[0]) {
    return { episode: firstSeason.children[0], season: firstSeason };
  }

  return null;
};

// Check if content has been partially watched
const hasPartialProgress = computed(() => {
  if (!props.content) return false;

  // For series, check episode progress
  if (props.content.type === "series") {
    const nextEpisode = findNextEpisode();
    return (
      nextEpisode?.episode?.has_been_watched &&
      !nextEpisode.episode.is_completed
    );
  }

  // For movies, check watched duration from interactions
  if (props.content.type === "movie") {
    // Get watched duration from interactions.watch_duration
    const watchedDuration = props.content.interactions?.watch_duration || 0;
    const totalDuration = props.content.duration_in_seconds || 0;

    // Consider it partially watched if watched at least 30 seconds and less than 90% watched
    return (
      watchedDuration >= 30 &&
      totalDuration > 0 &&
      watchedDuration / totalDuration < 0.9
    );
  }

  return false;
});

// Computed property for watch button text
const watchButtonText = computed(() => {
  if (watchLoading.value) {
    return "Loading...";
  }

  // For series, check if there's a next episode to continue
  if (props.content?.type === "series") {
    const nextEpisode = findNextEpisode();
    if (
      nextEpisode?.episode &&
      nextEpisode.episode.has_been_watched &&
      !nextEpisode.episode.is_completed
    ) {
      return `Continue S${nextEpisode.season.season_number}E${nextEpisode.episode.episode_number}`;
    }
    return "Watch";
  }

  // For movies, check if there's partial progress
  if (props.content?.type === "movie" && hasPartialProgress.value) {
    return "Continue Watching";
  }

  return "Watch";
});

const isContentReleased = computed(() => {
  if (!props.content || !props.content.release_date) return false;
  const releaseDate = new Date(props.content.release_date);
  return releaseDate <= new Date();
});

// Check if user has access to premium content
const hasPremiumAccess = computed(() => {
  if (!isAuthenticated.value) return false;

  const user = authStore.currentUser;
  if (!user || !user.subscription) return false;

  // Check if user has a paid subscription (not free/default)
  return !user.subscription.is_default;
});

// Check if user should see upgrade button
const shouldShowUpgradeButton = computed(() => {
  return (
    isAuthenticated.value &&
    !hasPremiumAccess.value &&
    props.content?.is_premium === true
  );
});

const navigateToTrailer = () => {
  if (!props.content || !props.content.slug) return;
  emit("trailer-click");
};

const handleWatchClick = async () => {
  if (!props.content || !props.content.id || watchLoading.value) return;

  try {
    watchLoading.value = true;

    let targetSlug = props.content.slug;
    let targetContentId = props.content.id;
    const nextEpisode =
      props.content.type === "series" ? findNextEpisode() : null;

    // For series, navigate to the next episode instead
    if (props.content.type === "series" && nextEpisode?.episode) {
      targetSlug = nextEpisode.episode.slug;
      targetContentId = nextEpisode.episode.id;
    }

    // Fetch adverts for this content
    await advertStore.fetchAdverts({
      content_id: targetContentId,
    });

    // Navigate to video page
    router.push(`/watch/${targetSlug}/video`);
  } catch (error) {
    // Determine fallback slug
    let fallbackSlug = props.content.slug;
    if (props.content.type === "series") {
      const nextEpisode = findNextEpisode();
      if (nextEpisode?.episode) {
        fallbackSlug = nextEpisode.episode.slug;
      }
    }
    // Still navigate to video page even if adverts fail
    router.push(`/watch/${fallbackSlug}/video`);
  } finally {
    watchLoading.value = false;
  }
};

const handleUpgradeClick = () => {
  // Navigate to profile page where subscription plans are shown
  router.push("/profile");
};

const handleAddToListClick = async () => {
  if (!props.content || !props.content.id || !isAuthenticated.value) return;

  try {
    const wasInWatchlist = props.content.in_watch_list;
    await watchlistStore.toggleWatchlist(props.content.id);

    // Update the local state to reflect the new watchlist status
    const newWatchlistStatus = !wasInWatchlist;
    props.content.in_watch_list = newWatchlistStatus;

    // Show appropriate toast message
    if (wasInWatchlist) {
      showSuccess("Removed from watchlist");
    } else {
      showSuccess("Added to watchlist");
    }
  } catch (error) {
    console.error("Failed to toggle watchlist:", error);
    showError("Failed to update watchlist");
  }
};

const emit = defineEmits(["mounted", "trailer-click"]);

onMounted(async () => {
  emit("mounted");

  // Fetch watchlist if user is authenticated
  if (isAuthenticated.value) {
    try {
      await watchlistStore.fetchWatchlist();
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    }
  }
});
</script>