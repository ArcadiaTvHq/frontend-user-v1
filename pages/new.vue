<template>
  <Navbar />
  <main class="bg-black pt-0">
    <!-- Error View -->
    <ErrorView
      v-if="error"
      :error="error"
      :title="'New Releases Loading Error'"
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
          <div class="px-4 sm:px-9 md:px-28 mb-6">
            <div class="flex flex-wrap gap-3">
              <!-- Genre Filter -->
              <button
                class="bg-gold hover:bg-[#CE8F00] text-black px-4 py-2 rounded-2xl flex items-center gap-2 font-medium transition-all duration-300 text-sm"
              >
                <genre />
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
                <releaseYear />
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
                <img src="../assets/icons/clip.png" />
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
                <img src="@/assets/icons/sort.svg" />
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

      <!-- Show normal new content when no search -->
      <template v-else>
        <HeroHome
          :autoPlay="true"
          :autoPlayInterval="10000"
          @watch="handleWatchContent"
          @addToList="handleAddToList"
        />
        <SectionTwo
          title="New Releases"
          iconAlt="New releases icon"
          :content="newContent"
          :showSeeMore="true"
          :fetchContent="false"
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
import { ContentService } from "~/api/services/content.service";
import { EContentType } from "~/src/types/content";
import ContentTypeicon from "~/components/icons/contentTypeicon.vue";
import sort from "~/components/icons/sort.vue";
import releaseYear from "~/components/icons/releaseYear.vue";
import genre from "~/components/icons/genre.vue";
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

// Override the search store's performSearch to filter by new content only
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
      types: [EContentType.MOVIE, EContentType.SERIES],
      released_after: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(), // Last 30 days
      limit: 20,
      page: 1,
    });

    searchStore.searchResults = response.data || [];
  } catch (error) {
    console.error("New search error:", error);
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
  if (!imageId) return "/images/default-poster.jpg";
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/public`;
};

// New content state
const newContent = ref([]);
const newContentLoading = ref(true);
const newContentError = ref(null);

// Refresh loading state
const isRefreshing = ref(false);

const { preloadContentImages } = useBlobImages();

// Fetch new content (recently released)
const fetchNewContent = async () => {
  try {
    newContentLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE, EContentType.SERIES],
      released_after: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(), // Last 30 days
      limit: 6,
      page: 1,
    });

    newContent.value = response.data;

    // Preload all images for new content
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {
      console.warn("Failed to preload some new content images:", error);
    }

    // Clear any previous errors on success
    if (error.value) {
      console.log("Clearing error after successful new content load");
      clearError();
    }
  } catch (err) {
    console.error("Error loading new content:", err);
    handleApiError(err);
  } finally {
    newContentLoading.value = false;
  }
};

// Retry content loading
const retryContent = async () => {
  try {
    console.log("Retrying new content...");

    // Clear error state before retrying
    clearError();

    await fetchNewContent();

    console.log("New content retry successful");
  } catch (err) {
    console.error("Retry failed:", err);
    // Error will be handled by the error view
  }
};

// Refresh page - improved version that doesn't require full page reload
const refreshPage = async () => {
  try {
    console.log("Refreshing new page...");
    isRefreshing.value = true;

    // Clear error state
    clearError();

    // Reset loading states
    newContentLoading.value = true;

    // Clear existing content
    newContent.value = [];

    // Reload content
    await fetchNewContent();

    console.log("New page refresh successful");

    // Ensure error is cleared after successful refresh
    if (error.value) {
      console.log("Force clearing error after successful refresh");
      clearError();
    }
  } catch (err) {
    console.error("New page refresh failed:", err);
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
  console.log("Watching new content:", content.title);
  navigateTo(`/watch/${content.slug}`);
};

const handleAddToList = (content) => {
  console.log("Added new content to list:", content.title);
  // You can add toast notification or update user's watchlist here
};

// Fetch data when component mounts
onMounted(async () => {
  await fetchNewContent();
});
</script>