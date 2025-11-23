import { imageCacheManager } from "~/src/utils/imageCacheManager";

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.client) {
    // Wait for app to be fully mounted before starting monitoring
    const startMonitoring = () => {
      imageCacheManager.startMonitoring(60000); // Check every minute

      // Log initial stats
      imageCacheManager.logCacheStats();
    };

    // Try to start immediately, but retry if Pinia isn't ready
    try {
      startMonitoring();
    } catch (error) {
      // Retry after a longer delay
      setTimeout(() => {
        try {
          startMonitoring();
        } catch (error) {}
      }, 5000);
    }

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      imageCacheManager.stopMonitoring();
    });

    // Expose cache manager to global scope for debugging
    if (process.dev) {
      (window as any).imageCacheManager = imageCacheManager;
    }
  }
});
