import { useBlobStore } from "~/stores/blobStore";

export class ImageCacheManager {
  private static instance: ImageCacheManager;
  private blobStore: any = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  /**
   * Get blob store safely, ensuring Pinia is initialized
   */
  private getBlobStore() {
    if (!this.blobStore) {
      try {
        this.blobStore = useBlobStore();
      } catch (error) {
        console.warn("Pinia not ready yet, retrying...");
        return null;
      }
    }
    return this.blobStore;
  }

  /**
   * Start monitoring cache performance
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      const store = this.getBlobStore();
      if (store) {
        this.logCacheStats();
        this.checkMemoryPressure();
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Log current cache statistics
   */
  logCacheStats(): void {
    const store = this.getBlobStore();
    if (!store) return;

    const stats = store.getStats();
    const memoryUsageMB =
      Math.round((stats.totalMemoryUsage / (1024 * 1024)) * 100) / 100;

    console.log("📊 Image Cache Stats:", {
      totalImages: stats.totalBlobs,
      memoryUsage: `${memoryUsageMB} MB`,
      averageAccessCount: stats.averageAccessCount,
      loadingCount: stats.loadingCount,
      errorCount: stats.errorCount,
      limits: stats.memoryLimits,
    });
  }

  /**
   * Check if memory pressure is high and trigger cleanup
   */
  private checkMemoryPressure(): void {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

      if (memoryUsage > 0.85) {
        console.warn(
          "⚠️ High memory pressure detected, triggering aggressive cleanup"
        );
        this.aggressiveCleanup();
      } else if (memoryUsage > 0.7) {
        console.warn(
          "⚠️ Moderate memory pressure detected, triggering cleanup"
        );
        this.cleanup();
      }
    }
  }

  /**
   * Perform aggressive cleanup for high memory pressure
   */
  private aggressiveCleanup(): void {
    const store = this.getBlobStore();
    if (!store) return;

    const stats = store.getStats();
    const leastUsed = store.getLeastUsedBlobs(
      Math.floor(stats.totalBlobs * 0.5)
    );

    leastUsed.forEach(({ id }: { id: string }) => {
      store.removeBlob(id);
    });

    console.log(`🧹 Aggressive cleanup: Removed ${leastUsed.length} images`);
  }

  /**
   * Perform normal cleanup
   */
  private cleanup(): void {
    const store = this.getBlobStore();
    if (!store) return;

    const stats = store.getStats();
    const leastUsed = store.getLeastUsedBlobs(
      Math.floor(stats.totalBlobs * 0.2)
    );

    leastUsed.forEach(({ id }: { id: string }) => {
      store.removeBlob(id);
    });

    console.log(`🧹 Normal cleanup: Removed ${leastUsed.length} images`);
  }

  /**
   * Get cache analysis report
   */
  getCacheAnalysis(): {
    totalImages: number;
    memoryUsageMB: number;
    mostUsedImages: Array<{ id: string; accessCount: number; size: number }>;
    leastUsedImages: Array<{ id: string; accessCount: number; size: number }>;
    memoryPressure: "low" | "medium" | "high";
  } {
    const store = this.getBlobStore();
    if (!store) {
      return {
        totalImages: 0,
        memoryUsageMB: 0,
        mostUsedImages: [],
        leastUsedImages: [],
        memoryPressure: "low",
      };
    }

    const stats = store.getStats();
    const memoryUsageMB =
      Math.round((stats.totalMemoryUsage / (1024 * 1024)) * 100) / 100;

    let memoryPressure: "low" | "medium" | "high" = "low";
    if (typeof performance !== "undefined" && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (usage > 0.8) memoryPressure = "high";
      else if (usage > 0.6) memoryPressure = "medium";
    }

    return {
      totalImages: stats.totalBlobs,
      memoryUsageMB,
      mostUsedImages: store.getMostUsedBlobs(10),
      leastUsedImages: store.getLeastUsedBlobs(10),
      memoryPressure,
    };
  }

  /**
   * Manually clear cache
   */
  clearCache(): void {
    const store = this.getBlobStore();
    if (store) {
      store.clearAll();
      console.log("🗑️ Cache cleared manually");
    }
  }

  /**
   * Remove specific images by pattern
   */
  removeImagesByPattern(pattern: RegExp): number {
    const store = this.getBlobStore();
    if (!store) return 0;

    const stats = store.getStats();
    let removedCount = 0;

    Object.keys(store.blobs).forEach((id: string) => {
      if (pattern.test(id)) {
        store.removeBlob(id);
        removedCount++;
      }
    });

    console.log(
      `🗑️ Removed ${removedCount} images matching pattern: ${pattern}`
    );
    return removedCount;
  }

  /**
   * Remove images older than specified time
   */
  removeOldImages(maxAgeMs: number): number {
    const store = this.getBlobStore();
    if (!store) return 0;

    const now = Date.now();
    let removedCount = 0;

    Object.entries(store.blobs).forEach(([id, blob]: [string, any]) => {
      if (now - blob.lastAccessed > maxAgeMs) {
        store.removeBlob(id);
        removedCount++;
      }
    });

    console.log(`🗑️ Removed ${removedCount} images older than ${maxAgeMs}ms`);
    return removedCount;
  }

  /**
   * Optimize cache by removing low-priority images
   */
  optimizeCache(): void {
    const store = this.getBlobStore();
    if (!store) return;

    const stats = store.getStats();
    const leastUsed = store.getLeastUsedBlobs(
      Math.floor(stats.totalBlobs * 0.3)
    );

    // Remove images with very low access count
    const toRemove = leastUsed.filter(
      ({ accessCount }: { accessCount: number }) => accessCount <= 1
    );

    toRemove.forEach(({ id }: { id: string }) => {
      store.removeBlob(id);
    });

    console.log(
      `⚡ Cache optimization: Removed ${toRemove.length} low-priority images`
    );
  }
}

// Export singleton instance
export const imageCacheManager = ImageCacheManager.getInstance();
