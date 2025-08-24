<template>
  <div class="trailer-page min-h-screen bg-black">
    <!-- Back to Details Button -->
    <div class="back-button-container">
      <NuxtLink :to="`/watch/${content?.slug}`" class="back-button">
        <div class="back-button-content">
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="ml-2 text-white font-medium">Back to Details</span>
        </div>
      </NuxtLink>
    </div>

    <main class="bg-black pt-[60px] sm:pt-[75px] md:pt-[92px]">
      <div v-if="content" class="container mx-auto px-4">
        <!-- Video Player -->
        <div v-if="content.trailer_upload_status === 'ready'" class="mb-8">
          <CustomVideoPlayer
            :key="content.id"
            :contentId="content.id"
            player-type="trailer"
            :bannerImage="content.banner_image_id"
            :autoplay="true"
            :muted="false"
            :controls="true"
            :loop="false"
            :video-url="content.trailer_url"
            :use-direct-url="!!content.trailer_url"
            @video-started="handleVideoStarted"
            @video-paused="handleVideoPaused"
            @video-ended="handleVideoEnded"
            @error="handleVideoError"
            @ready="handleVideoReady"
          />
        </div>
        <div v-else class="w-full bg-gray-900 rounded-lg p-8 text-center mb-8">
          <h2 class="text-2xl font-bold text-white mb-3">
            Trailer Coming Soon
          </h2>
          <p class="text-gray-400">
            We're currently processing this trailer. Please check back later.
          </p>
        </div>

        <!-- Content Detail Section -->
        <ContentDetail
          v-if="content"
          :content="content"
          :showPosterOverlay="false"
        />

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
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { useContentType } from "~/composables/useContentType";
import { ContentService } from "~/api/services/content.service";
import CustomVideoPlayer from "~/components/VideoPlayer/CustomVideoPlayer.vue";
import ContentDetail from "~/components/ContentDetail/ContentDetail.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";

// Set page layout
definePageMeta({
  layout: "video",
  middleware: ["auth"],
});

const route = useRoute();
const content = ref(null);
const relatedContent = ref([]);
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const { setContentType } = useContentType();

// Fetch content details when component mounts
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
  } catch (error) {
    console.error("Error fetching content details:", error);
  }
});

// Video event handlers
const handleVideoStarted = () => {
  console.log("Trailer video started");
};

const handleVideoPaused = () => {
  console.log("Trailer video paused");
};

const handleVideoEnded = () => {
  console.log("Trailer video ended");
};

const handleVideoError = (error) => {
  console.error("Trailer video error:", error);
};

const handleVideoReady = () => {
  console.log("Trailer video ready");
};
</script>

<style scoped>
.trailer-page {
  @apply relative;
}

/* Back Button Styles */
.back-button-container {
  @apply fixed top-0 left-0 z-50 p-4;
}

.back-button {
  @apply inline-flex items-center px-4 py-2 bg-black bg-opacity-75 hover:bg-opacity-90
         rounded-lg transition-all duration-300 backdrop-blur-sm border border-white border-opacity-20;
}

.back-button-content {
  @apply flex items-center;
}

.back-button:hover {
  @apply opacity-100;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .back-button-container {
    @apply p-2;
  }

  .back-button {
    @apply px-3 py-2;
  }

  .back-button span {
    @apply hidden;
  }
}
</style>