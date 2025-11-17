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

    // Get adverts with "start" or "beginning" position AND video types only
    const startAdverts = AdvertService.getAdvertsByPositionAndType(
      adverts.value,
      "start",
      ["short_video", "long_video"]
    );
    const beginningAdverts = AdvertService.getAdvertsByPositionAndType(
      adverts.value,
      "beginning",
      ["short_video", "long_video"]
    );

    // Combine both (in case backend uses either)
    return [...startAdverts, ...beginningAdverts];
  });

  const pauseAdverts = computed(() => {
    if (!adverts.value) {
      return [];
    }

    // For pause, use adverts with "pause" position
    return AdvertService.getAdvertsByPositionAndType(adverts.value, "pause", [
      "image",
    ]);
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

      const response = await AdvertService.fetchAdverts(request);

      // The response now has data.start, data.middle, data.end, data.pause arrays
      if (
        response &&
        typeof response === "object" &&
        "data" in response &&
        response.data &&
        typeof response.data === "object"
      ) {
        // Flatten all adverts from all positions into a single array
        const allAdverts: Advert[] = [
          ...(response.data.start || []),
          ...(response.data.middle || []),
          ...(response.data.end || []),
          ...(response.data.pause || []),
        ];

        adverts.value = allAdverts;
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array (old format)
        adverts.value = response;
      } else {
        adverts.value = [];
      }

      return adverts.value;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch adverts";
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

    if (position === "beginning" || position === "start") {
      // Use the pre-filtered beginning adverts (already filtered for video types)
      selectedAdverts = beginningAdverts.value;
    } else if (position === "pause") {
      // Use the pre-filtered pause adverts (already filtered for image types)
      selectedAdverts = pauseAdverts.value;
    } else if (position === "middle") {
      // Use the pre-filtered middle adverts
      selectedAdverts = middleAdverts.value;
    } else if (position === "end") {
      // Use the pre-filtered end adverts
      selectedAdverts = endAdverts.value;
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
