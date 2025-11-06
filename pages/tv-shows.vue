<template>
  <Navbar />
  <main class="bg-black pt-0">
    <!-- Error View -->
    <ErrorView
      v-if="error"
      :error="error"
      :title="'TV Shows Loading Error'"
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

      <!-- Show normal TV shows content when no search -->
      <template v-else>
        <HeroHome
          :autoPlay="true"
          :autoPlayInterval="10000"
          contentType="series"
          @watch="handleWatchContent"
          @addToList="handleAddToList"
        />
        <SectionTwo
          title="Recommended TV Shows"
          iconAlt="Recommended icon"
          :content="recommendedSeries"
          :showSeeMore="true"
          :fetchContent="false"
          @watchlist-updated="handleWatchlistUpdate"
        />
        <SectionTwo
          title="Trending TV Shows"
          iconAlt="Trending icon"
          :content="trendingSeries"
          :showSeeMore="true"
          :fetchContent="false"
          @watchlist-updated="handleWatchlistUpdate"
        />
        <SectionTwo
          title="Anticipated TV Shows"
          iconAlt="Anticipated icon"
          :content="anticipatedSeries"
          :showSeeMore="true"
          :fetchContent="false"
          @watchlist-updated="handleWatchlistUpdate"
        />
        <div class="mt-20 md:mt-32">
          <HomeFoot />
        </div>
      </template>
    </div>
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
import ErrorView from "~/components/ErrorView/ErrorView.vue";
import SearchFilters from "~/components/SearchFilters/SearchFilters.vue";
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";
import { useBlobImages } from "~/composables/useBlobImages";
import { usePageError } from "~/composables/usePageError";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const searchStore = useSearchStore();
const userFullName = computed(() => authStore.userFullName);

// Page-level error handling
const { error, handleApiError, clearError } = usePageError();

// Make reactive computed properties for search
const hasSearchQuery = computed(() => searchStore.hasSearchQuery);
const searchQuery = computed(() => searchStore.searchQuery);
const searchResults = computed(() => searchStore.searchResults);

// Override the search store's performSearch to filter by series only
const originalPerformSearch = searchStore.performSearch;
searchStore.performSearch = async (query) => {
  if (!query.trim()) {
    searchStore.searchResults = [];
    return;
  }

  try {
    searchStore.isSearching = true;
    searchStore.searchError = null;

    const response = await ContentService.getContents({
      search: query.trim(),
      types: [EContentType.SERIES], // Only search within series
      limit: 20,
      page: 1,
    });

    searchStore.searchResults = response.data || [];
  } catch (error) {
    console.error("TV Shows search error:", error);
    searchStore.searchError = error.message || "Search failed";
    searchStore.searchResults = [];
  } finally {
    searchStore.isSearching = false;
  }
};

// Handle URL parameters on mount
onMounted(() => {
  // If there's already a search query in the store, perform the search and sync URL
  if (searchStore.searchQuery && searchStore.searchQuery.trim()) {
    searchStore.performSearch(searchStore.searchQuery);
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

// TV Shows content state
const tvShowsContent = ref([]);
const trendingSeries = ref([]);
const anticipatedSeries = ref([]);
const recommendedSeries = ref([]);
const tvShowsLoading = ref(true);
const tvShowsError = ref(null);

// Refresh loading state
const isRefreshing = ref(false);

const { preloadContentImages } = useBlobImages();

// Fetch all TV shows content sections
const fetchTVShowsContent = async () => {
  try {
    tvShowsLoading.value = true;

    // Fetch all sections in parallel
    const [trending, anticipated, recommended] = await Promise.all([
      ContentService.getTrendingContent("series"),
      ContentService.getAnticipatedContent("series"),
      ContentService.getRecommendedContent("series"),
    ]);

    trendingSeries.value = trending.data;
    anticipatedSeries.value = anticipated.data;
    recommendedSeries.value = recommended.data;

    // Preload images for all sections
    try {
      await Promise.all([
        preloadContentImages(trending.data, "public"),
        preloadContentImages(anticipated.data, "public"),
        preloadContentImages(recommended.data, "public"),
      ]);
    } catch (error) {
      console.warn("Failed to preload some TV shows images:", error);
    }

    // Clear any previous errors on success
    if (error.value) {
      console.log("Clearing error after successful TV shows content load");
      clearError();
    }
  } catch (err) {
    console.error("Error loading TV shows content:", err);
    handleApiError(err);
  } finally {
    tvShowsLoading.value = false;
  }
};

// Retry content loading
const retryContent = async () => {
  try {
    console.log("Retrying TV shows content...");

    // Clear error state before retrying
    clearError();

    await fetchTVShowsContent();

    console.log("TV shows content retry successful");
  } catch (err) {
    console.error("Retry failed:", err);
    // Error will be handled by the error view
  }
};

// Refresh page - improved version that doesn't require full page reload
const refreshPage = async () => {
  try {
    console.log("Refreshing TV shows page...");
    isRefreshing.value = true;

    // Clear error state
    clearError();

    // Reset loading states
    tvShowsLoading.value = true;

    // Clear existing content
    tvShowsContent.value = [];

    // Reload content
    await fetchTVShowsContent();

    console.log("TV shows page refresh successful");

    // Ensure error is cleared after successful refresh
    if (error.value) {
      console.log("Force clearing error after successful refresh");
      clearError();
    }
  } catch (err) {
    console.error("TV shows page refresh failed:", err);
    // Error will be handled by the error view
  } finally {
    isRefreshing.value = false;
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
  console.log("Watching TV show:", content.title);
  navigateTo(`/watch/${content.slug}`);
};

const handleAddToList = (content) => {
  console.log("Added TV show to list:", content.title);
  // You can add toast notification or update user's watchlist here
};

const handleFilterClick = (filterType) => {
  console.log("Filter clicked:", filterType);
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
      console.log("Unknown filter type:", filterType);
  }
};

const handleFiltersChanged = async (filterParams) => {
  console.log("Filters changed:", filterParams);
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
    console.error("Filtered search error:", error);
    searchStore.searchError = error.message || "Search failed";
    searchStore.searchResults = [];
  }
};

const handleWatchlistUpdate = (updateData) => {
  // Update the tvShowsContent array to reflect the new watchlist status
  const contentIndex = tvShowsContent.value.findIndex(
    (show) => show.id === updateData.contentId
  );
  if (contentIndex !== -1) {
    tvShowsContent.value[contentIndex].in_watch_list = updateData.newStatus;
  }
};

// Fetch data when component mounts
onMounted(async () => {
  await fetchTVShowsContent();
});
</script>