<template>
  <Navbar />
  <main class="bg-black pt-0">
    <!-- Show search results when there's a search query -->
    <template v-if="hasSearchQuery">
      <div class="pt-20">
        <!-- Filter buttons -->
        <div class="px-4 sm:px-9 md:px-28 mb-6">
          <div class="flex flex-wrap gap-3">
            <!-- Genre Filter -->
            <button
              class="bg-gold hover:bg-[#CE8F00] text-black px-4 py-2 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300 text-sm"
            >
              <span>Genre</span>
              <img
                src="@/assets/icons/chevron.svg"
                alt="Chevron"
                class="w-4 h-4 transition-transform duration-300 brightness-0"
              />
            </button>

            <!-- Release Year Filter -->
            <button
              class="bg-gold hover:bg-[#CE8F00] text-black px-4 py-2 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300 text-sm"
            >
              <span>Release Year</span>
              <img
                src="@/assets/icons/chevron.svg"
                alt="Chevron"
                class="w-4 h-4 transition-transform duration-300 brightness-0"
              />
            </button>

            <!-- Content Type Filter -->
            <button
              class="bg-gold hover:bg-[#CE8F00] text-black px-4 py-2 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300 text-sm"
            >
              <span>Content Type</span>
              <img
                src="@/assets/icons/chevron.svg"
                alt="Chevron"
                class="w-4 h-4 transition-transform duration-300 brightness-0"
              />
            </button>

            <!-- Sort Filter -->
            <button
              class="bg-gold hover:bg-[#CE8F00] text-black px-4 py-2 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300 text-sm"
            >
              <span>Sort</span>
              <img
                src="@/assets/icons/chevron.svg"
                alt="Chevron"
                class="w-4 h-4 transition-transform duration-300 brightness-0"
              />
            </button>
          </div>
        </div>

        <SectionTwo
          title="Search Results"
          iconAlt="Search results icon"
          :content="searchResults"
          :showSeeMore="false"
          :fetchContent="false"
          :hideHeader="true"
        />
        <div class="mt-20 md:mt-32">
          <HomeFoot />
        </div>
      </div>
    </template>

    <!-- Show normal watch content when no search -->
    <template v-else>
      <HeroHome
        :autoPlay="true"
        :autoPlayInterval="10000"
        @watch="handleWatchContent"
        @addToList="handleAddToList"
      />
      <SectionTwo
        title="Recommended"
        iconAlt="Flame icon"
        :content="recommendedContent"
        :showSeeMore="true"
        :fetchContent="false"
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
      <div class="mt-20 md:mt-32">
        <HomeFoot />
      </div>
    </template>
  </main>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";
import { useSearchStore } from "~/stores/search";
import { watch, computed, onMounted } from "vue";
import Navbar from "~/components/Navbar/Navbar.vue";
import HeroHome from "~/components/HeroHome/HeroHome.vue";
import SectionTwo from "~/components/sectionTwo/sectionTwo.vue";
import HomeFoot from "~/components/HomeFoot/HomeFoot.vue";
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";

const route = useRoute();
const router = useRouter();

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();
const searchStore = useSearchStore();
const userFullName = computed(() => authStore.userFullName);

// Get URL parameters
const contentType = computed(() => route.query.type || null);
const searchQuery = computed(() => route.query.search || null);

// Make reactive computed properties for search
const hasSearchQuery = computed(() => {
  return searchStore.hasSearchQuery;
});

const searchQueryValue = computed(() => {
  return searchStore.searchQuery;
});

const searchResults = computed(() => {
  return searchStore.searchResults;
});

// Handle URL parameters on mount
onMounted(() => {
  // If there's a search query in URL, set it in the store
  if (searchQuery.value) {
    searchStore.searchQuery = searchQuery.value;
    searchStore.performSearch(searchQuery.value);
  }
  // If there's already a search query in the store, sync URL
  else if (searchStore.searchQuery && searchStore.searchQuery.trim()) {
    searchStore.syncURLWithSearch(); // Sync URL with search state
  }
});

// Watch for route changes to handle URL parameters
watch(
  () => route.query,
  (newQuery) => {
    // Handle search query from URL
    if (newQuery.search && newQuery.search !== searchStore.searchQuery) {
      searchStore.searchQuery = newQuery.search;
      searchStore.performSearch(newQuery.search);
    }

    // Handle content type filter
    if (newQuery.type) {
      // TODO: Apply content type filter to search results
    }
  },
  { deep: true }
);

const IMAGE_DELIVERY_BASE_URL =
  "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

const buildImageUrl = (imageId) => {
  if (!imageId) return "/images/default-poster.jpg";
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/public`;
};

// Featured content state
const featuredPosters = ref([]);
const featuredLoading = ref(true);
const featuredError = ref(null);

// Anticipated content state
const anticipatedContent = ref([]);
const anticipatedLoading = ref(true);
const anticipatedError = ref(null);

// Recommended content state
const recommendedContent = ref([]);
const recommendedLoading = ref(true);
const recommendedError = ref(null);

// Trending content state
const trendingContent = ref([]);
const trendingLoading = ref(true);
const trendingError = ref(null);

// Update featured posters (called from SectionOne component)
const updateFeaturedPosters = (newPosters) => {
  featuredPosters.value = newPosters;
};

// Fetch featured content
const fetchFeaturedContent = async () => {
  try {
    featuredLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      is_featured: true,
      limit: 10,
    });

    featuredPosters.value = response.data.map((content) => ({
      id: content.id,
      image: buildImageUrl(
        content.poster_image_id || content.thumbnail_image_id
      ),
      title: content.title,
      description: content.description,
    }));
  } catch (err) {
    featuredError.value = err.message;
    // Fallback to default images if API fails
    featuredPosters.value = [
      { id: 1, image: "/images/default-poster-1.jpg" },
      { id: 2, image: "/images/default-poster-2.jpg" },
      { id: 3, image: "/images/default-poster-3.jpg" },
      { id: 4, image: "/images/default-poster-4.jpg" },
      { id: 5, image: "/images/default-poster-5.jpg" },
    ];
  } finally {
    featuredLoading.value = false;
  }
};

const { preloadContentImages } = useBlobImages();

// Fetch anticipated content
const fetchAnticipatedContent = async () => {
  try {
    anticipatedLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      // released_after: new Date().toISOString(),
      limit: 12,
      page: 1,
    });

    anticipatedContent.value = response.data;

    // Preload all images for anticipated content
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {
      console.warn("Failed to preload some anticipated images:", error);
    }
  } catch (err) {
    anticipatedError.value = err.message;
  } finally {
    anticipatedLoading.value = false;
  }
};

// Fetch recommended content
const fetchRecommendedContent = async () => {
  try {
    recommendedLoading.value = true;
    const response = await ContentService.getRecommendedContent();

    recommendedContent.value = response.data;

    // Preload all images for recommended content
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {
      console.warn("Failed to preload some recommended images:", error);
    }
  } catch (err) {
    recommendedError.value = err.message;
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
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {
      console.warn("Failed to preload some trending images:", error);
    }
  } catch (err) {
    trendingError.value = err.message;
  } finally {
    trendingLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    navigateTo("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// HeroHome event handlers
const handleWatchContent = (content) => {
  console.log("Watching content:", content.title);
  // Additional logic can be added here (analytics, etc.)
};

const handleAddToList = (content) => {
  console.log("Added to list:", content.title);
  // You can add toast notification or update user's watchlist here
};

// Fetch data when component mounts
onMounted(async () => {
  await Promise.all([
    fetchFeaturedContent(),
    fetchAnticipatedContent(),
    fetchRecommendedContent(),
    fetchTrendingContent(),
  ]);
});
</script>