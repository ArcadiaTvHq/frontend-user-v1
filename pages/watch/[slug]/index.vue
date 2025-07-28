<template>
  <div class="min-h-screen bg-black">
    <Navbar />
    <main v-if="content" class="bg-black">
      <!-- Background Image with Gradient Overlay -->
      <div class="relative h-[85vh] w-full">
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
          <VideoPlayer
            :key="content.id"
            :contentId="content.id"
            player-type="trailer"
            :bannerImage="content.banner_image_id"
            :autoplay="true"
            :muted="!watchingTrailer"
            :controls="watchingTrailer"
            :loop="!watchingTrailer"
            @video-started="handleVideoStarted"
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
        class="container mx-auto px-4 md:px-8 lg:px-12 py-8 transition-all duration-500 ease-in-out transform"
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

      <div class="px-20">
        <comment />
      </div>

      <!-- Related Content Section -->
      <div class="container mx-auto px-4 py-8">
        <SectionTwo
          title="More Like This"
          iconAlt="Similar content icon"
          :content="relatedContent"
          :showSeeMore="false"
          :fetchContent="false"
        />
      </div>

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
import { ContentService } from "~/api/services/content.service";
import Navbar from "~/components/Navbar/Navbar.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import HomeFoot from "~/components/HomeFoot/HomeFoot.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";
import { buildImageUrl } from "~/src/utils/helpers";

const route = useRoute();
const authStore = useAuthStore();
const loadingStore = useLoadingStore();
const { setContentType } = useContentType();
const isAuthenticated = computed(() => authStore.isAuthenticated);

// State
const content = ref(null);
const relatedContent = ref([]);
const videoStarted = ref(false);
const watchingTrailer = ref(false);

// Async setup
const { data: contentData } = await useAsyncData(
  `content-${route.params.slug}`,
  () => ContentService.getContentBySlug(route.params.slug)
);

const { data: relatedData } = await useAsyncData("related-content", () =>
  ContentService.getContents({ limit: 6, page: 1 })
);

onMounted(async () => {
  try {
    const response = await ContentService.getContentBySlug(route.params.slug);
    content.value = response.data;

    // Set the content type based on the content's type (movie or series)
    if (content.value.movie) {
      setContentType("movie");
    } else if (content.value.series) {
      setContentType("series");
    }

    // Fetch related content
    const relatedResponse = await ContentService.getContents({
      limit: 6,
      page: 1,
      // exclude_ids: [content.value.id], // We can exclude current content by ID
    });
    relatedContent.value = relatedResponse.data;
    // Preload all images for related content
    try {
      await preloadContentImages(relatedResponse.data, "public");
    } catch (error) {
      console.warn("Failed to preload some related images:", error);
    }
  } catch (error) {
    console.error("Error fetching content details:", error);
  }
});

// Set content after data is loaded
watchEffect(() => {
  if (contentData.value?.data) {
    content.value = contentData.value.data;
    // Set the content type when content is loaded
    setContentType(content.value.type);
  }
  if (relatedData.value?.data) {
    relatedContent.value = relatedData.value.data;
  }
});

// Stop loading when content is ready
watchEffect(() => {
  if (content.value && relatedContent.value) {
    // Small delay to ensure smooth transition
    setTimeout(() => {
      loadingStore.stopLoading();
    }, 100);
  }
});

onBeforeUnmount(() => {
  loadingStore.stopLoading();
  // Clear content type when leaving the page
  setContentType(null);
});

const handleVideoStarted = () => {
  videoStarted.value = true;
};

const handleTrailerClick = () => {
  watchingTrailer.value = true;
  // Force unmute the video with a delay to ensure iframe is ready
  setTimeout(() => {
    const videoPlayer = document.querySelector("iframe");
    if (videoPlayer && videoPlayer.contentWindow) {
      try {
        // Try multiple methods to unmute
        videoPlayer.contentWindow.postMessage(
          JSON.stringify({
            method: "setMuted",
            value: false,
          }),
          "*"
        );

        // Also try direct iframe communication
        videoPlayer.contentWindow.postMessage(
          JSON.stringify({
            method: "unmute",
          }),
          "*"
        );
      } catch (error) {
        console.log("Could not unmute video:", error);
      }
    }
  }, 100);
};

definePageMeta({
  middleware: ["auth", "content-loading"],
});
</script>