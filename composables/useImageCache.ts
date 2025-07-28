import { imageCacheManager } from "~/src/utils/imageCacheManager";
import { useBlobStore } from "~/stores/blobStore";

export const useImageCache = () => {
  const blobStore = useBlobStore();

  /**
   * Get current cache statistics
   */
  const getCacheStats = () => {
    return blobStore.getStats();
  };

  /**
   * Get detailed cache analysis
   */
  const getCacheAnalysis = () => {
    return imageCacheManager.getCacheAnalysis();
  };

  /**
   * Manually clear the entire cache
   */
  const clearCache = () => {
    imageCacheManager.clearCache();
  };

  /**
   * Optimize cache by removing low-priority images
   */
  const optimizeCache = () => {
    imageCacheManager.optimizeCache();
  };

  /**
   * Remove images by pattern (e.g., remove all banner images)
   */
  const removeImagesByPattern = (pattern: RegExp) => {
    return imageCacheManager.removeImagesByPattern(pattern);
  };

  /**
   * Remove images older than specified time
   */
  const removeOldImages = (maxAgeMs: number) => {
    return imageCacheManager.removeOldImages(maxAgeMs);
  };

  /**
   * Get most used images (for debugging)
   */
  const getMostUsedImages = (count: number = 10) => {
    return blobStore.getMostUsedBlobs(count);
  };

  /**
   * Get least used images (for debugging)
   */
  const getLeastUsedImages = (count: number = 10) => {
    return blobStore.getLeastUsedBlobs(count);
  };

  /**
   * Get total memory usage in MB
   */
  const getMemoryUsageMB = () => {
    const totalBytes = blobStore.getTotalMemoryUsage();
    return Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
  };

  /**
   * Check if cache is under memory pressure
   */
  const isUnderMemoryPressure = () => {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return memoryUsage > 0.7;
    }
    return false;
  };

  /**
   * Force cleanup when memory pressure is detected
   */
  const forceCleanup = () => {
    if (isUnderMemoryPressure()) {
      console.warn("🧹 Forcing cache cleanup due to memory pressure");
      imageCacheManager.optimizeCache();
      return true;
    }
    return false;
  };

  return {
    // Statistics
    getCacheStats,
    getCacheAnalysis,
    getMemoryUsageMB,
    isUnderMemoryPressure,

    // Management
    clearCache,
    optimizeCache,
    forceCleanup,
    removeImagesByPattern,
    removeOldImages,

    // Debugging
    getMostUsedImages,
    getLeastUsedImages,

    // Direct store access
    blobStore,
  };
};
