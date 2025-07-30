import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { ContentService } from "~/api/services/content.service";

export const useSearchStore = defineStore("search", () => {
  const searchQuery = ref("");
  const searchResults = ref<any[]>([]);
  const isSearching = ref(false);
  const searchError = ref<string | null>(null);

  // Filter states
  const selectedGenre = ref("");
  const selectedYear = ref("");
  const selectedContentType = ref("");
  const selectedSort = ref("");

  const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0);
  const hasSearchResults = computed(() => searchResults.value.length > 0);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }

    try {
      isSearching.value = true;
      searchError.value = null;

      const response = await ContentService.getContents({
        search: query.trim(),
        limit: 20,
        page: 1,
      });

      searchResults.value = response.data || [];
    } catch (error: any) {
      console.error("Search error:", error);
      searchError.value = error.message || "Search failed";
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  };

  const clearSearch = () => {
    searchQuery.value = "";
    searchResults.value = [];
    searchError.value = null;
  };

  // Update URL with search parameters
  const updateURL = () => {
    const router = useRouter();
    const route = useRoute();

    const query = { ...route.query };

    if (searchQuery.value.trim()) {
      query.search = searchQuery.value;
    } else {
      delete query.search;
    }

    if (selectedContentType.value) {
      query.type = selectedContentType.value;
    }

    if (selectedGenre.value) {
      query.genre = selectedGenre.value;
    }

    if (selectedYear.value) {
      query.year = selectedYear.value;
    }

    if (selectedSort.value) {
      query.sort = selectedSort.value;
    }

    router.push({ query });
  };

  // Sync URL with current search state
  const syncURLWithSearch = () => {
    if (searchQuery.value.trim()) {
      updateURL();
    }
  };

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    hasSearchQuery,
    hasSearchResults,
    selectedGenre,
    selectedYear,
    selectedContentType,
    selectedSort,
    performSearch,
    clearSearch,
    updateURL,
    syncURLWithSearch,
  };
});
