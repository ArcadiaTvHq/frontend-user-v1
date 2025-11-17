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

// Navigation
const goBack = async () => {
  // End playback session before navigating
  if (
    videoPlayer.value &&
    typeof videoPlayer.value.isSessionActive === "function"
  ) {
    const isActive = videoPlayer.value.isSessionActive();

    if (isActive && !hasEndedSession.value) {
      hasEndedSession.value = true; // Prevent double-ending
      try {
        await videoPlayer.value.endPlaybackSession("abandoned");
      } catch (err) {
        // Continue with navigation even if session end fails
      }
    } else {
    }
  } else {
  }

  // Simple approach: Use browser history if available
  if (history.length > 1 && document.referrer) {
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

const handleVideoEnded = () => {};

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
    const { ContentService } = await import("~/api/services/content.service");
    const response = await ContentService.getContentBySlug(route.params.slug);
    content.value = response.data;
  } catch (err) {
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
  // Prevent direct access to video page - users must come from detail page
  if (
    !document.referrer ||
    !document.referrer.includes(window.location.origin)
  ) {
    router.push(`/watch/${route.params.slug}`);
    return;
  }

  // Add event listeners
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("touchstart", handleTouchStart);

  // Check mobile
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Load content first
  await loadContent();

  // Then ensure adverts are loaded
  await ensureAdvertsLoaded();
});

onBeforeUnmount(async () => {
  // End playback session before component unmounts
  if (
    videoPlayer.value &&
    typeof videoPlayer.value.isSessionActive === "function"
  ) {
    const isActive = videoPlayer.value.isSessionActive();
    if (isActive) {
      hasEndedSession.value = true; // Prevent double-ending
      try {
        await videoPlayer.value.endPlaybackSession("abandoned");
      } catch (err) {}
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