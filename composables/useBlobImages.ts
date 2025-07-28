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
    fallbackUrl: string = "/images/default-poster.jpg"
  ): string => {
    if (!imageId) return fallbackUrl;

    const blobUrl = blobStore.getBlob(imageId);
    return blobUrl || fallbackUrl;
  };

  /**
   * Get blob URL for an image ID with fallback and access tracking
   * Use this for user interactions, not for computed properties
   */
  const getImageUrlWithTracking = (
    imageId: string | null | undefined,
    fallbackUrl: string = "/images/default-poster.jpg"
  ): string => {
    if (!imageId) return fallbackUrl;

    const blobUrl = blobStore.getBlobAndTrack(imageId);
    return blobUrl || fallbackUrl;
  };

  /**
   * Get primary image URL for content (poster > thumbnail)
   */
  const getPrimaryImageUrl = (
    content: any,
    fallbackUrl: string = "/images/default-poster.jpg"
  ): string => {
    const imageId = getPrimaryImageId(content);
    return getImageUrl(imageId, fallbackUrl);
  };

  /**
   * Get hover image URL for content (banner > poster)
   */
  const getHoverImageUrl = (
    content: any,
    fallbackUrl: string = "/images/default-poster.jpg"
  ): string => {
    const imageId = getHoverImageId(content);
    return getImageUrl(imageId, fallbackUrl);
  };

  /**
   * Check if image is loading
   */
  const isImageLoading = (imageId: string | null | undefined): boolean => {
    if (!imageId) return false;
    return blobStore.isLoading(imageId);
  };

  /**
   * Check if image has error
   */
  const getImageError = (imageId: string | null | undefined): string | null => {
    if (!imageId) return null;
    return blobStore.getError(imageId);
  };

  /**
   * Preload images for content array
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
    fallbackUrl: string = "/images/default-poster.jpg"
  ) => {
    return computed(() => getImageUrl(imageId, fallbackUrl));
  };

  /**
   * Get computed primary image URL for content
   */
  const useComputedPrimaryImageUrl = (
    content: any,
    fallbackUrl: string = "/images/default-poster.jpg"
  ) => {
    return computed(() => getPrimaryImageUrl(content, fallbackUrl));
  };

  /**
   * Get computed hover image URL for content
   */
  const useComputedHoverImageUrl = (
    content: any,
    fallbackUrl: string = "/images/default-poster.jpg"
  ) => {
    return computed(() => getHoverImageUrl(content, fallbackUrl));
  };

  return {
    // Direct methods
    getImageUrl,
    getImageUrlWithTracking,
    getPrimaryImageUrl,
    getHoverImageUrl,
    isImageLoading,
    getImageError,
    preloadContentImages,

    // Computed methods
    useComputedImageUrl,
    useComputedPrimaryImageUrl,
    useComputedHoverImageUrl,

    // Store access
    blobStore,
  };
};
