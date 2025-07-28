import { defineStore } from "pinia";
import { ref, reactive, toRaw } from "vue";

interface BlobMetadata {
  url: string;
  lastAccessed: number;
  accessCount: number;
  size: number; // Size in bytes
  priority: number; // Higher number = higher priority
}

interface BlobStoreState {
  blobs: Record<string, BlobMetadata>; // imageId -> blob metadata
  loading: Record<string, boolean>; // imageId -> loading state
  errors: Record<string, string>; // imageId -> error message
}

export const useBlobStore = defineStore("blobStore", () => {
  // State
  const blobs = reactive<Record<string, BlobMetadata>>({});
  const loading = reactive<Record<string, boolean>>({});
  const errors = reactive<Record<string, string>>({});

  // Configuration
  const IMAGE_DELIVERY_BASE_URL =
    "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

  // Adaptive limits based on available memory
  const getMemoryLimits = () => {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      const availableMemory = memory.usedJSHeapSize;
      const maxMemory = memory.jsHeapSizeLimit;
      const memoryUsage = availableMemory / maxMemory;

      // Adjust limits based on memory pressure
      if (memoryUsage > 0.8) {
        return { maxBlobs: 50, cleanupThreshold: 20 };
      } else if (memoryUsage > 0.6) {
        return { maxBlobs: 100, cleanupThreshold: 30 };
      } else {
        return { maxBlobs: 200, cleanupThreshold: 50 };
      }
    }
    return { maxBlobs: 150, cleanupThreshold: 40 };
  };

  // Priority levels for different image types
  const getImagePriority = (
    imageId: string,
    size: string = "public"
  ): number => {
    // Higher priority for smaller images (likely to be used more)
    const sizePriority: Record<string, number> = {
      thumbnail: 5,
      public: 4,
      size1: 3,
      size2: 2,
      size3: 1,
    };

    // Higher priority for featured content images
    const isFeatured = imageId.includes("featured") || imageId.includes("hero");
    const featuredBonus = isFeatured ? 2 : 0;

    return (sizePriority[size] || 1) + featuredBonus;
  };

  /**
   * Get blob URL for an image ID (without updating access tracking)
   */
  const getBlob = (imageId: string): string | null => {
    const blob = blobs[imageId];
    return blob ? blob.url : null;
  };

  /**
   * Get blob URL for an image ID and update access tracking
   * Use this when you want to track access (e.g., for user interactions)
   */
  const getBlobAndTrack = (imageId: string): string | null => {
    const blob = blobs[imageId];
    if (blob) {
      // Update access tracking
      blob.lastAccessed = Date.now();
      blob.accessCount++;
      return blob.url;
    }
    return null;
  };

  /**
   * Check if blob exists for an image ID
   */
  const hasBlob = (imageId: string): boolean => {
    return !!blobs[imageId];
  };

  /**
   * Check if image is currently loading
   */
  const isLoading = (imageId: string): boolean => {
    return !!loading[imageId];
  };

  /**
   * Get error for an image ID
   */
  const getError = (imageId: string): string | null => {
    return errors[imageId] || null;
  };

  /**
   * Calculate total memory usage of cached blobs
   */
  const getTotalMemoryUsage = (): number => {
    return Object.values(blobs).reduce((total, blob) => total + blob.size, 0);
  };

  /**
   * Smart cleanup using LRU (Least Recently Used) with priority consideration
   */
  const smartCleanup = (): void => {
    const limits = getMemoryLimits();
    const blobKeys = Object.keys(blobs);

    if (blobKeys.length >= limits.maxBlobs) {
      // Sort by priority and access pattern
      const sortedKeys = blobKeys.sort((a, b) => {
        const blobA = blobs[a];
        const blobB = blobs[b];

        // Calculate score based on access frequency, recency, and priority
        const timeA = Date.now() - blobA.lastAccessed;
        const timeB = Date.now() - blobB.lastAccessed;

        // Higher score = more likely to be kept
        const scoreA =
          blobA.accessCount * 10 + blobA.priority * 5 - timeA / 1000;
        const scoreB =
          blobB.accessCount * 10 + blobB.priority * 5 - timeB / 1000;

        return scoreA - scoreB; // Keep higher scores
      });

      // Remove the lowest scoring entries
      const keysToRemove = sortedKeys.slice(0, limits.cleanupThreshold);

      keysToRemove.forEach((key) => {
        const blob = blobs[key];
        if (blob && blob.url.startsWith("blob:")) {
          URL.revokeObjectURL(blob.url);
        }
        delete blobs[key];
        delete loading[key];
        delete errors[key];
      });

      console.log(
        `Cleaned up ${keysToRemove.length} blobs. Remaining: ${
          Object.keys(blobs).length
        }`
      );
    }
  };

  /**
   * Fetch image and store as blob with enhanced metadata
   */
  const fetchAndStoreBlob = async (
    imageId: string,
    size: string = "public"
  ): Promise<string> => {
    // If already cached, return the blob URL and update access
    if (blobs[imageId]) {
      const blob = blobs[imageId];
      blob.lastAccessed = Date.now();
      blob.accessCount++;
      return blob.url;
    }

    // If already loading, wait for it to complete
    if (loading[imageId]) {
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          if (!loading[imageId]) {
            if (blobs[imageId]) {
              const blob = blobs[imageId];
              blob.lastAccessed = Date.now();
              blob.accessCount++;
              resolve(blob.url);
            } else {
              reject(new Error(errors[imageId] || "Failed to load image"));
            }
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    // Start loading
    loading[imageId] = true;
    delete errors[imageId];

    try {
      const url = `${IMAGE_DELIVERY_BASE_URL}/${imageId}/${size}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Calculate priority for this image
      const priority = getImagePriority(imageId, size);

      // Smart cleanup before adding new blob
      smartCleanup();

      // Store the blob with metadata
      blobs[imageId] = {
        url: blobUrl,
        lastAccessed: Date.now(),
        accessCount: 1,
        size: blob.size,
        priority,
      };

      return blobUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors[imageId] = errorMessage;
      console.warn(`Failed to fetch blob for image ${imageId}:`, errorMessage);
      throw error;
    } finally {
      loading[imageId] = false;
    }
  };

  /**
   * Preload multiple images in background with priority
   */
  const preloadImages = async (
    imageIds: string[],
    size: string = "public"
  ): Promise<void> => {
    // Sort by priority to load important images first
    const sortedImageIds = imageIds
      .filter((id) => id && !blobs[id] && !loading[id])
      .sort((a, b) => {
        const priorityA = getImagePriority(a, size);
        const priorityB = getImagePriority(b, size);
        return priorityB - priorityA; // Higher priority first
      });

    const promises = sortedImageIds.map(async (imageId) => {
      try {
        await fetchAndStoreBlob(imageId, size);
      } catch (error) {
        console.warn(`Failed to preload image ${imageId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  };

  /**
   * Remove specific blob by ID
   */
  const removeBlob = (imageId: string): void => {
    const blob = blobs[imageId];
    if (blob && blob.url.startsWith("blob:")) {
      URL.revokeObjectURL(blob.url);
    }
    delete blobs[imageId];
    delete loading[imageId];
    delete errors[imageId];
  };

  /**
   * Clear all blobs
   */
  const clearAll = (): void => {
    Object.keys(blobs).forEach((key) => {
      const blob = blobs[key];
      if (blob && blob.url.startsWith("blob:")) {
        URL.revokeObjectURL(blob.url);
      }
    });

    Object.keys(blobs).forEach((key) => delete blobs[key]);
    Object.keys(loading).forEach((key) => delete loading[key]);
    Object.keys(errors).forEach((key) => delete errors[key]);
  };

  /**
   * Get detailed store statistics
   */
  const getStats = () => {
    // Use toRaw to avoid reactive dependencies in computed properties
    const rawBlobs = toRaw(blobs);
    const rawLoading = toRaw(loading);
    const rawErrors = toRaw(errors);

    const blobEntries = Object.values(rawBlobs);
    const totalSize = blobEntries.reduce((sum, blob) => sum + blob.size, 0);
    const avgAccessCount =
      blobEntries.length > 0
        ? blobEntries.reduce((sum, blob) => sum + blob.accessCount, 0) /
          blobEntries.length
        : 0;

    return {
      totalBlobs: Object.keys(rawBlobs).length,
      loadingCount: Object.keys(rawLoading).filter((key) => rawLoading[key])
        .length,
      errorCount: Object.keys(rawErrors).length,
      totalMemoryUsage: totalSize,
      averageAccessCount: Math.round(avgAccessCount * 100) / 100,
      memoryLimits: getMemoryLimits(),
    };
  };

  /**
   * Get least used blobs (for debugging/monitoring)
   */
  const getLeastUsedBlobs = (count: number = 10) => {
    return Object.entries(blobs)
      .sort(([, a], [, b]) => a.accessCount - b.accessCount)
      .slice(0, count)
      .map(([id, blob]) => ({
        id,
        accessCount: blob.accessCount,
        size: blob.size,
      }));
  };

  /**
   * Get most used blobs (for debugging/monitoring)
   */
  const getMostUsedBlobs = (count: number = 10) => {
    return Object.entries(blobs)
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, count)
      .map(([id, blob]) => ({
        id,
        accessCount: blob.accessCount,
        size: blob.size,
      }));
  };

  return {
    // State
    blobs,
    loading,
    errors,

    // Methods
    getBlob,
    getBlobAndTrack,
    hasBlob,
    isLoading,
    getError,
    fetchAndStoreBlob,
    preloadImages,
    removeBlob,
    clearAll,
    getStats,
    getLeastUsedBlobs,
    getMostUsedBlobs,
    getTotalMemoryUsage,
  };
});
