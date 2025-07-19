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
      const cachedFeatured = LocalStorageService.getFeaturedContent();
      if (cachedFeatured) {
        return cachedFeatured;
      }
    }

    // Check if we're fetching anticipated content
    if (params?.released_after) {
      const cachedAnticipated = LocalStorageService.getAnticipatedContent();
      if (cachedAnticipated) {
        return cachedAnticipated;
      }
    }

    const cleanedParams = params ? cleanQueryParams(params) : {};
    const response = await apiClient.get<ContentListResponse>(
      ENDPOINTS.CONTENT.BASE,
      {
        params: cleanedParams,
      }
    );

    // Cache the response based on the query type
    if (params?.is_featured) {
      LocalStorageService.setFeaturedContent(response);
    } else if (params?.released_after) {
      LocalStorageService.setAnticipatedContent(response);
    }

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
}
