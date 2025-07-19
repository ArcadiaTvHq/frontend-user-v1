import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { setAuthToken, removeAuthToken } from "../config";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "~/types/auth";

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      data
    );
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    return response;
  }

  static async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    removeAuthToken();
  }

  static async verifyOTP(otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      { otp }
    );
    return response;
  }

  static async resendOTP(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>(
      ENDPOINTS.AUTH.RESEND_OTP
    );
    return response;
  }
}
