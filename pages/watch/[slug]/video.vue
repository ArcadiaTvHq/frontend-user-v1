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
        :key="videoKey"
        :content-id="content.id"
        :player-type="'video'"
        :autoplay="false"
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
import { ref, onMounted, onUnmounted, nextTick } from "vue";
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
const goBack = () => {
  router.push(`/watch/${route.params.slug}`);
};

// Video event handlers
const handleVideoStarted = () => {
  console.log("Main video started");
  // Clear any previous errors
  if (error.value) {
    clearError();
  }
};

const handleVideoPaused = () => {
  console.log("Main video paused");
};

const handleVideoEnded = () => {
  console.log("Main video ended");
};

const handleVideoError = (videoError) => {
  console.error("Main video error:", videoError);

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
  console.log("Main video ready");
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
    console.log(`Video retry initiated with key ${videoKey.value}`);
  } catch (err) {
    console.error("Retry failed:", err);
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
    console.error("Error fetching content details:", err);
    handleApiError(err);
  }
};

// Ensure adverts are loaded before video player initializes
const ensureAdvertsLoaded = async () => {
  const { useAdvertStore } = await import("~/stores/adverts");
  const advertStore = useAdvertStore();

  // If no adverts are loaded, fetch them
  if (!advertStore.adverts || advertStore.adverts.length === 0) {
    console.log("📊 No adverts loaded, fetching adverts for content");
    try {
      await advertStore.fetchAdverts({ content_id: content.value?.id });
      console.log("✅ Adverts loaded successfully");
    } catch (error) {
      console.warn("⚠️ Failed to load adverts, continuing without ads:", error);
    }
  } else {
    console.log("📊 Adverts already loaded:", advertStore.adverts.length);
  }
};

onMounted(async () => {
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