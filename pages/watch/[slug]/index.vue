<template>
  <Review v-if="content" :content="content" />
  <div class="min-h-screen bg-black" v-if="!review">
    <Navbar />
    <main v-if="content" class="bg-black">
      <!-- Mobile Template -->
      <template v-if="isMobileComputed">
        <!-- Background Image and Content (hidden when watching trailer) -->
        <div
          v-show="!watchingTrailer"
          class="relative w-full min-h-screen background-image-container"
        >
          <img
            :src="buildImageUrl(content.banner_image_id, 'public')"
            :alt="content.title"
            class="background-image"
          />

          <!-- Gradient overlay -->
          <div class="background-overlay"></div>

          <!-- Content Detail Section (mobile) - allow full expansion -->
          <div class="relative z-20 py-20 content-layer mobile-content-expand">
            <ContentDetail
              :content="content"
              :showPosterOverlay="true"
              @trailer-click="handleMobileTrailerClick"
            />
          </div>
        </div>

        <!-- Mobile Video Player (always present, shows when trailer is clicked) -->
        <div
          class="mobile-video-container"
          :class="watchingTrailer ? 'block' : 'hidden'"
        >
          <!-- Close button for mobile -->
          <button
            @click="handleMobileTrailerClose"
            class="absolute top-4 right-4 z-[99999] bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-colors shadow-lg"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>

          <!-- Video Player with Error Handling -->
          <div v-if="!videoError" class="w-full h-full">
            <CustomTrailerPlayer
              ref="videoPlayerRefs.mobile"
              :key="`mobile-${content.slug}-${videoKey}`"
              :contentSlug="content.slug"
              player-type="trailer"
              :bannerImage="content.banner_image_id"
              :autoplay="watchingTrailer"
              :muted="!watchingTrailer"
              :controls="watchingTrailer"
              :loop="false"
              @video-started="handleVideoStarted"
              @video-paused="handleVideoPaused"
              @video-ended="handleVideoEnded"
              @error="handleVideoError"
              @ready="handleVideoReady"
            />
          </div>

          <!-- Error State for Mobile -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center error-container error-transition"
          >
            <div class="text-center text-white p-6">
              <div
                class="w-20 h-20 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold mb-2">Video Unavailable</h3>
              <p class="text-gray-300 mb-4">{{ videoErrorMessage }}</p>
              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  @click="retryVideo"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors retry-button"
                >
                  Try Again
                </button>
                <button
                  @click="goBackToDetail"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Desktop Template -->
      <template v-else>
        <!-- Background Image with Gradient Overlay -->
        <div class="relative w-full background-image-container">
          <!-- Background Image (always shown behind video) -->
          <img
            :src="buildImageUrl(content.banner_image_id, 'public')"
            :alt="content.title"
            class="background-image"
          />

          <!-- Video Player with Error Handling -->
          <div
            class="relative w-full h-full"
            style="min-height: calc(100vh - var(--navbar-height, 80px))"
          >
            <div v-if="!videoError" class="w-full h-full">
              <CustomTrailerPlayer
                ref="videoPlayerRefs.desktop"
                :key="`desktop-${content.slug}-${videoKey}`"
                :contentSlug="content.slug"
                player-type="trailer"
                :bannerImage="content.banner_image_id"
                :autoplay="true"
                :muted="!watchingTrailer"
                :controls="watchingTrailer"
                :loop="!watchingTrailer"
                @video-started="handleVideoStarted"
                @video-paused="handleVideoPaused"
                @video-ended="handleVideoEnded"
                @error="handleVideoError"
                @ready="handleVideoReady"
                :showLoading="watchingTrailer"
              />
            </div>

            <!-- Error State for Desktop -->
            <div
              v-else
              class="w-full h-full flex items-center justify-center error-container error-transition"
            >
              <div class="text-center text-white p-8 max-w-md">
                <div
                  class="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
                >
                  <svg
                    class="w-12 h-12 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-3">Video Unavailable</h3>
                <p class="text-gray-300 mb-6">{{ videoErrorMessage }}</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    @click="retryVideo"
                    class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium retry-button"
                  >
                    Try Again
                  </button>
                  <button
                    @click="goBackToDetail"
                    class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Back to Detail
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced gradient overlay (hidden when watching trailer or when there's an error) -->
          <div
            v-show="!watchingTrailer && !videoError"
            class="background-overlay z-10 transition-opacity duration-500"
          ></div>

          <!-- Content Detail Section (only shown when not watching trailer and no error) -->
          <ContentDetail
            v-show="!watchingTrailer && !videoError"
            :content="content"
            :showPosterOverlay="true"
            class="content-detail-overlay content-layer"
            @trailer-click="handleTrailerClick"
          />
        </div>

        <!-- Content Detail Section (shown below video when watching trailer or when there's an error) -->
        <div
          v-show="watchingTrailer || videoError"
          class="content-detail-below"
          :class="
            watchingTrailer || videoError
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          "
        >
          <ContentDetail
            :content="content"
            :showPosterOverlay="false"
            @trailer-click="handleTrailerClick"
          />
        </div>
      </template>

      <!-- Series Component -->
      <Series v-if="content?.type === 'series'" :content="content" />

      <Comment
        v-if="content"
        :content-id="content.id"
        :interactions="content.interactions"
      />

      <!-- Similar Content Section -->
      <SectionTwo
        title="More Like This"
        iconAlt="Similar content icon"
        :content="relatedContent"
        :showSeeMore="false"
        :fetchContent="false"
        @watchlist-updated="handleSimilarContentWatchlistUpdate"
      />

      <!-- Conditional Footer -->
      <div class="mt-20 md:mt-32">
        <HomeFoot v-if="isAuthenticated" />
        <SectionLast v-else />
      </div>
    </main>

    <!-- Loading State - Standardized -->
    <StandardLoadingScreen
      v-else-if="contentPending"
      variant="content"
      :show-progress="true"
      :progress="loadingProgress"
      :progress-text="loadingMessage"
    />

    <!-- Error State for Content Loading -->
    <div
      v-else
      class="min-h-screen error-container flex items-center justify-center"
    >
      <div class="text-center text-white p-8 max-w-md">
        <div
          class="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-3">Content Unavailable</h3>
        <p class="text-gray-300 mb-6">
          Unable to load the requested content. Please try again later.
        </p>
        <button
          @click="retryContent"
          class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium retry-button"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useAdvertStore } from "~/stores/adverts";
import { useLoadingStore } from "~/stores/loading";
import { useWatchlistStore } from "~/stores/watchlist";
import { useContentType } from "~/composables/useContentType";
import { ContentService } from "~/api/services/content.service";
import { nextTick } from "vue";
import { useBlobImages } from "~/composables/useBlobImages";
import Navbar from "~/components/Navbar/Navbar.vue";
import CustomTrailerPlayer from "~/components/VideoPlayer/CustomTrailerPlayer.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import { buildImageUrl } from "~/src/utils/helpers";
import StandardLoadingScreen from "~/components/LoadingScreen/StandardLoadingScreen.vue";

//review component
const modal = useModal();
const review = computed(() => modal.isReview);

// Lazy load components that are not immediately visible
const HomeFoot = defineAsyncComponent(
  () => import("~/components/HomeFoot/HomeFoot.vue")
);
const SectionLast = defineAsyncComponent(
  () => import("~/components/SectionLast/SectionLast.vue")
);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const advertStore = useAdvertStore();
const loadingStore = useLoadingStore();
const { setContentType } = useContentType();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// State
const content = ref(null);
const relatedContent = ref([]);
const videoStarted = ref(false);
const watchingTrailer = ref(false);
const isMobile = ref(false);

// Video player state management
const videoError = ref(false);
const videoErrorMessage = ref("");
const videoRetryCount = ref(0);
const maxVideoRetries = ref(5); // Increased for background retries
const videoKey = ref(0);
const isBackgroundRetrying = ref(false); // Track background retry state
const backgroundRetryInterval = ref(null); // Background retry timer
const videoPlayerRefs = ref({ mobile: null, desktop: null }); // References to video player components

// Loading state for standardized loading screen
const loadingProgress = ref(0);
const loadingMessage = ref("Loading content...");

// Single async data call for content
const { data: contentData, pending: contentPending } = await useAsyncData(
  `content-${route.params.slug}`,
  async () => {
    const response = await ContentService.getContentBySlug(route.params.slug);
    // Fetch watchlist to update in_watch_list property
    if (response?.data) {
      try {
        const watchlistStore = useWatchlistStore();
        await watchlistStore.fetchWatchlist();
        // Update the content with watchlist status
        response.data.in_watch_list = watchlistStore.isInWatchlist(
          response.data.id
        );
      } catch (error) {}
    }
    return response;
  },
  {
    server: false, // Only fetch on client to reduce server load
    lazy: true, // Don't block initial render
  }
);

// Single async data call for similar content
const { data: similarData, pending: similarPending } = await useAsyncData(
  "similar-content",
  async () => {
    const response = await ContentService.getSimilarContent(route.params.slug);
    // Fetch watchlist to update in_watch_list property for similar content
    if (response?.data) {
      try {
        const watchlistStore = useWatchlistStore();
        await watchlistStore.fetchWatchlist();
        // Update each similar content item with watchlist status
        response.data.forEach((item) => {
          item.in_watch_list = watchlistStore.isInWatchlist(item.id);
        });
      } catch (error) {}
    }
    return response;
  },
  {
    server: false,
    lazy: true,
  }
);

// Blob images composable
const { preloadContentImages } = useBlobImages();

// Better mobile detection using multiple methods for reliability
const detectMobileDevice = () => {
  // Method 1: Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
      userAgent
    );

  // Method 2: Check for touch capability
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Method 3: Check screen dimensions (fallback for edge cases)
  const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

  // Method 4: Check for mobile-specific features
  const hasMobileFeatures =
    "orientation" in window || "deviceOrientation" in window;

  // Method 5: Check for mobile-specific CSS media queries
  const isMobileMediaQuery = window.matchMedia("(max-width: 768px)").matches;

  // Combine all methods - if any suggest mobile, treat as mobile
  const isMobileDevice =
    isMobileUA ||
    hasTouch ||
    (isSmallScreen && hasMobileFeatures) ||
    isMobileMediaQuery;

  return isMobileDevice;
};

// Initialize mobile detection once on mount
const initializeMobileDetection = () => {
  isMobile.value = detectMobileDevice();
};

// Fallback mobile detection using computed property for reliability
const isMobileComputed = computed(() => {
  // Use the detected mobile state, but fallback to screen size if needed
  if (isMobile.value) return true;

  // Fallback: check if screen size suggests mobile
  const screenSizeMobile = window.innerWidth < 768;

  // If screen size suggests mobile but detection didn't, log it
  if (screenSizeMobile && !isMobile.value) {
  }

  return isMobile.value || screenSizeMobile;
});

// Check if content is an episode or season and redirect if trying to access their detail pages
const checkEpisodeAccess = () => {
  // If content is an episode, redirect to its parent series
  if (content.value?.type === "episode") {
    // Find the root series (episode -> season -> series)
    let currentContent = content.value;

    // Traverse up the hierarchy until we find the series
    while (currentContent?.parent) {
      currentContent = currentContent.parent;

      // If we reach a series (not a season), navigate to it
      if (currentContent.type === "series") {
        router.push(`/watch/${currentContent.slug}`);
        return;
      }
    }

    // Fallback: if no series found, redirect to home
    router.push("/");
  }
  // If content is a season, redirect to its parent series
  else if (content.value?.type === "season") {
    // Find the root series (season -> series)
    let currentContent = content.value;

    // Traverse up the hierarchy until we find the series
    while (currentContent?.parent) {
      currentContent = currentContent.parent;

      // If we reach a series, navigate to it
      if (currentContent.type === "series") {
        router.push(`/watch/${currentContent.slug}`);
        return;
      }
    }

    // Fallback: if no series found, redirect to home
    router.push("/");
  }
};

// Remove the resize listener since we're not using screen size anymore
// const handleResize = () => { ... };

onMounted(async () => {
  // Initialize mobile detection using device capabilities
  initializeMobileDetection();

  try {
    // Use the data from useAsyncData instead of making duplicate calls
    if (contentData.value?.data) {
      content.value = contentData.value.data;

      // Check if trying to access episode detail page and redirect
      checkEpisodeAccess();

      // Set the content type based on the content's type (movie or series)
      if (content.value.movie) {
        setContentType("movie");
      } else if (content.value.series) {
        setContentType("series");
      }

      // Fetch adverts for this content so pause ads can work
      if (advertStore && content.value?.id) {
        try {
          const fetchedAdverts = await advertStore.fetchAdverts({
            content_id: content.value.id,
          });
        } catch (error) {}
      } else {
      }
    }

    if (similarData.value?.data) {
      relatedContent.value = similarData.value.data;

      // Preload images and wait for them to be ready
      try {
        await preloadContentImages(similarData.value.data, "public");
      } catch (error) {}
    }
  } catch (error) {}
  // No loading state to manage - component-level loading eliminated
});

// Set content after data is loaded
watchEffect(() => {
  if (contentData.value?.data && !content.value) {
    content.value = contentData.value.data;

    // Check if trying to access episode detail page and redirect
    checkEpisodeAccess();

    // Set the content type when content is loaded
    setContentType(content.value.type);
  }
  if (similarData.value?.data && !relatedContent.value.length) {
    relatedContent.value = similarData.value.data;
  }
});

// Watch for content loading errors
watchEffect(() => {
  if (contentPending.value && !content.value) {
    // Content is still loading
    return;
  }

  if (!content.value && !contentPending.value) {
    // Content failed to load
    // This will trigger the error state in the template
  }
});

// Watch for video error state changes
watch(videoError, (newErrorState) => {
  if (newErrorState) {
    checkVideoPlayerHealth();
  } else {
  }
});

// Stop loading when content is ready OR after a timeout
watchEffect(() => {
  if (
    content.value &&
    relatedContent.value.length > 0 &&
    !contentPending.value &&
    !similarPending.value
  ) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loadingStore.stopLoading();
    }, 100);
  }
});

// No route loading to manage - component-level loading eliminated

onBeforeUnmount(() => {
  loadingStore.stopLoading();
  // No route loading to manage - component-level loading eliminated
  // Clear content type when leaving the page
  setContentType(null);

  // Resize listener removed - no longer needed with device-based detection

  // Stop all videos to prevent background playback
  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    if (!video.paused) {
      video.pause();
    }
  });
});

// Cleanup on unmount
onUnmounted(() => {
  // Stop background retry interval
  stopBackgroundRetry();

  // Restore body scroll on mobile
  if (isMobileComputed.value) {
    document.body.style.overflow = "";
    document.body.classList.remove("video-open");
  }
});

const handleVideoStarted = () => {
  videoStarted.value = true;
};

const handleVideoPaused = () => {};

const handleVideoEnded = () => {
  // On mobile, close the trailer when it ends
  if (isMobileComputed.value) {
    watchingTrailer.value = false;
  }
};

const handleVideoError = (error) => {
  videoRetryCount.value++;

  if (videoRetryCount.value <= maxVideoRetries.value) {
    // Auto-retry for certain error types
    const shouldAutoRetry =
      error.code === 2 ||
      error.code === "NETWORK_ERROR" ||
      error.code === "FETCH_FAILED";

    if (shouldAutoRetry) {
      // If not watching trailer, do silent background retry
      if (!watchingTrailer.value) {
        startBackgroundRetry();
      } else {
        // If watching trailer, show error and retry normally
        setTimeout(() => {
          retryVideo();
        }, 2000 * videoRetryCount.value); // Exponential backoff
        return;
      }
    }
  }

  // Show error state only if we're watching trailer or max retries exceeded
  if (watchingTrailer.value || videoRetryCount.value > maxVideoRetries.value) {
    videoError.value = true;
    videoErrorMessage.value =
      error.message ||
      "Failed to load video. Please check your connection and try again.";
    watchingTrailer.value = false;
    if (isMobileComputed.value) {
      document.body.style.overflow = "";
      document.body.classList.remove("video-open");
    }
  }

  // Stop background retry if we're showing error
  if (videoError.value) {
    stopBackgroundRetry();
  }
};

const handleVideoReady = () => {
  videoError.value = false;
  videoErrorMessage.value = "";
  videoRetryCount.value = 0;
  videoKey.value = 0;

  // Stop background retries when video is ready
  stopBackgroundRetry();

  // Check video player health
  checkVideoPlayerHealth();
};

const retryVideo = async () => {
  videoRetryCount.value++;

  if (videoRetryCount.value > maxVideoRetries.value) {
    videoErrorMessage.value =
      "Maximum retry attempts reached. Please try again later.";
    return;
  }

  try {
    // Reset error state
    videoError.value = false;
    videoErrorMessage.value = "";

    // Try to use the video player's built-in retry method first
    const currentPlayer = isMobile.value
      ? videoPlayerRefs.value.mobile
      : videoPlayerRefs.value.desktop;

    if (currentPlayer && typeof currentPlayer.forceRetry === "function") {
      // Clear any existing error state in the player
      if (typeof currentPlayer.clearError === "function") {
        currentPlayer.clearError();
      }

      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        currentPlayer.forceRetry();
      }, 100);
    } else {
      // Fallback: increment video key to force re-render
      videoKey.value++;
    }

    // Small delay to ensure the DOM updates properly
    nextTick(() => {});
  } catch (error) {
    videoError.value = true;
    videoErrorMessage.value = "Failed to retry video. Please try again.";
  }
};

const goBackToDetail = async () => {
  try {
    // First, try to end the playback session if there's an active video player
    const currentPlayer = isMobile.value
      ? videoPlayerRefs.value.mobile
      : videoPlayerRefs.value.desktop;

    if (
      currentPlayer &&
      typeof currentPlayer.isSessionActive === "function" &&
      currentPlayer.isSessionActive()
    ) {
      try {
        await currentPlayer.endPlaybackSession("abandoned");
      } catch (sessionError) {
        // Continue with navigation even if session end fails
      }
    }

    // Determine the appropriate listing page based on content type
    let targetRoute = "/";

    if (content.value) {
      if (content.value.type === "movie") {
        targetRoute = "/movies";
      } else if (content.value.type === "series") {
        targetRoute = "/tv-shows";
      } else {
        // Default to movies if type is unknown
        targetRoute = "/movies";
      }
    } else {
      // If content is not loaded, default to movies
      targetRoute = "/movies";
    }

    // Use a more robust navigation approach
    try {
      await navigateTo(targetRoute);
    } catch (navError) {
      // Try alternative navigation methods
      if (window.history && window.history.length > 1) {
        window.history.back();
      } else {
        // Last resort: redirect to home
        window.location.href = targetRoute;
      }
    }
  } catch (error) {
    // Fallback to window.history
    if (window.history && window.history.length > 1) {
      window.history.back();
    } else {
      // Last resort: redirect to home
      window.location.href = "/";
    }
  }
};

// Desktop trailer click handler
const handleTrailerClick = () => {
  if (watchingTrailer.value) return; // Prevent multiple clicks

  watchingTrailer.value = true;

  // Start the trailer immediately when button is clicked
  nextTick(() => {
    if (videoPlayerRefs.value?.desktop) {
      // Call the delayedAutoplay method with 0 delay to start immediately
      videoPlayerRefs.value.desktop.delayedAutoplay(0);
    }
  });
};

// Mobile trailer click handler
const handleMobileTrailerClick = () => {
  if (watchingTrailer.value) return; // Prevent multiple clicks

  watchingTrailer.value = true;

  // Prevent body scroll when trailer is open
  document.body.style.overflow = "hidden";
  document.body.classList.add("video-open");

  // Start the trailer immediately when button is clicked
  nextTick(() => {
    if (videoPlayerRefs.value?.mobile) {
      // Call the delayedAutoplay method with 0 delay to start immediately
      videoPlayerRefs.value.mobile.delayedAutoplay(0);
    }
  });
};

// Mobile trailer close handler
const handleMobileTrailerClose = () => {
  watchingTrailer.value = false;
  // Restore body scroll
  document.body.style.overflow = "";
  document.body.classList.remove("video-open");
};

const retryContent = async () => {
  try {
    // Reset loading state
    loadingStore.startLoading();

    // Re-fetch content data
    await ContentService.getContentBySlug(route.params.slug).then(
      (response) => {
        if (response?.data) {
          content.value = response.data;
          // Set the content type based on the content's type
          if (content.value.movie) {
            setContentType("movie");
          } else if (content.value.series) {
            setContentType("series");
          }
        }
      }
    );

    // Re-fetch similar content
    await ContentService.getSimilarContent(route.params.slug).then(
      (response) => {
        if (response?.data) {
          relatedContent.value = response.data;
        }
      }
    );

    // Reset error states
    videoError.value = false;
    videoErrorMessage.value = "";
    videoRetryCount.value = 0;
    videoKey.value = 0; // Reset video key for clean state
  } catch (error) {
    // Show error message
    videoError.value = true;
    videoErrorMessage.value =
      "Failed to refresh content. Please try again later.";
  } finally {
    loadingStore.stopLoading();
  }
};

// Handle watchlist updates for similar content
const handleSimilarContentWatchlistUpdate = (updateData) => {
  const contentIndex = relatedContent.value.findIndex(
    (item) => item.id === updateData.contentId
  );
  if (contentIndex !== -1) {
    relatedContent.value[contentIndex].in_watch_list = updateData.newStatus;
  }
};

// Check video player health status
const checkVideoPlayerHealth = () => {
  const mobilePlayer = videoPlayerRefs.value.mobile;
  const desktopPlayer = videoPlayerRefs.value.desktop;

  if (mobilePlayer && typeof mobilePlayer.getUrlHealth === "function") {
    const mobileHealth = mobilePlayer.getUrlHealth();
  }

  if (desktopPlayer && typeof desktopPlayer.getUrlHealth === "function") {
    const desktopHealth = desktopPlayer.getUrlHealth();
  }
};

// Background retry management
const startBackgroundRetry = () => {
  if (isBackgroundRetrying.value) return;

  isBackgroundRetrying.value = true;

  // Clear any existing interval
  if (backgroundRetryInterval.value) {
    clearInterval(backgroundRetryInterval.value);
  }

  // Set up background retry interval (every 10 seconds)
  backgroundRetryInterval.value = setInterval(() => {
    if (
      videoRetryCount.value <= maxVideoRetries.value &&
      !watchingTrailer.value
    ) {
      silentRetryVideo();
    } else {
      stopBackgroundRetry();
    }
  }, 10000); // 10 second intervals
};

const stopBackgroundRetry = () => {
  if (backgroundRetryInterval.value) {
    clearInterval(backgroundRetryInterval.value);
    backgroundRetryInterval.value = null;
  }
  isBackgroundRetrying.value = false;
};

const silentRetryVideo = () => {
  const currentPlayer = isMobile.value
    ? videoPlayerRefs.value.mobile
    : videoPlayerRefs.value.desktop;

  if (currentPlayer && typeof currentPlayer.forceRetry === "function") {
    // Use the video player's built-in retry method
    if (typeof currentPlayer.clearError === "function") {
      currentPlayer.clearError();
    }
    setTimeout(() => {
      currentPlayer.forceRetry();
    }, 100);
  } else {
    // Fallback: increment key to force re-render
    videoKey.value++;
  }
};

definePageMeta({
  middleware: ["auth"],
});
</script>

<style scoped>
/* Mobile video player styles */
@media (max-width: 767px) {
  .mobile-video-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: black;
  }

  /* Force landscape orientation for video */
  .mobile-video-container video {
    width: 100vw;
    height: 100vh;
    object-fit: contain;
  }

  /* Ensure video controls are visible on mobile */
  .mobile-video-container video::-webkit-media-controls {
    display: flex !important;
  }

  .mobile-video-container video::-webkit-media-controls-panel {
    display: flex !important;
  }

  /* Ensure close button is always visible */
  .mobile-video-container button {
    position: absolute !important;
    top: 16px !important;
    right: 16px !important;
    z-index: 99999 !important;
    background: rgba(0, 0, 0, 0.7) !important;
    color: white !important;
    padding: 12px !important;
    border-radius: 50% !important;
    border: none !important;
    cursor: pointer !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  }

  .mobile-video-container button:hover {
    background: rgba(0, 0, 0, 0.9) !important;
  }
}

/* Prevent body scroll when mobile video is open */
body.video-open {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
}

/* Background image consistency */
.background-image-container {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--navbar-height, 80px)); /* Subtract navbar height */
  min-height: 600px;
  overflow: hidden;
}

/* Mobile-specific background container - allow content to expand */
@media (max-width: 768px) {
  .background-image-container {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
}

/* CSS variable for navbar height */
:root {
  --navbar-height: 80px;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* Ensure background is always visible */
.background-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;
}

/* Error state styling */
.error-container {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(20, 20, 20, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Loading state styling */
.loading-container {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(20, 20, 20, 0.98) 100%
  );
}

/* Smooth transitions for error states */
.error-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button hover effects */
.retry-button {
  transition: all 0.2s ease-in-out;
  transform: translateY(0);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.retry-button:active {
  transform: translateY(0);
}

/* Ensure content is always above background */
.content-layer {
  position: relative;
  z-index: 2;
}

/* Mobile content expansion - allow content to take full height */
.mobile-content-expand {
  min-height: auto;
  height: auto;
}

@media (max-width: 768px) {
  .mobile-content-expand {
    padding-bottom: 2rem;
  }
}

/* Content detail positioning and styling */
.content-detail-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  transition: all 0.5s ease-in-out;
}

/* Ensure proper spacing when content moves below video */
.content-detail-below {
  margin-top: 2.5rem;
  transition: all 0.5s ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>