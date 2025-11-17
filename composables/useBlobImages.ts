import { computed } from "vue";
import { useBlobStore } from "~/stores/blobStore";
import { getPrimaryImageId, getHoverImageId } from "~/src/utils/contentHelpers";

export const useBlobImages = () => {
  const blobStore = useBlobStore();

  /**
   * Get blob URL for an image ID with fallback (non-tracking version for computed)
   */
  const getImageUrl = (
    imageId: string | null | undefined,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ): string => {
    if (!imageId || imageId.trim() === "") return fallbackUrl;

    const blobUrl = blobStore.getBlob(imageId);
    return blobUrl || fallbackUrl;
  };

  /**
   * Get blob URL for an image ID with fallback and access tracking
   * Use this for user interactions, not for computed properties
   */
  const getImageUrlWithTracking = (
    imageId: string | null | undefined,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ): string => {
    if (!imageId || imageId.trim() === "") return fallbackUrl;

    const blobUrl = blobStore.getBlobAndTrack(imageId);
    return blobUrl || fallbackUrl;
  };

  /**
   * Get primary image URL for content (poster > thumbnail)
   */
  const getPrimaryImageUrl = (
    content: any,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ): string => {
    const imageId = getPrimaryImageId(content);
    if (!imageId) return fallbackUrl;

    // Try to get from blob store first
    const blobUrl = getImageUrl(imageId, fallbackUrl);
    if (blobUrl !== fallbackUrl) {
      return blobUrl;
    }

    // Fallback: Direct Cloudflare URL if blob store doesn't have it
    return `https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg/${imageId}/public`;
  };

  /**
   * Get hover image URL for content (banner > poster)
   */
  const getHoverImageUrl = (
    content: any,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ): string => {
    const imageId = getHoverImageId(content);
    if (!imageId) return fallbackUrl;

    // Try to get from blob store first
    const blobUrl = getImageUrl(imageId, fallbackUrl);
    if (blobUrl !== fallbackUrl) {
      return blobUrl;
    }

    // Fallback: Direct Cloudflare URL if blob store doesn't have it
    return `https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg/${imageId}/public`;
  };

  /**
   * Check if image is loading
   */
  const isImageLoading = (imageId: string | null | undefined): boolean => {
    if (!imageId || imageId.trim() === "") return false;
    return blobStore.isLoading(imageId);
  };

  /**
   * Check if image has error
   */
  const getImageError = (imageId: string | null | undefined): string | null => {
    if (!imageId || imageId.trim() === "") return null;
    return blobStore.getError(imageId);
  };

  /**
   * Get retry state for an image
   */
  const getImageRetryState = (imageId: string | null | undefined) => {
    if (!imageId || imageId.trim() === "") return null;
    return blobStore.getRetryState(imageId);
  };

  /**
   * Check if image can be retried
   */
  const canRetryImage = (imageId: string | null | undefined): boolean => {
    if (!imageId || imageId.trim() === "") return false;
    const retryState = blobStore.getRetryState(imageId);
    if (!retryState) return true; // No retry state means it can be retried

    const now = Date.now();
    return retryState.attempts < 3 && now >= retryState.nextRetryTime;
  };

  /**
   * Force retry for a failed image
   */
  const retryImage = async (
    imageId: string | null | undefined,
    size: string = "public"
  ): Promise<string | null> => {
    if (!imageId || imageId.trim() === "") return null;

    try {
      // Clear any existing error state
      const retryState = blobStore.getRetryState(imageId);
      if (retryState) {
        // Reset retry state to allow immediate retry
        retryState.attempts = 0;
        retryState.nextRetryTime = Date.now();
      }

      return await blobStore.fetchWithRetry(imageId, size);
    } catch (error) {
      // Don't log warnings for permanent failures
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        !errorMessage.includes("Permanent failure") &&
        !errorMessage.includes("null or empty")
      ) {
      }
      return null;
    }
  };

  /**
   * Preload images for content array with retry logic
   */
  const preloadContentImages = async (
    contentArray: any[],
    size: string = "public"
  ): Promise<void> => {
    const imageIds = contentArray
      .map((content) => [getPrimaryImageId(content), getHoverImageId(content)])
      .flat()
      .filter((id): id is string => id !== null && id !== undefined); // Type guard to remove null/undefined values

    await blobStore.preloadImages(imageIds, size);
  };

  /**
   * Get computed image URL that updates when blob is loaded
   */
  const useComputedImageUrl = (
    imageId: string | null | undefined,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ) => {
    return computed(() => getImageUrl(imageId, fallbackUrl));
  };

  /**
   * Get computed primary image URL for content
   */
  const useComputedPrimaryImageUrl = (
    content: any,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ) => {
    return computed(() => getPrimaryImageUrl(content, fallbackUrl));
  };

  /**
   * Get computed hover image URL for content
   */
  const useComputedHoverImageUrl = (
    content: any,
    fallbackUrl: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
  ) => {
    return computed(() => getHoverImageUrl(content, fallbackUrl));
  };

  /**
   * Get computed loading state for an image
   */
  const useComputedImageLoading = (imageId: string | null | undefined) => {
    return computed(() => isImageLoading(imageId));
  };

  /**
   * Get computed error state for an image
   */
  const useComputedImageError = (imageId: string | null | undefined) => {
    return computed(() => getImageError(imageId));
  };

  /**
   * Get computed retry state for an image
   */
  const useComputedImageRetryState = (imageId: string | null | undefined) => {
    return computed(() => getImageRetryState(imageId));
  };

  return {
    // Direct methods
    getImageUrl,
    getImageUrlWithTracking,
    getPrimaryImageUrl,
    getHoverImageUrl,
    isImageLoading,
    getImageError,
    getImageRetryState,
    canRetryImage,
    retryImage,
    preloadContentImages,

    // Computed methods
    useComputedImageUrl,
    useComputedPrimaryImageUrl,
    useComputedHoverImageUrl,
    useComputedImageLoading,
    useComputedImageError,
    useComputedImageRetryState,

    // Store access
    blobStore,
  };
};
