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
 * Builds the full URL for an image using the image delivery service
 * @param imageId The ID of the image to fetch
 * @param size The size variant to use (default: 'size1')
 * @returns The complete URL for the image
 */
export const buildImageUrl = (
  imageId: string | undefined | null,
  size: string = "size1"
): string => {
  if (!imageId) return "/images/default-poster.jpg";
  return `${IMAGE_DELIVERY_BASE_URL}/${imageId}/${size}`;
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
