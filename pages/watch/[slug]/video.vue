<template>
  <div class="video-page">
    <!-- Back Button -->
    <button
      v-show="showBackButton"
      @click="goBack"
      class="back-button"
      :class="{ mobile: isMobile }"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span v-if="!isMobile" class="ml-2">Back</span>
    </button>

    <!-- Video Player -->
    <!-- Allow episodes to play - no type restriction here -->
    <div v-if="content && !error" class="video-container">
      <CustomVideoPlayer
        ref="videoPlayer"
        :key="videoKey"
        :content-id="content.id"
        :player-type="'video'"
        :autoplay="true"
        :muted="false"
        :video-url="content.video_url"
        :use-direct-url="!!content.video_url"
        @error="handleVideoError"
        @ready="handleVideoReady"
        @videoStarted="handleVideoStarted"
        @videoPaused="handleVideoPaused"
        @videoEnded="handleVideoEnded"
      />
    </div>

    <!-- Standardized Error View -->
    <ErrorView
      v-if="error"
      :error="error"
      :title="'Video Playback Error'"
      :message="error.message"
      :show-retry="true"
      :show-back="true"
      :back-text="'Back to Details'"
      :show-error-details="true"
      @retry="retryVideo"
      @back="goBack"
    />

    <!-- Loading State -->
    <StandardLoadingScreen
      v-if="!content && !error"
      variant="video"
      :show-progress="true"
      :progress="loadingProgress"
      :progress-text="loadingMessage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { usePageError } from "~/composables/usePageError";
import { usePageLoading } from "~/composables/usePageLoading";
import CustomVideoPlayer from "~/components/VideoPlayer/CustomVideoPlayer.vue";
import ErrorView from "~/components/ErrorView/ErrorView.vue";
import StandardLoadingScreen from "~/components/LoadingScreen/StandardLoadingScreen.vue";

// Set page layout
definePageMeta({
  layout: "video",
  middleware: ["auth"],
});

// Set component name for KeepAlive exclusion
defineOptions({
  name: "watch-video",
});

const route = useRoute();
const router = useRouter();

// Page-level error handling
const { error, handleApiError, setError, clearError } = usePageError();

// Page-level loading
const { isLoading, progress, loadingMessage } = usePageLoading({
  variant: "video",
  autoStart: false,
});

// Content state
const content = ref(null);
const videoKey = ref(0);

// Back button state
const showBackButton = ref(false);
const backButtonTimeout = ref(null);
const isMobile = ref(false);

// Video player ref
const videoPlayer = ref(null);

// Flag to track if we've already ended the session (prevents double-ending)
const hasEndedSession = ref(false);

// Loading state
const loadingProgress = ref(0);

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

// Mouse movement handlers
const handleMouseMove = () => {
  showBackButton.value = true;

  if (backButtonTimeout.value) {
    clearTimeout(backButtonTimeout.value);
  }

  backButtonTimeout.value = setTimeout(() => {
    showBackButton.value = false;
  }, 3000);
};

const handleTouchStart = () => {
  showBackButton.value = true;

  if (backButtonTimeout.value) {
    clearTimeout(backButtonTimeout.value);
  }

  backButtonTimeout.value = setTimeout(() => {
    showBackButton.value = false;
  }, 3000);
};

// Calculate watch percentage
const getWatchPercentage = () => {
  if (!videoPlayer.value || !content.value) return 0;

  try {
    const player = videoPlayer.value;
    let currentTime = 0;
    let duration = 0;

    // Try to get from exposed methods
    if (player.getCurrentTime && typeof player.getCurrentTime === "function") {
      currentTime = player.getCurrentTime();
    }

    if (player.getDuration && typeof player.getDuration === "function") {
      duration = player.getDuration();
    } else {
      // Fallback to content duration
      duration = content.value.duration_in_seconds || 0;
    }

    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  } catch (err) {
    console.error("Error calculating watch percentage:", err);
    return 0;
  }
};

// Navigation
const goBack = async () => {
  // Check watch percentage before ending session
  const watchPercentage = getWatchPercentage();
  const shouldMarkAsCompleted = watchPercentage >= 95;

  // End playback session before navigating
  if (
    videoPlayer.value &&
    typeof videoPlayer.value.isSessionActive === "function"
  ) {
    const isActive = videoPlayer.value.isSessionActive();

    if (isActive && !hasEndedSession.value) {
      hasEndedSession.value = true; // Prevent double-ending
      try {
        const status = shouldMarkAsCompleted ? "completed" : "abandoned";
        await videoPlayer.value.endPlaybackSession(status);
      } catch (err) {
        // Continue with navigation even if session end fails
        console.error("Error ending session:", err);
      }
    }
  }

  // For episodes, go back to the series page (slug is already the series slug)
  // For movies, go back to the movie detail page
  if (content.value?.type === "episode") {
    // Episode is accessed via series slug, so go back to series
    router.push(`/watch/${route.params.slug}`);
    return;
  }

  // Simple approach: Use browser history if available
  if (process.client && window.history.length > 1 && window.document.referrer) {
    // Go back to previous page in browser history
    router.back();
  } else {
    // Fallback: navigate to content detail page
    router.push(`/watch/${route.params.slug}`);
  }
};

// Video event handlers
const handleVideoStarted = () => {
  // Clear any previous errors
  if (error.value) {
    clearError();
  }
};

const handleVideoPaused = () => {};

const handleVideoEnded = async () => {
  // End session as completed when video ends
  if (
    videoPlayer.value &&
    typeof videoPlayer.value.isSessionActive === "function" &&
    videoPlayer.value.isSessionActive() &&
    !hasEndedSession.value
  ) {
    hasEndedSession.value = true;
    try {
      await videoPlayer.value.endPlaybackSession("completed");
    } catch (err) {
      console.error("Error ending session:", err);
    }
  }

  // Redirect back to content detail page
  router.push(`/watch/${route.params.slug}`);
};

const handleVideoError = (videoError) => {
  // Use the standardized error handling
  if (typeof videoError === "string") {
    setError({
      message: videoError,
      code: "VIDEO_ERROR",
      type: "VIDEO_ERROR",
      timestamp: new Date().toISOString(),
    });
  } else {
    setError({
      message:
        videoError.message ||
        "Video playback failed. Please check your connection and try again.",
      code: videoError.code || "VIDEO_ERROR",
      type: videoError.type || "VIDEO_ERROR",
      timestamp: new Date().toISOString(),
      originalError: videoError.message || videoError.toString(),
    });
  }
};

const handleVideoReady = () => {
  // Clear any previous errors
  if (error.value) {
    clearError();
  }
};

// Retry functionality
const retryVideo = async () => {
  try {
    // Clear error state
    clearError();

    // Increment video key to force re-render
    videoKey.value++;

    // Small delay to ensure the DOM updates properly
    await nextTick();
  } catch (err) {
    // Error will be handled by the error view
  }
};

// Load content
const loadContent = async () => {
  try {
    loadingProgress.value = 0;
    const { ContentService } = await import("~/api/services/content.service");

    // Check if we have an episode query param (for series)
    const episodeId = route.query.episode ? String(route.query.episode) : null;

    if (episodeId) {
      // Try to load episode directly by ID first
      try {
        loadingProgress.value = 50;
        const episodeResponse = await ContentService.getContentById(episodeId);
        if (episodeResponse?.data) {
          content.value = episodeResponse.data;
          loadingProgress.value = 100;
          console.log("[Video Page] Episode loaded directly:", {
            id: episodeResponse.data.id,
            title: episodeResponse.data.title,
          });
        } else {
          throw new Error("Episode data not found");
        }
      } catch (episodeError) {
        // Fallback: Load series and find episode in children
        console.log(
          "[Video Page] Direct episode load failed, trying series lookup:",
          episodeError
        );
        loadingProgress.value = 30;

        const seriesResponse = await ContentService.getContentBySlug(
          route.params.slug
        );
        if (seriesResponse?.data) {
          const series = seriesResponse.data;
          let episode = null;

          // Search through seasons and episodes
          if (series.children && series.children.length > 0) {
            for (const season of series.children) {
              if (season.children && season.children.length > 0) {
                episode = season.children.find(function (ep) {
                  return ep.id === episodeId;
                });
                if (episode) break;
              }
            }
          }

          if (episode) {
            content.value = episode;
            loadingProgress.value = 100;
            console.log("[Video Page] Episode found in series:", {
              id: episode.id,
              title: episode.title,
              seriesSlug: series.slug,
            });
          } else {
            // Episode not found - show helpful error
            console.error("[Video Page] Episode not found. Series children:", {
              hasChildren: !!series.children,
              childrenCount: series.children?.length || 0,
              episodeId: episodeId,
            });
            throw new Error(
              `Episode not found. Please try selecting the episode again.`
            );
          }
        } else {
          throw new Error("Series not found");
        }
      }
    } else {
      // Load content by slug (for movies or direct series access)
      const response = await ContentService.getContentBySlug(route.params.slug);
      if (response?.data) {
        content.value = response.data;
        loadingProgress.value = 100;
        console.log("[Video Page] Content loaded successfully:", {
          id: content.value.id,
          slug: content.value.slug,
          type: content.value.type,
        });
      } else {
        throw new Error("No content data received");
      }
    }
  } catch (err) {
    console.error("[Video Page] Error loading content:", err);
    // Don't redirect on error - show error state instead
    handleApiError(err);
  }
};

// Ensure adverts are loaded before video player initializes
const ensureAdvertsLoaded = async () => {
  const { useAdvertStore } = await import("~/stores/adverts");
  const advertStore = useAdvertStore();

  // If no adverts are loaded, fetch them
  if (!advertStore.adverts || advertStore.adverts.length === 0) {
    try {
      await advertStore.fetchAdverts({ content_id: content.value?.id });
    } catch (error) {}
  }
};

onMounted(async () => {
  console.log("[Video Page] Mounted, slug:", route.params.slug);

  // Add event listeners first
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("touchstart", handleTouchStart);

  // Check mobile
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Load content immediately - don't wait for referrer check
  await loadContent();

  console.log("[Video Page] After loadContent, content:", {
    hasContent: !!content.value,
    type: content.value?.type,
    id: content.value?.id,
  });

  // Then ensure adverts are loaded
  if (content.value?.id) {
    await ensureAdvertsLoaded();
  }

  // Clear navigation skeleton loader once content is loaded
  // Use nextTick to ensure DOM is updated
  await nextTick();
  if (process.client) {
    // Force clear any navigation skeleton by dispatching a custom event
    // or directly accessing the router's navigation state
    const event = new CustomEvent("page-loaded");
    window.dispatchEvent(event);
  }

  // NOTE: Episodes ARE allowed to play on the video page
  // The redirect only happens on the detail page (/watch/[slug]/index.vue)
  // This allows users to watch episodes when navigating from the series page
  // Episodes should play normally - no redirect needed here
  console.log(
    "[Video Page] Setup complete, content type:",
    content.value?.type
  );
});

onBeforeUnmount(async () => {
  // Check watch percentage before ending session
  const watchPercentage = getWatchPercentage();
  const shouldMarkAsCompleted = watchPercentage >= 95;

  // End playback session before component unmounts
  if (
    videoPlayer.value &&
    typeof videoPlayer.value.isSessionActive === "function"
  ) {
    const isActive = videoPlayer.value.isSessionActive();
    if (isActive && !hasEndedSession.value) {
      hasEndedSession.value = true; // Prevent double-ending
      try {
        const status = shouldMarkAsCompleted ? "completed" : "abandoned";
        await videoPlayer.value.endPlaybackSession(status);
      } catch (err) {
        console.error("Error ending session on unmount:", err);
      }
    }
  }
});

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("resize", checkMobile);

  if (backButtonTimeout.value) {
    clearTimeout(backButtonTimeout.value);
  }
});
</script>

<style scoped>
.video-page {
  @apply relative overflow-hidden;
}

.video-container {
  @apply w-full h-screen;
}

.back-button {
  @apply fixed top-6 left-6 z-40 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:bg-black/70;
}

.back-button.mobile {
  @apply px-3 py-2;
}

.back-button svg {
  @apply w-5 h-5;
}

.back-button span {
  @apply text-sm font-medium;
}

/* Mobile styles */
@media (max-width: 767px) {
  .back-button {
    @apply top-4 left-4;
  }
}
</style>