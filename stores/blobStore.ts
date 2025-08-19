import { defineStore } from "pinia";
import { ref, reactive, toRaw } from "vue";

interface BlobMetadata {
  url: string;
  lastAccessed: number;
  accessCount: number;
  size: number; // Size in bytes
  priority: number; // Higher number = higher priority
}

interface RetryState {
  attempts: number;
  lastAttempt: number;
  nextRetryTime: number;
}

interface BlobStoreState {
  blobs: Record<string, BlobMetadata>; // imageId -> blob metadata
  loading: Record<string, boolean>; // imageId -> loading state
  errors: Record<string, string>; // imageId -> error message
  retryStates: Record<string, RetryState>; // imageId -> retry state
}

export const useBlobStore = defineStore("blobStore", () => {
  // State
  const blobs = reactive<Record<string, BlobMetadata>>({});
  const loading = reactive<Record<string, boolean>>({});
  const errors = reactive<Record<string, string>>({});
  const retryStates = reactive<Record<string, RetryState>>({});

  // Configuration
  const IMAGE_DELIVERY_BASE_URL =
    "https://imagedelivery.net/DsjSNgDb-WbLxvpVXBuSVg";

  // Retry configuration
  const MAX_RETRY_ATTEMPTS = 3;
  const BASE_RETRY_DELAY = 1000; // 1 second
  const MAX_RETRY_DELAY = 10000; // 10 seconds

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
   * Calculate exponential backoff delay
   */
  const getRetryDelay = (attempt: number): number => {
    const delay = Math.min(
      BASE_RETRY_DELAY * Math.pow(2, attempt - 1),
      MAX_RETRY_DELAY
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  };

  /**
   * Check if retry should be attempted
   */
  const shouldRetry = (imageId: string): boolean => {
    const retryState = retryStates[imageId];
    if (!retryState) return true;

    const now = Date.now();
    return (
      retryState.attempts < MAX_RETRY_ATTEMPTS &&
      now >= retryState.nextRetryTime
    );
  };

  /**
   * Update retry state
   */
  const updateRetryState = (imageId: string, success: boolean): void => {
    if (success) {
      delete retryStates[imageId];
      delete errors[imageId];
    } else {
      const currentState = retryStates[imageId] || {
        attempts: 0,
        lastAttempt: 0,
        nextRetryTime: 0,
      };

      currentState.attempts++;
      currentState.lastAttempt = Date.now();
      currentState.nextRetryTime =
        Date.now() + getRetryDelay(currentState.attempts);

      retryStates[imageId] = currentState;
    }
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
   * Get error message for an image ID
   */
  const getError = (imageId: string): string | null => {
    return errors[imageId] || null;
  };

  /**
   * Get retry state for an image ID
   */
  const getRetryState = (imageId: string): RetryState | null => {
    return retryStates[imageId] || null;
  };

  /**
   * Calculate total memory usage of all blobs
   */
  const getTotalMemoryUsage = (): number => {
    return Object.values(blobs).reduce((total, blob) => total + blob.size, 0);
  };

  /**
   * Smart cleanup based on memory limits and access patterns
   */
  const smartCleanup = (): void => {
    const { maxBlobs, cleanupThreshold } = getMemoryLimits();
    const blobCount = Object.keys(blobs).length;

    if (blobCount <= maxBlobs) return;

    // Convert to array and sort by priority and access patterns
    const blobEntries = Object.entries(blobs).map(([id, blob]) => ({
      id,
      ...blob,
    }));

    // Sort by: 1) Priority (desc), 2) Last accessed (asc), 3) Access count (asc)
    blobEntries.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      if (a.lastAccessed !== b.lastAccessed) {
        return a.lastAccessed - b.lastAccessed; // Older first
      }
      return a.accessCount - b.accessCount; // Less accessed first
    });

    // Remove least important blobs
    const toRemove = blobEntries.slice(cleanupThreshold);
    toRemove.forEach(({ id }) => {
      removeBlob(id);
    });

    console.log(
      `Smart cleanup: Removed ${toRemove.length} blobs, kept ${
        blobCount - toRemove.length
      }`
    );
  };

  /**
   * Fetch image and store as blob with enhanced metadata and retry logic
   */
  const fetchAndStoreBlob = async (
    imageId: string,
    size: string = "public"
  ): Promise<string> => {
    console.log(`BlobStore: Fetching image ${imageId} with size ${size}`);

    // If already cached, return the blob URL and update access
    if (blobs[imageId]) {
      const blob = blobs[imageId];
      blob.lastAccessed = Date.now();
      blob.accessCount++;
      console.log(
        `BlobStore: Image ${imageId} already cached, returning URL: ${blob.url}`
      );
      return blob.url;
    }

    // If already loading, wait for it to complete
    if (loading[imageId]) {
      console.log(`BlobStore: Image ${imageId} already loading, waiting...`);
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

    // Check if we should retry
    if (!shouldRetry(imageId)) {
      const retryState = retryStates[imageId];
      const timeUntilRetry = retryState.nextRetryTime - Date.now();
      throw new Error(
        `Retry not available yet. Next retry in ${Math.ceil(
          timeUntilRetry / 1000
        )}s`
      );
    }

    // Start loading
    loading[imageId] = true;
    delete errors[imageId];
    console.log(`BlobStore: Starting to fetch image ${imageId}`);

    try {
      const url = `${IMAGE_DELIVERY_BASE_URL}/${imageId}/${size}`;
      console.log(`BlobStore: Fetching from URL: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log(
        `BlobStore: Successfully fetched image ${imageId}, blob size: ${blob.size}, URL: ${blobUrl}`
      );

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

      // Mark as successful
      updateRetryState(imageId, true);

      return blobUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors[imageId] = errorMessage;

      // Update retry state
      updateRetryState(imageId, false);

      console.error(
        `BlobStore: Failed to fetch blob for image ${imageId}:`,
        errorMessage
      );
      throw error;
    } finally {
      loading[imageId] = false;
    }
  };

  /**
   * Fetch image with retry logic
   */
  const fetchWithRetry = async (
    imageId: string,
    size: string = "public"
  ): Promise<string> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        return await fetchAndStoreBlob(imageId, size);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < MAX_RETRY_ATTEMPTS) {
          const delay = getRetryDelay(attempt);
          console.log(
            `Retrying image ${imageId} in ${delay}ms (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  };

  /**
   * Preload multiple images in background with priority and retry
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
        await fetchWithRetry(imageId, size);
      } catch (error) {
        console.warn(
          `Failed to preload image ${imageId} after retries:`,
          error
        );
      }
    });

    await Promise.allSettled(promises);
  };

  /**
   * Remove specific blob by ID
   */
  const removeBlob = (imageId: string): void => {
    const blob = blobs[imageId];
    if (blob) {
      URL.revokeObjectURL(blob.url);
      delete blobs[imageId];
      delete loading[imageId];
      delete errors[imageId];
      delete retryStates[imageId];
    }
  };

  /**
   * Clear all blobs and reset state
   */
  const clearAll = (): void => {
    // Revoke all blob URLs to prevent memory leaks
    Object.values(blobs).forEach((blob) => {
      URL.revokeObjectURL(blob.url);
    });

    // Clear all state
    Object.keys(blobs).forEach((key) => delete blobs[key]);
    Object.keys(loading).forEach((key) => delete loading[key]);
    Object.keys(errors).forEach((key) => delete errors[key]);
    Object.keys(retryStates).forEach((key) => delete retryStates[key]);
  };

  /**
   * Get statistics about the blob store
   */
  const getStats = () => {
    const totalBlobs = Object.keys(blobs).length;
    const totalLoading = Object.keys(loading).length;
    const totalErrors = Object.keys(errors).length;
    const totalRetries = Object.keys(retryStates).length;
    const totalMemory = getTotalMemoryUsage();

    // Calculate average access count
    const totalAccessCount = Object.values(blobs).reduce(
      (sum, blob) => sum + blob.accessCount,
      0
    );
    const averageAccessCount =
      totalBlobs > 0 ? totalAccessCount / totalBlobs : 0;

    const retryStats = Object.values(retryStates).reduce(
      (acc, state) => {
        acc.totalAttempts += state.attempts;
        acc.maxAttempts = Math.max(acc.maxAttempts, state.attempts);
        return acc;
      },
      { totalAttempts: 0, maxAttempts: 0 }
    );

    return {
      totalBlobs,
      totalLoading,
      totalErrors,
      totalRetries,
      totalMemory,
      averageAccessCount,
      loadingCount: totalLoading,
      errorCount: totalErrors,
      retryStats,
      memoryLimits: getMemoryLimits(),
    };
  };

  /**
   * Get least used blobs (for debugging)
   */
  const getLeastUsedBlobs = (count: number = 10) => {
    return Object.entries(blobs)
      .map(([id, blob]) => ({ id, ...blob }))
      .sort((a, b) => a.accessCount - b.accessCount)
      .slice(0, count);
  };

  /**
   * Get most used blobs (for debugging)
   */
  const getMostUsedBlobs = (count: number = 10) => {
    return Object.entries(blobs)
      .map(([id, blob]) => ({ id, ...blob }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, count);
  };

  return {
    // Core methods
    getBlob,
    getBlobAndTrack,
    hasBlob,
    isLoading,
    getError,
    getRetryState,
    fetchAndStoreBlob,
    fetchWithRetry,
    preloadImages,
    removeBlob,
    clearAll,

    // Statistics and debugging
    getStats,
    getLeastUsedBlobs,
    getMostUsedBlobs,
    getTotalMemoryUsage,
    smartCleanup,

    // Configuration
    getMemoryLimits,
    getImagePriority,
  };
});
