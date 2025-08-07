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

    <!-- Show normal movies content when no search -->
    <template v-else>
      <HeroHome
        :autoPlay="true"
        :autoPlayInterval="10000"
        @watch="handleWatchContent"
        @addToList="handleAddToList"
      />
      <SectionTwo
        title="Movies"
        iconAlt="Movies icon"
        :content="moviesContent"
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

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const searchStore = useSearchStore();
const userFullName = computed(() => authStore.userFullName);

// Make reactive computed properties for search
const hasSearchQuery = computed(() => searchStore.hasSearchQuery);
const searchQuery = computed(() => searchStore.searchQuery);
const searchResults = computed(() => searchStore.searchResults);

// Override the search store's performSearch to filter by movies only
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
      types: [EContentType.MOVIE], // Only search within movies
      limit: 20,
      page: 1,
    });

    searchStore.searchResults = response.data || [];
  } catch (error) {
    console.error("Movies search error:", error);
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

// Movies content state
const moviesContent = ref([]);
const moviesLoading = ref(true);
const moviesError = ref(null);

const { preloadContentImages } = useBlobImages();

// Fetch movies content (movies only)
const fetchMoviesContent = async () => {
  try {
    moviesLoading.value = true;
    const response = await ContentService.getContents({
      types: [EContentType.MOVIE], // Only movies
      limit: 6,
      page: 1,
    });

    moviesContent.value = response.data;

    // Preload all images for movies content
    try {
      await preloadContentImages(response.data, "public");
    } catch (error) {
      console.warn("Failed to preload some movies images:", error);
    }
  } catch (err) {
    moviesError.value = err.message;
  } finally {
    moviesLoading.value = false;
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
  console.log("Watching movie:", content.title);
  // Additional logic can be added here (analytics, etc.)
};

const handleAddToList = (content) => {
  console.log("Added movie to list:", content.title);
  // You can add toast notification or update user's watchlist here
};

// Fetch data when component mounts
onMounted(async () => {
  await fetchMoviesContent();
});
</script>