<template>
  <Modal />
  <Navbar />
  <main class="bg-body">
    <!-- Error View -->
    <ErrorView
      v-if="error"
      :error="error"
      :title="'Content Loading Error'"
      :message="error.message"
      :show-retry="true"
      :show-back="false"
      :show-refresh="true"
      :is-refreshing="isRefreshing"
      @retry="retryContent"
      @refresh="refreshPage"
    />

    <!-- Content when no error -->
    <div v-if="!error">
      <SectionOne
        text="Stream the Best Movies & Series Anytime, Anywhere"
        small="Enjoy unlimited movies, series, and exclusive content in stunning quality. Stream anytime, anywhere, on any device—no interruptions, just pure entertainment"
        button="Get Started"
        :posters="featuredPosters"
      />

      <SectionTwo
        title="Trending"
        iconAlt="Flame icon"
        :content="trendingContent"
        :showSeeMore="true"
        :fetchContent="false"
      />
      <SectionTwo
        title="Anticipate"
        iconAlt="Flame icon"
        :content="anticipatedContent"
        :showSeeMore="true"
        :fetchContent="false"
      />
      <SectionThree />
      <SectionFour />
      <SectionLast />
    </div>
  </main>
</template>

<script setup>
import Modal from "~/components/Modal/Modal.vue";
import Navbar from "~/components/Navbar/Navbar.vue";
import HeroHome from "~/components/HeroHome/HeroHome.vue";
import SectionOne from "~/components/SectionOne/SectionOne.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import SectionThree from "~/components/SectionThree/SectionThree.vue";
import SectionFour from "~/components/SectionFour/SectionFour.vue";
import SectionLast from "~/components/SectionLast/SectionLast.vue";
import ErrorView from "~/components/ErrorView/ErrorView.vue";

import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";
import { useBlobImages } from "~/composables/useBlobImages";
import { usePageError } from "~/composables/usePageError";

definePageMeta({
  middleware: ["auth"],
});

// Page-level error handling
const { error, handleApiError, handleRetry, clearError } = usePageError();

// Featured content state
const featuredPosters = ref([]);
const featuredLoading = ref(true);

// Anticipated content state
const anticipatedContent = ref([]);
const anticipatedLoading = ref(true);

// Recommended content state
const recommendedContent = ref([]);
const recommendedLoading = ref(true);

// Trending content state
const trendingContent = ref([]);
const trendingLoading = ref(true);

// Refresh loading state
const isRefreshing = ref(false);

// Blob images composable
const { preloadContentImages } = useBlobImages();

// Load featured content
const loadFeaturedContent = async () => {
  try {
    featuredLoading.value = true;
    const response = await ContentService.getFeaturedContent();
    featuredPosters.value = response.data;

    // Use full content objects for SectionOne to work with getPrimaryImageUrl
    featuredPosters.value = response.data;
    if (featuredPosters.value.length > 0) {
      await preloadContentImages(featuredPosters.value);
    }

    // Clear any previous errors on success
    if (error.value) {
      console.log("Clearing error after successful featured content load");
      clearError();
    }
  } catch (err) {
    console.error("Error loading featured content:", err);
    handleApiError(err);
  } finally {
    featuredLoading.value = false;
  }
};

// Load anticipated content
const loadAnticipatedContent = async () => {
  try {
    anticipatedLoading.value = true;
    const response = await ContentService.getAnticipatedContent();
    anticipatedContent.value = response.data;

    // Preload images for anticipated content
    if (anticipatedContent.value.length > 0) {
      await preloadContentImages(anticipatedContent.value);
    }

    // Clear any previous errors on success
    if (error.value) {
      console.log("Clearing error after successful anticipated content load");
      clearError();
    }
  } catch (err) {
    console.error("Error loading anticipated content:", err);
    handleApiError(err);
  } finally {
    anticipatedLoading.value = false;
  }
};

// Load recommended content
const loadRecommendedContent = async () => {
  try {
    recommendedLoading.value = true;
    const response = await ContentService.getRecommendedContent();
    recommendedContent.value = response.data;

    // Preload images for recommended content
    if (recommendedContent.value.length > 0) {
      await preloadContentImages(recommendedContent.value);
    }

    // Clear any previous errors on success
    if (error.value) {
      console.log("Clearing error after successful recommended content load");
      clearError();
    }
  } catch (err) {
    console.error("Error loading recommended content:", err);
    handleApiError(err);
  } finally {
    recommendedLoading.value = false;
  }
};

// Fetch trending content
const fetchTrendingContent = async () => {
  try {
    trendingLoading.value = true;
    const response = await ContentService.getTrendingContent();

    trendingContent.value = response.data;

    // Preload all images for trending content
    if (trendingContent.value.length > 0) {
      await preloadContentImages(response.data, "public");
    }
    // Clear any previous errors on success
    if (error.value) {
      console.log("Clearing error after successful trending content load");
      clearError();
    }
  } catch (err) {
    console.error("Error loading trending content:", err);
    handleApiError(err);
  } finally {
    trendingLoading.value = false;
  }
};

// Retry content loading
const retryContent = async () => {
  try {
    console.log("Retrying content...");

    // Clear error state before retrying
    clearError();

    await Promise.all([
      loadFeaturedContent(),
      loadAnticipatedContent(),
      loadRecommendedContent(),
      fetchTrendingContent(),
    ]);

    console.log("Content retry successful - all content loaded");
  } catch (err) {
    console.error("Retry failed:", err);
    // Error will be handled by the error view
  }
};

// Refresh page - improved version that doesn't require full page reload
const refreshPage = async () => {
  try {
    console.log("Refreshing content...");
    isRefreshing.value = true;

    // Clear error state
    clearError();

    // Reset loading states
    featuredLoading.value = true;
    anticipatedLoading.value = true;
    recommendedLoading.value = true;

    // Clear existing content
    featuredPosters.value = [];
    anticipatedContent.value = [];
    recommendedContent.value = [];

    // Reload all content
    await Promise.all([
      loadFeaturedContent(),
      loadAnticipatedContent(),
      loadRecommendedContent(),
      fetchTrendingContent(),
    ]);

    console.log("Page refresh successful - all content reloaded");

    // Ensure error is cleared after successful refresh
    if (error.value) {
      console.log("Force clearing error after successful refresh");
      clearError();
    }
  } catch (err) {
    console.error("Page refresh failed:", err);
    // Error will be handled by the error view
  } finally {
    isRefreshing.value = false;
  }
};

// Load all content on mount
onMounted(async () => {
  try {
    await Promise.all([
      loadFeaturedContent(),
      loadAnticipatedContent(),
      loadRecommendedContent(),
      fetchTrendingContent(),
    ]);
  } catch (err) {
    console.error("Error loading content:", err);
    // Error is already handled by individual load functions
  }
});

// Watch functions
const handleWatchContent = (content) => {
  navigateTo(`/watch/${content.slug}`);
};

const handleAddToList = (content) => {
  // Handle add to list functionality
  console.log("Add to list:", content);
};
</script>

<style>
.btn:hover {
  animation: hover-state 0.5s linear forwards;
}

@keyframes hover-state {
  to {
    transform: scale(1.05);
    background-color: var(--color-hover);
  }
}
</style>
