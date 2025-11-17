<template>
  <Navbar />
  <main class="bg-black pt-0">
    <!-- Show search results when there's a search query -->
    <template v-if="hasSearchQuery">
      <div class="pt-20">
        <!-- Filter buttons -->
        <SearchFilters
          @filter-click="handleFilterClick"
          @filters-changed="handleFiltersChanged"
        />

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
import SearchFilters from "~/components/SearchFilters/SearchFilters.vue";
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
  if (!imageId)
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
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
    // Use the dedicated featured content endpoint
    const response = await ContentService.getFeaturedContent();

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
    // Fallback to empty array if API fails
    featuredPosters.value = [];
  } finally {
    featuredLoading.value = false;
  }
};

const { preloadContentImages } = useBlobImages();

// Fetch anticipated content
const fetchAnticipatedContent = async () => {
  try {
    anticipatedLoading.value = true;
    // Use the dedicated anticipated content endpoint
    const response = await ContentService.getAnticipatedContent();

    anticipatedContent.value = response.data;

    // Preload all images for anticipated content
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {}
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
    } catch (error) {}
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
    } catch (error) {}
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
  } catch (error) {}
};

// HeroHome event handlers
const handleWatchContent = (content) => {
  // Additional logic can be added here (analytics, etc.)
};

const handleAddToList = (content) => {
  // You can add toast notification or update user's watchlist here
};

const handleFilterClick = (filterType) => {
  // Handle filter logic here
  switch (filterType) {
    case "genre":
      // Handle genre filter
      break;
    case "releaseYear":
      // Handle release year filter
      break;
    case "contentType":
      // Handle content type filter
      break;
    case "sort":
      // Handle sort filter
      break;
    default:
  }
};

const handleFiltersChanged = async (filterParams) => {
  // Apply filters to search results
  if (hasSearchQuery.value) {
    await fetchSearchResultsWithFilters(filterParams);
  }
};

const fetchSearchResultsWithFilters = async (filterParams) => {
  if (!searchQuery.value.trim()) return;

  try {
    const response = await ContentService.getContents({
      search: searchQuery.value,
      ...filterParams,
      page: 1,
    });

    searchStore.searchResults = response.data || [];
  } catch (error) {
    searchStore.searchError = error.message || "Search failed";
    searchStore.searchResults = [];
  }
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
