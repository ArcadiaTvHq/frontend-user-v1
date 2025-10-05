import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CommentListResponse } from "../../src/types/content";

export class ContentInteractionService {
  /**
   * Fetch comments for a specific content item
   * @param contentId Content ID
   * @returns Promise with comment list response
   */
  static async getContentComments(
    contentId: string
  ): Promise<CommentListResponse> {
    const response = await apiClient.get<CommentListResponse>(
      ENDPOINTS.CONTENT_INTERACTION.COMMENTS(contentId)
    );

    return response;
  }

  /**
   * Toggle content in user's watchlist (add if not present, remove if present)
   * @param contentId Content ID to toggle
   * @returns Promise with toggle response
   */
  static async toggleWatchlist(contentId: string): Promise<any> {
    const response = await apiClient.post(ENDPOINTS.WATCHLIST.TOGGLE, {
      content_id: contentId,
    });
    return response;
  }

  /**
   * Submit a comment for content
   * @param commentData Comment data (content_id, comment, rating)
   * @returns Promise with success response
   */
  static async submitComment(commentData: {
    content_id: string;
    comment: string;
    rating: number;
  }): Promise<any> {
    const response = await apiClient.post(
      ENDPOINTS.CONTENT_INTERACTION.SUBMIT_COMMENT,
      commentData
    );
    return response;
  }

  /**
   * Submit a review for content
   * @param contentId Content ID
   * @param reviewData Review data (rating, comment, review text)
   * @returns Promise with success response
   */
  static async submitReview(
    contentId: string,
    reviewData: {
      rating: number;
      comment?: string;
      review?: string;
    }
  ): Promise<any> {
    const response = await apiClient.post(
      ENDPOINTS.CONTENT_INTERACTION.SUBMIT_REVIEW(contentId),
      reviewData
    );
    return response;
  }
}
