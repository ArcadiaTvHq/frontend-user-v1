import { defineStore } from "pinia";
import {
  AdvertService,
  type Advert,
  type FetchAdvertsRequest,
} from "~/api/services/advert.service";

export const useAdvertStore = defineStore("adverts", () => {
  const adverts = ref<Advert[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const beginningAdverts = computed(() => {
    if (!adverts.value) return [];

    // Get adverts with "beginning" position AND video types only
    const beginningVideoAdverts = AdvertService.getAdvertsByPositionAndType(
      adverts.value,
      "beginning",
      ["short_video", "long_video"]
    );

    return beginningVideoAdverts;
  });

  const pauseAdverts = computed(() => {
    if (!adverts.value) {
      return [];
    }

    // For pause, use ANY image advert regardless of position
    return AdvertService.getImageAdverts(adverts.value);
  });

  const middleAdverts = computed(() =>
    adverts.value
      ? AdvertService.getAdvertsByPositionAndType(adverts.value, "middle", [
          "long_video",
          "short_video",
        ])
      : []
  );

  const endAdverts = computed(() =>
    adverts.value
      ? AdvertService.getAdvertsByPositionAndType(adverts.value, "end", [
          "long_video",
          "short_video",
        ])
      : []
  );

  const fetchAdverts = async (request: FetchAdvertsRequest = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      console.log("📺 Starting advert fetch with request:", request);
      const response = await AdvertService.fetchAdverts(request);
      console.log("📺 Raw response from AdvertService:", response);

      // The AdvertService now returns the full response object
      // Check if response has data property with adverts array
      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        Array.isArray(response.data)
      ) {
        adverts.value = response.data;
        console.log(
          "📺 Adverts loaded successfully:",
          response.data.length,
          "adverts"
        );
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        adverts.value = response;
        console.log("📺 Adverts loaded directly:", response.length, "adverts");
      } else {
        console.warn("⚠️ Unexpected advert response format:", response);
        console.warn("⚠️ Response type:", typeof response);
        console.warn(
          "⚠️ Response keys:",
          response ? Object.keys(response) : "null"
        );
        adverts.value = [];
      }

      console.log("📺 Final adverts state:", {
        totalAdverts: adverts.value?.length || 0,
        pauseAdverts: pauseAdverts.value?.length || 0,
        beginningAdverts: beginningAdverts.value?.length || 0,
      });

      return adverts.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch adverts";
      console.error("❌ Error fetching adverts:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const getRandomAdvert = (position: string): Advert | null => {
    if (!adverts.value || adverts.value.length === 0) {
      return null;
    }

    let selectedAdverts: Advert[] = [];

    if (position === "beginning") {
      // Use the pre-filtered beginning adverts (already filtered for video types)
      selectedAdverts = beginningAdverts.value;
    } else if (position === "pause") {
      // Use the pre-filtered pause adverts (already filtered for image types)
      selectedAdverts = pauseAdverts.value;
    } else {
      // For other positions, use the original logic
      selectedAdverts = AdvertService.getAdvertsByPositionAndType(
        adverts.value,
        position
      );
    }

    if (selectedAdverts.length === 0) {
      return null;
    }

    return AdvertService.getRandomAdvert(selectedAdverts);
  };

  const clearAdverts = () => {
    adverts.value = [];
    error.value = null;
  };

  return {
    // State
    adverts,
    isLoading,
    error,

    // Computed
    beginningAdverts,
    pauseAdverts,
    middleAdverts,
    endAdverts,

    // Methods
    fetchAdverts,
    getRandomAdvert,
    clearAdverts,
  };
});
