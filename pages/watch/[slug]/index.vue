<template>
  <div class="min-h-screen bg-black">
    <Navbar />
    <main v-if="content" class="bg-black">
      <!-- Mobile Layout -->
      <div class="block md:hidden">
        <!-- Background Image for Mobile -->
        <div class="relative w-full h-screen">
          <img
            :src="buildImageUrl(content.banner_image_id, 'public')"
            :alt="content.title"
            class="w-full h-full object-cover"
          />

          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-black/60"></div>

          <!-- Content Detail Section (mobile) -->
          <div class="absolute inset-0 flex items-center z-20">
            <ContentDetail
              :content="content"
              :showPosterOverlay="content.trailer_upload_status === 'ready'"
              @trailer-click="handleMobileTrailerClick"
            />
          </div>
        </div>

        <!-- Mobile Video Player (hidden by default, shows in landscape when trailer clicked) -->
        <div
          v-if="watchingTrailer && content.trailer_upload_status === 'ready'"
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

          <CustomVideoPlayer
            :key="`mobile-${content.id}`"
            :contentId="content.id"
            player-type="trailer"
            :bannerImage="content.banner_image_id"
            :autoplay="true"
            :muted="false"
            :controls="true"
            :loop="false"
            @video-started="handleVideoStarted"
            @video-paused="handleVideoPaused"
            @video-ended="handleVideoEnded"
            @error="handleVideoError"
            @ready="handleVideoReady"
          />
        </div>

        <!-- Hidden video for background loading -->
        <div class="hidden">
          <CustomVideoPlayer
            :key="`mobile-bg-${content.id}`"
            :contentId="content.id"
            player-type="trailer"
            :bannerImage="content.banner_image_id"
            :autoplay="false"
            :muted="true"
            :controls="false"
            :loop="false"
            :preload="'metadata'"
          />
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="hidden md:block">
        <!-- Background Image with Gradient Overlay -->
        <div class="relative w-full">
          <!-- Background Image (always shown behind video) -->
          <img
            v-if="content.trailer_upload_status === 'ready'"
            :src="buildImageUrl(content.banner_image_id, 'public')"
            :alt="content.title"
            class="w-full h-full object-cover absolute inset-0"
          />

          <!-- Video Player -->
          <div
            v-if="content.trailer_upload_status === 'ready'"
            class="relative w-full h-full"
          >
            <CustomVideoPlayer
              :key="content.id"
              :contentId="content.id"
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

          <!-- Background Image (when no trailer) -->
          <img
            v-else
            :src="buildImageUrl(content.banner_image_id, 'public')"
            :alt="content.title"
            class="w-full h-full object-cover"
          />

          <!-- Enhanced gradient overlay (hidden when watching trailer) -->
          <div
            v-show="!watchingTrailer"
            class="absolute inset-0 bg-black/50 z-10 transition-opacity duration-500"
          ></div>

          <!-- Content Detail Section (only shown when not watching trailer) -->
          <ContentDetail
            v-show="!watchingTrailer"
            :content="content"
            :showPosterOverlay="content.trailer_upload_status === 'ready'"
            class="absolute inset-0 flex items-center z-20 transition-all duration-500 ease-in-out"
            @trailer-click="handleTrailerClick"
          />
        </div>

        <!-- Content Detail Section (shown below video when watching trailer) -->
        <div
          v-show="watchingTrailer"
          class="mt-10"
          :class="
            watchingTrailer
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
      </div>

      <comment />

      <!-- Related Content Section -->
      <SectionTwo
        title="More Like This"
        iconAlt="Similar content icon"
        :content="relatedContent"
        :showSeeMore="false"
        :fetchContent="false"
      />

      <!-- Conditional Footer -->
      <div class="mt-20 md:mt-32">
        <HomeFoot v-if="isAuthenticated" />
        <SectionLast v-else />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useLoadingStore } from "~/stores/loading";
import { useContentType } from "~/composables/useContentType";
import { useComponentLoading } from "~/composables/useComponentLoading";
import { ContentService } from "~/api/services/content.service";
import Navbar from "~/components/Navbar/Navbar.vue";
import CustomVideoPlayer from "~/components/VideoPlayer/CustomVideoPlayer.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import { buildImageUrl } from "~/src/utils/helpers";

// Lazy load components that are not immediately visible
const HomeFoot = defineAsyncComponent(() =>
  import("~/components/HomeFoot/HomeFoot.vue")
);
const SectionLast = defineAsyncComponent(() =>
  import("~/components/SectionLast/SectionLast.vue")
);

const route = useRoute();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const { setContentType } = useContentType();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Component loading management
const { startLoading, stopLoading } = useComponentLoading(
  `watch-page-${route.params.slug}`
);

// State
const content = ref(null);
const relatedContent = ref([]);
const videoStarted = ref(false);
const watchingTrailer = ref(false);

// Single async data call for content
const { data: contentData, pending: contentPending } = await useAsyncData(
  `content-${route.params.slug}`,
  () => ContentService.getContentBySlug(route.params.slug),
  {
    server: false, // Only fetch on client to reduce server load
    lazy: true, // Don't block initial render
  }
);

// Single async data call for related content
const { data: relatedData, pending: relatedPending } = await useAsyncData(
  "related-content",
  () => ContentService.getContents({ limit: 6, page: 1 }),
  {
    server: false,
    lazy: true,
  }
);

// Blob images composable
const { preloadContentImages } = useBlobImages();

onMounted(async () => {
  startLoading(); // Start component loading

  try {
    // Use the data from useAsyncData instead of making duplicate calls
    if (contentData.value?.data) {
      content.value = contentData.value.data;

      // Set the content type based on the content's type (movie or series)
      if (content.value.movie) {
        setContentType("movie");
      } else if (content.value.series) {
        setContentType("series");
      }
    }

    if (relatedData.value?.data) {
      relatedContent.value = relatedData.value.data;
      console.log(
        "Related content loaded:",
        relatedContent.value.length,
        "items"
      );
      console.log("First item:", relatedContent.value[3]);

      // Debug image IDs
      if (relatedContent.value[3]) {
        console.log(
          "First item poster ID:",
          relatedContent.value[3].poster_image_id
        );
        console.log(
          "First item banner ID:",
          relatedContent.value[3].banner_image_id
        );
        console.log(
          "First item thumbnail ID:",
          relatedContent.value[3].thumbnail_image_id
        );
      }

      // Preload images and wait for them to be ready
      try {
        await preloadContentImages(relatedData.value.data, "public");
        console.log("Images preloaded successfully");
      } catch (error) {
        console.warn("Failed to preload some related images:", error);
      }
    }
  } catch (error) {
    console.error("Error processing content data:", error);
  } finally {
    stopLoading(); // Stop component loading when done
  }

  // Ensure route loading is stopped after a short delay
  setTimeout(() => {
    loadingStore.stopRouteLoading();
  }, 1000);
});

// Set content after data is loaded
watchEffect(() => {
  if (contentData.value?.data && !content.value) {
    content.value = contentData.value.data;
    // Set the content type when content is loaded
    setContentType(content.value.type);
  }
  if (relatedData.value?.data && !relatedContent.value.length) {
    relatedContent.value = relatedData.value.data;
  }
});

// Stop loading when content is ready OR after a timeout
watchEffect(() => {
  if (
    content.value &&
    relatedContent.value.length > 0 &&
    !contentPending.value &&
    !relatedPending.value
  ) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loadingStore.stopLoading();
      loadingStore.stopRouteLoading(); // Ensure route loading is stopped
    }, 100);
  }
});

// Fallback: Stop route loading after a reasonable timeout
onMounted(() => {
  setTimeout(() => {
    loadingStore.stopRouteLoading();
  }, 5000); // 5 second fallback
});

onBeforeUnmount(() => {
  loadingStore.stopLoading();
  loadingStore.stopRouteLoading(); // Ensure route loading is stopped when leaving
  // Clear content type when leaving the page
  setContentType(null);
});

const handleVideoStarted = () => {
  videoStarted.value = true;
};

const handleVideoPaused = () => {
  console.log("Video paused");
};

const handleVideoEnded = () => {
  console.log("Video ended");
  // On mobile, close the trailer when it ends
  if (window.innerWidth < 768) {
    watchingTrailer.value = false;
  }
};

const handleVideoError = (error) => {
  console.error("Video error:", error);
};

const handleVideoReady = () => {
  console.log("Video ready");
};

// Desktop trailer click handler
const handleTrailerClick = () => {
  watchingTrailer.value = true;
  // With custom video player, we can directly control the video element
  setTimeout(() => {
    const videoPlayer = document.querySelector("video");
    if (videoPlayer) {
      try {
        // Direct control over video properties
        videoPlayer.muted = false;
        videoPlayer.volume = 0.8;
        console.log("Successfully unmuted video");
      } catch (error) {
        console.log("Could not unmute video:", error);
      }
    }
  }, 100);
};

// Mobile trailer click handler
const handleMobileTrailerClick = () => {
  watchingTrailer.value = true;
  // Prevent body scroll when trailer is open
  document.body.style.overflow = "hidden";
  document.body.classList.add("video-open");
};

// Mobile trailer close handler
const handleMobileTrailerClose = () => {
  watchingTrailer.value = false;
  // Restore body scroll
  document.body.style.overflow = "";
  document.body.classList.remove("video-open");
};

definePageMeta({
  middleware: ["auth", "content-loading"],
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
</style>