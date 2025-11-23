import type { Content, ContentListResponse } from "../types/content";

// Cache keys
export const CACHE_KEYS = {
  FEATURED_CONTENT: "featured_content",
  ANTICIPATED_CONTENT: "anticipated_content",
  RECOMMENDED_CONTENT: "recommended_content",
  TRENDING_CONTENT: "trending_content",
  SIMILAR_CONTENT: "similar_content",
  SINGLE_CONTENT: (id: string) => `content_${id}`,
} as const;

// Cache duration in milliseconds (6 hours)
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

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
    } catch (error) {}
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
      return null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {}
  }

  static clear(): void {
    try {
      // Preserve auth token when clearing cache
      const authToken = localStorage.getItem("auth_token");
      localStorage.clear();
      if (authToken) {
        localStorage.setItem("auth_token", authToken);
      }
    } catch (error) {}
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

  static setRecommendedContent(content: ContentListResponse): void {
    this.set(CACHE_KEYS.RECOMMENDED_CONTENT, content);
  }

  static getRecommendedContent(): ContentListResponse | null {
    return this.get<ContentListResponse>(CACHE_KEYS.RECOMMENDED_CONTENT);
  }

  static setTrendingContent(content: ContentListResponse): void {
    this.set(CACHE_KEYS.TRENDING_CONTENT, content);
  }

  static getTrendingContent(): ContentListResponse | null {
    return this.get<ContentListResponse>(CACHE_KEYS.TRENDING_CONTENT);
  }

  static setSingleContent(id: string, content: Content): void {
    this.set(CACHE_KEYS.SINGLE_CONTENT(id), content);
  }

  static getSingleContent(id: string): Content | null {
    return this.get<Content>(CACHE_KEYS.SINGLE_CONTENT(id));
  }
}
