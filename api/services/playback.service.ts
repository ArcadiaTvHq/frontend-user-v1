import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface IWatchStretch {
  start_time: Date;
  end_time: Date;
  start_duration: number;
  end_duration: number;
}

export interface PlaybackSession {
  sessionId: string;
  token: string;
  nbf: number; // Not valid before (timestamp)
  exp: number; // Expires at (timestamp)
  contentId: string;
  lastDuration?: number; // Last watched duration in seconds
}

export interface PlaybackResponse {
  success: boolean;
  message: string;
  data: PlaybackSession;
}

export interface HeartbeatResponse {
  success: boolean;
  message: string;
  data?: {
    sessionActive: boolean;
    tokenValid: boolean;
  };
}

export interface EndPlaybackResponse {
  success: boolean;
  message: string;
  data?: {
    sessionEnded: boolean;
  };
}

export interface PrivateKeyTestResponse {
  success: boolean;
  message: string;
  data?: {
    keyLength: number;
    isPem: boolean;
    keyStart: string;
    keyEnd: string;
  };
}

export class PlaybackService {
  /**
   * Start a new playback session
   * @param contentId Content ID to start playback for
   * @param userAgent User agent string for device identification
   * @returns Promise with playback session response
   */
  static async startPlayback(
    contentId: string,
    userAgent: string
  ): Promise<PlaybackResponse> {
    const response = await apiClient.post<PlaybackResponse>(
      ENDPOINTS.PLAYBACK.START,
      {
        contentId,
        userAgent,
      }
    );
    return response;
  }

  /**
   * Update playback session (refresh token)
   * @param contentId Content ID for the playback session
   * @returns Promise with updated playback session response
   */
  static async updatePlayback(contentId: string): Promise<PlaybackResponse> {
    const response = await apiClient.post<PlaybackResponse>(
      ENDPOINTS.PLAYBACK.UPDATE,
      {
        contentId,
      }
    );
    return response;
  }

  /**
   * Send heartbeat to keep session alive
   * @param contentId Content ID for the playback session
   * @param watchStretches Array of watch stretches to record viewing activities
   * @returns Promise with heartbeat response
   */
  static async sendHeartbeat(
    contentId: string,
    watchStretches: IWatchStretch[] = []
  ): Promise<HeartbeatResponse> {
    const response = await apiClient.post<HeartbeatResponse>(
      ENDPOINTS.PLAYBACK.HEARTBEAT,
      {
        contentId,
        watchStretches,
      }
    );
    return response;
  }

  /**
   * End a playback session
   * @param contentId Content ID for the playback session
   * @param status Session end status: 'COMPLETED' or 'ABANDONED'
   * @param watchStretches Array of watch stretches to record viewing activities
   * @returns Promise with end playback response
   */
  static async endPlaybackSession(
    contentId: string,
    status: "completed" | "abandoned",
    watchStretches: IWatchStretch[] = []
  ): Promise<EndPlaybackResponse> {
    const response = await apiClient.post<EndPlaybackResponse>(
      ENDPOINTS.PLAYBACK.END,
      {
        contentId,
        status,
        watchStretches,
      }
    );
    return response;
  }

  /**
   * Test private key configuration
   * @returns Promise with private key test response
   */
  static async testPrivateKey(): Promise<PrivateKeyTestResponse> {
    const response = await apiClient.get<PrivateKeyTestResponse>(
      ENDPOINTS.PLAYBACK.TEST_KEY
    );
    return response;
  }
}
