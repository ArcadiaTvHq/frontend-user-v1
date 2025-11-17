import { useBlobStore } from "~/stores/blobStore";

/**
 * Helper function to clean query params by removing undefined values and formatting special types
 * @param params Object containing query parameters
 * @returns Cleaned object with formatted values
 */
export const cleanQueryParams = (
  params: Record<string, any>
): Record<string, any> => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      // Handle arrays
      if (Array.isArray(value)) {
        acc[key] = value;
      }
      // Handle dates
      else if (value instanceof Date) {
        acc[key] = value.toISOString();
      }
      // Handle other values
      else {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as Record<string, any>);
};

export const IMAGE_DELIVERY_BASE_URL =
  "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

/**
 * Builds the full URL for an image using the image delivery service with caching
 * @param imageId The ID of the image to fetch
 * @param size The size variant to use (default: 'public')
 * @param options Optional configuration
 * @returns The complete URL for the image
 */
export const buildImageUrl = (
  imageId: string | undefined | null,
  size: string = "public",
  options: { cache?: boolean } = {}
): string => {
  if (!imageId || imageId.trim() === "") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23111111' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='Arial' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const blobStore = useBlobStore();

    // Try to get from blob store first using the proper method
    const existingBlob = blobStore.getBlob(imageId);
    if (existingBlob) {
      return existingBlob;
    }

    // Build the URL
    const url = `${IMAGE_DELIVERY_BASE_URL}/${imageId}/${size}`;

    // Only cache if explicitly requested or for poster images (default behavior)
    if (options.cache !== false) {
      // Load and cache the image as blob (async, don't block)
      setTimeout(async () => {
        try {
          await blobStore.fetchAndStoreBlob(imageId, size);
        } catch (error) {}
      }, 0);
    }

    return url;
  }

  // Server-side rendering fallback
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/${size}`;
};

/**
 * Preloads and caches an image for better performance
 * @param imageId The ID of the image to preload
 * @param size The size variant to use (default: 'public')
 * @returns Promise that resolves with the cached image URL
 */
export const preloadImage = async (
  imageId: string | undefined | null,
  size: string = "public"
): Promise<string> => {
  // Return fallback for null/empty image IDs or server-side rendering
  if (!imageId || imageId.trim() === "" || typeof window === "undefined") {
    return buildImageUrl(imageId, size);
  }

  const blobStore = useBlobStore();

  try {
    return await blobStore.fetchAndStoreBlob(imageId, size);
  } catch (error) {
    // If fetch fails, return the direct URL as fallback
    return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/${size}`;
  }
};

/**
 * Formats a date to show only the year or "Coming Soon" for future dates
 * @param date The date to format
 * @returns The year as a string or "Coming Soon" for future dates
 */
export const formatDate = (date: string | undefined | null): string => {
  if (!date) return "";
  const releaseDate = new Date(date);
  const now = new Date();
  if (releaseDate > now) {
    return "Coming Soon";
  }
  return releaseDate.getFullYear().toString();
};

/**
 * Formats duration in seconds to a human-readable string
 * Shows seconds for durations less than 2 minutes
 * @param seconds The duration in seconds
 * @returns Formatted duration string (e.g., "45s", "30m", "2h 30m")
 */
export const formatDuration = (seconds: number | undefined | null): string => {
  if (!seconds) return "";
  if (seconds < 120) {
    // less than 2 minutes
    return `${seconds}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
