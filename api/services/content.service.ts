import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  ContentListResponse,
  ContentQueryParams,
  SingleContentResponse,
  SignedUrlResponse,
} from "../../src/types/content";
import { cleanQueryParams } from "../../src/utils/helpers";
import { LocalStorageService, CACHE_KEYS } from "../../src/utils/localStorage";

export class ContentService {
  /**
   * Fetch content list with optional filters
   * @param params Query parameters and filters
   * @returns Promise with content list response
   */
  static async getContents(
    params?: ContentQueryParams
  ): Promise<ContentListResponse> {
    // Check if we're fetching featured content
    if (params?.is_featured) {
      // Use the main content API instead of cached featured content
      // to ensure we get watchlist data
      const cleanedParams = params ? cleanQueryParams(params) : {};
      const response = await apiClient.get<ContentListResponse>(
        ENDPOINTS.CONTENT.BASE,
        {
          params: cleanedParams,
        }
      );
      return response;
    }

    // Note: released_after is used for "new content" (recently released), not anticipated content
    // Anticipated content should use the dedicated /content/anticipate endpoint

    const cleanedParams = params ? cleanQueryParams(params) : {};
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.BASE,
      {
        params: cleanedParams,
      }
    );

    return response;
  }

  /**
   * Fetch single content by ID
   * @param id Content ID
   * @returns Promise with single content response
   */
  static async getContentById(id: string): Promise<SingleContentResponse> {
    // Check cache first
    const cachedContent = LocalStorageService.getSingleContent(id);
    if (cachedContent) {
      return { message: "Content retrieved successfully", data: cachedContent };
    }

    const response = await apiClient.get<SingleContentResponse>(
      ENDPOINTS.CONTENT.BY_ID(id)
    );

    // Cache the response
    LocalStorageService.setSingleContent(id, response.data);

    return response;
  }

  /**
   * Fetch single content by slug
   * @param slug Content slug
   * @returns Promise with single content response
   */
  static async getContentBySlug(slug: string): Promise<SingleContentResponse> {
    const response = await apiClient.get<SingleContentResponse>(
      ENDPOINTS.CONTENT.BY_SLUG(slug)
    );

    // Cache the response using the content's ID
    LocalStorageService.setSingleContent(response.data.id, response.data);

    return response;
  }

  /**
   * Fetch signed URL for content trailer
   * @param contentId Content ID
   * @returns Promise with signed URL response
   */
  static async getTrailerSignedUrl(
    contentId: string
  ): Promise<SignedUrlResponse> {
    const response = await apiClient.get<SignedUrlResponse>(
      ENDPOINTS.CONTENT.TRAILER_URL(contentId)
    );
    return response;
  }

  /**
   * Fetch signed URL for content video
   * @param contentId Content ID
   * @returns Promise with signed URL response
   */
  static async getVideoSignedUrl(
    contentId: string
  ): Promise<SignedUrlResponse> {
    const response = await apiClient.get<SignedUrlResponse>(
      ENDPOINTS.CONTENT.VIDEO_URL(contentId)
    );
    return response;
  }

  /**
   * Fetch anticipated content
   * @param type Optional content type filter (movie, series, etc.)
   * @returns Promise with content list response
   */
  static async getAnticipatedContent(
    type?: string
  ): Promise<ContentListResponse> {
    // Check cache first (only if no type filter)
    if (!type) {
      const cachedAnticipated = LocalStorageService.getAnticipatedContent();
      if (cachedAnticipated) {
        return cachedAnticipated;
      }
    }

    const params = type ? { type } : {};
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.ANTICIPATED,
      { params }
    );

    // Cache the response (only if no type filter)
    if (!type) {
      LocalStorageService.setAnticipatedContent(response);
    }

    return response;
  }

  /**
   * Fetch featured content
   * @returns Promise with content list response
   */
  static async getFeaturedContent(): Promise<ContentListResponse> {
    // Check cache first
    const cachedFeatured = LocalStorageService.getFeaturedContent();
    if (cachedFeatured) {
      return cachedFeatured;
    }

    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.FEATURED
    );

    // Cache the response
    LocalStorageService.setFeaturedContent(response);

    return response;
  }

  /**
   * Fetch recommended content
   * @param type Optional content type filter (movie, series, etc.)
   * @returns Promise with content list response
   */
  static async getRecommendedContent(
    type?: string
  ): Promise<ContentListResponse> {
    // Check cache first (only if no type filter)
    if (!type) {
      const cachedRecommended = LocalStorageService.getRecommendedContent();
      if (cachedRecommended) {
        return cachedRecommended;
      }
    }

    const params = type ? { type } : {};
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.RECOMMENDED,
      { params }
    );

    // Cache the response (only if no type filter)
    if (!type) {
      LocalStorageService.setRecommendedContent(response);
    }

    return response;
  }

  /**
   * Fetch trending content
   * @param type Optional content type filter (movie, series, etc.)
   * @returns Promise with content list response
   */
  static async getTrendingContent(type?: string): Promise<ContentListResponse> {
    // Check cache first (only if no type filter)
    if (!type) {
      const cachedTrending = LocalStorageService.getTrendingContent();
      if (cachedTrending) {
        return cachedTrending;
      }
    }

    const params = type ? { type } : {};
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.TRENDING,
      { params }
    );

    // Cache the response (only if no type filter)
    if (!type) {
      LocalStorageService.setTrendingContent(response);
    }

    return response;
  }

  /**
   * Fetch similar content by slug
   * @param slug Content slug
   * @returns Promise with content list response
   */
  static async getSimilarContent(slug: string): Promise<ContentListResponse> {
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.SIMILAR(slug)
    );
    return response;
  }

  /**
   * Fetch trailer URL by content slug
   * @param slug Content slug
   * @returns Promise with signed URL response
   */
  static async getTrailerUrlBySlug(slug: string): Promise<SignedUrlResponse> {
    const response = await apiClient.get<SignedUrlResponse>(
      ENDPOINTS.CONTENT.TRAILER_URL_BY_SLUG(slug)
    );
    return response;
  }

  /**
   * Fetch user's watchlist content
   * @param params Optional query parameters (page, limit, etc.)
   * @returns Promise with content list response containing only watchlist items
   */
  static async getWatchlistContent(
    params?: Omit<ContentQueryParams, "watchlist_only">
  ): Promise<ContentListResponse> {
    const watchlistParams: ContentQueryParams = {
      ...params,
      watchlist_only: true,
    };

    const cleanedParams = cleanQueryParams(watchlistParams);
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.BASE,
      {
        params: cleanedParams,
      }
    );

    return response;
  }
}
