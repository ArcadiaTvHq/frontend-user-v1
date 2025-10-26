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
              v-if="content[content.type]?.genres?.length"
              class="text-gray-300 mb-3 text-sm sm:text-base"
            >
              <span class="text-white font-semibold">Genre: </span>
              {{ content[content.type].genres.join(", ") }}
            </div>

            <!-- Duration -->
            <div class="text-gray-300 mb-3 text-sm sm:text-base">
              <span class="text-white font-semibold">Time: </span>
              {{ formatDuration(content.duration_in_seconds) }}
            </div>

            <!-- Cast -->
            <div
              v-if="content[content.type]?.cast?.length"
              class="text-gray-300 mb-3 text-sm sm:text-base"
            >
              <span class="text-white font-semibold">Stars: </span>
              {{ content[content.type].cast.join(", ") }}
            </div>

            <!-- Creator -->
            <div class="text-gray-300 mb-3 text-sm sm:text-base">
              <span class="text-white font-semibold">Created by: </span>
              {{ content[content.type].creator || "N/A" }}
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
                <span>{{ watchLoading ? "Loading..." : "Watch" }}</span>
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

// Watchlist computed properties
const isInWatchlist = computed(() => props.content?.in_watch_list || false);
const watchlistLoading = computed(() => watchlistStore.loading);

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

    // Fetch adverts for this content
    await advertStore.fetchAdverts({ content_id: props.content.id });

    // Navigate to video page
    router.push(`/watch/${props.content.slug}/video`);
  } catch (error) {
    // Still navigate to video page even if adverts fail
    router.push(`/watch/${props.content.slug}/video`);
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