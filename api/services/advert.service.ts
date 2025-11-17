import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface Advert {
  id: string;
  type: "short_video" | "long_video" | "image";
  positions: string[]; // Changed from 'position' to 'positions' to match backend
  title: string;
  description: string;
  url: string;
  thumbnail_url: string | null; // Made nullable to match backend
  duration: number;
  asset_uid: string;
  asset_url: string;
  is_published: boolean;
  cpm: string; // Changed from number to string to match backend
  created_at: string;
}

export interface AdvertResponse {
  status: string;
  message: string;
  data: {
    start: Advert[];
    middle: Advert[];
    end: Advert[];
    pause: Advert[];
  };
}

export interface FetchAdvertsRequest {
  content_id?: string;
}

export interface AdvertActivityRequest {
  advert_id: string;
  content_id: string;
  clicked: boolean;
  skipped: boolean;
  duration_watched: number;
}

export class AdvertService {
  static async fetchAdverts(
    request: FetchAdvertsRequest = {}
  ): Promise<AdvertResponse> {
    try {
      // Check if auth token is available
      if (process.client) {
        const token = localStorage.getItem("auth_token");
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (request.content_id) {
        params.append("content_id", request.content_id);
      }

      const url = `${ENDPOINTS.ADVERTS.FETCH}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await apiClient.get<AdvertResponse>(url);
      return response;
    } catch (error) {
      console.error("❌ Error fetching adverts:", error);
      throw error;
    }
  }

  static getAdvertsByPositionAndType(
    adverts: Advert[],
    position: string,
    type?: string[]
  ): Advert[] {
    if (!adverts || !Array.isArray(adverts)) {
      return [];
    }

    if (type && type.length > 0) {
      // Filter by both position and type
      return adverts.filter(
        (advert) =>
          advert.positions.includes(position) &&
          advert.is_published &&
          type.includes(advert.type)
      );
    } else {
      // Filter only by position
      return adverts.filter(
        (advert) => advert.positions.includes(position) && advert.is_published
      );
    }
  }

  static getAdvertsByType(adverts: Advert[], type: string): Advert[] {
    if (!adverts || !Array.isArray(adverts)) {
      return [];
    }

    return adverts.filter(
      (advert) => advert.type === type && advert.is_published
    );
  }

  static getVideoAdverts(adverts: Advert[]): Advert[] {
    if (!adverts || !Array.isArray(adverts)) {
      return [];
    }

    return adverts.filter(
      (advert) =>
        (advert.type === "short_video" || advert.type === "long_video") &&
        advert.is_published
    );
  }

  static getImageAdverts(adverts: Advert[]): Advert[] {
    if (!adverts || !Array.isArray(adverts)) {
      return [];
    }

    return adverts.filter(
      (advert) => advert.type === "image" && advert.is_published
    );
  }

  static getRandomAdvert(adverts: Advert[]): Advert | null {
    if (!adverts || !Array.isArray(adverts) || adverts.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * adverts.length);
    return adverts[randomIndex];
  }

  static async trackAdvertActivity(
    request: AdvertActivityRequest
  ): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.ADVERTS.ACTIVITY, request);
    } catch (error) {
      console.error("❌ Error tracking advert activity:", error);
      // Don't throw - we don't want to break the user experience if tracking fails
    }
  }
}
