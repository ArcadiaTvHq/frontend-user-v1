import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

interface WaitlistData {
  firstName: string;
  lastName: string;
  email: string;
}

interface WaitlistResponse {
  success: boolean;
  message: string;
}

export class WaitlistService {
  static async join(data: WaitlistData): Promise<WaitlistResponse> {
    return await apiClient.post<WaitlistResponse>(ENDPOINTS.WAITLIST, {
      full_name: `${data.firstName} ${data.lastName}`,
      email: data.email,
    });
  }
}
