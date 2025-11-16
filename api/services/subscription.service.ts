import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface SubscriptionRule {
  pause_ads: boolean;
  inplay_ads: boolean;
  video_quality: string;
  international_content: boolean;
}

export interface Subscription {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  rules: SubscriptionRule;
  name: string;
  description: string;
  price: string;
  price_usd: string;
  is_active: boolean;
  is_default: boolean;
}

export interface SubscriptionListResponse {
  status: string;
  message: string;
  data: Subscription[];
}

export interface Card {
  id: string;
  user_id: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  account_name: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CardsResponse {
  status: string;
  message: string;
  data: Card[];
}

export class SubscriptionService {
  /**
   * Fetch all available subscription plans
   * @returns Promise with subscription list response
   */
  static async getSubscriptions(): Promise<SubscriptionListResponse> {
    const response = await apiClient.get<SubscriptionListResponse>(
      ENDPOINTS.SUBSCRIPTION.GET
    );
    return response;
  }

  /**
   * Fetch all cards for the authenticated user
   * @returns Promise with cards response
   */
  static async getCards(): Promise<CardsResponse> {
    const response = await apiClient.get<CardsResponse>(
      ENDPOINTS.SUBSCRIPTION.GET_CARDS
    );
    console.log("Cards response:", response);
    return response;
  }

  /**
   * Delete a saved payment card for the authenticated user
   * @param cardId Card identifier
   */
  static async deleteCard(cardId: string): Promise<any> {
    const response = await apiClient.delete(
      ENDPOINTS.SUBSCRIPTION.DELETE_CARD(cardId)
    );
    return response;
  }

  /**
   * Cancel the current user's subscription
   * @returns Promise with API response (status/message and possibly updated user)
   */
  static async cancelSubscription(): Promise<any> {
    const response = await apiClient.post(ENDPOINTS.SUBSCRIPTION.CANCEL);
    return response;
  }
}
