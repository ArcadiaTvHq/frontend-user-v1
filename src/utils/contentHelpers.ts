/**
 * Extract all image IDs from content data for preloading
 */
export const extractImageIds = (content: any): string[] => {
  const imageIds: string[] = [];

  if (!content) return imageIds;

  // Extract poster image ID
  if (content.poster_image_id) {
    imageIds.push(content.poster_image_id);
  }

  // Extract banner image ID
  if (content.banner_image_id) {
    imageIds.push(content.banner_image_id);
  }

  // Extract thumbnail image ID (as fallback)
  if (content.thumbnail_image_id) {
    imageIds.push(content.thumbnail_image_id);
  }

  return imageIds;
};

/**
 * Extract all image IDs from an array of content items
 */
export const extractImageIdsFromContent = (contentArray: any[]): string[] => {
  const allImageIds: string[] = [];

  contentArray.forEach((content) => {
    const imageIds = extractImageIds(content);
    allImageIds.push(...imageIds);
  });

  // Remove duplicates
  return [...new Set(allImageIds)];
};

/**
 * Get the primary image ID for a content item (poster > thumbnail)
 */
export const getPrimaryImageId = (content: any): string | null => {
  return content?.poster_image_id || content?.thumbnail_image_id || null;
};

/**
 * Get the hover image ID for a content item (banner > poster)
 */
export const getHoverImageId = (content: any): string | null => {
  return content?.banner_image_id || content?.poster_image_id || null;
};
