import type { Content, ContentListResponse } from "../types/content";

// Cache keys
export const CACHE_KEYS = {
  FEATURED_CONTENT: "featured_content",
  ANTICIPATED_CONTENT: "anticipated_content",
  SIMILAR_CONTENT: "similar_content",
  SINGLE_CONTENT: (id: string) => `content_${id}`,
} as const;

// Cache duration in milliseconds (24 hours)
// const CACHE_DURATION = 24 * 60 * 60 * 1000;
const CACHE_DURATION = 30 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class LocalStorageService {
  private static isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_DURATION;
  }

  static set<T>(key: string, data: T): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      if (this.isExpired(cacheItem.timestamp)) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  // Content-specific methods
  static setFeaturedContent(content: ContentListResponse): void {
    this.set(CACHE_KEYS.FEATURED_CONTENT, content);
  }

  static getFeaturedContent(): ContentListResponse | null {
    return this.get<ContentListResponse>(CACHE_KEYS.FEATURED_CONTENT);
  }

  static setAnticipatedContent(content: ContentListResponse): void {
    this.set(CACHE_KEYS.ANTICIPATED_CONTENT, content);
  }

  static getAnticipatedContent(): ContentListResponse | null {
    return this.get<ContentListResponse>(CACHE_KEYS.ANTICIPATED_CONTENT);
  }

  static setSimilarContent(content: ContentListResponse): void {
    this.set(CACHE_KEYS.SIMILAR_CONTENT, content);
  }

  static getSimilarContent(): ContentListResponse | null {
    return this.get<ContentListResponse>(CACHE_KEYS.SIMILAR_CONTENT);
  }

  static setSingleContent(id: string, content: Content): void {
    this.set(CACHE_KEYS.SINGLE_CONTENT(id), content);
  }

  static getSingleContent(id: string): Content | null {
    return this.get<Content>(CACHE_KEYS.SINGLE_CONTENT(id));
  }
}
