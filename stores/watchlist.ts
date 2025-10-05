import { defineStore } from "pinia";
import { ContentInteractionService } from "~/api/services/content-interaction.service";
import { ContentService } from "~/api/services/content.service";
import type { Content, ContentListResponse } from "~/src/types/content";

export const useWatchlistStore = defineStore("watchlist", () => {
  const watchlistItems = ref<string[]>([]);
  const watchlistContent = ref<Content[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isInWatchlist = computed(
    () => (contentId: string) => watchlistItems.value.includes(contentId)
  );

  const watchlistCount = computed(() => watchlistItems.value.length);

  // Get watchlist content with full content details
  const getWatchlistContentItems = computed(() => watchlistContent.value);

  // Actions
  async function fetchWatchlist() {
    loading.value = true;
    error.value = null;

    try {
      // Use the fetchWatchlistContent method instead since it uses the content API
      const response = await fetchWatchlistContent();
      watchlistItems.value = response.data.map((item: any) => item.id);
    } catch (err: any) {
      error.value = err.message || "Failed to fetch watchlist";
      console.error("Failed to fetch watchlist:", err);
    } finally {
      loading.value = false;
    }
  }

  async function toggleWatchlist(contentId: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await ContentInteractionService.toggleWatchlist(
        contentId
      );

      // Update local state based on the response
      // The API should return whether the item was added or removed
      if (isInWatchlist.value(contentId)) {
        // Remove from local state
        watchlistItems.value = watchlistItems.value.filter(
          (id) => id !== contentId
        );
      } else {
        // Add to local state
        watchlistItems.value.push(contentId);
      }

      return response;
    } catch (err: any) {
      error.value = err.message || "Failed to toggle watchlist";
      console.error("Failed to toggle watchlist:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch watchlist content with full content details
   * @param params Optional query parameters (page, limit, etc.)
   * @returns Promise with content list response
   */
  async function fetchWatchlistContent(params?: {
    page?: number;
    limit?: number;
  }) {
    loading.value = true;
    error.value = null;

    try {
      const response = await ContentService.getWatchlistContent(params);
      watchlistContent.value = response.data;

      // Also update the watchlist items array with IDs
      watchlistItems.value = response.data.map((item: Content) => item.id);

      return response;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch watchlist content";
      console.error("Failed to fetch watchlist content:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    watchlistItems,
    watchlistContent,
    loading,
    error,
    // Getters
    isInWatchlist,
    watchlistCount,
    getWatchlistContentItems,
    // Actions
    fetchWatchlist,
    fetchWatchlistContent,
    toggleWatchlist,
    clearError,
  };
});
