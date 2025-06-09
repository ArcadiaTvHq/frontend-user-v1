import type { AxiosRequestConfig } from "axios";

export const API_CONFIG: AxiosRequestConfig = {
  baseURL: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const getAuthToken = (): string | null => {
  if (process.client) {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (process.client) {
    localStorage.setItem("auth_token", token);
  }
};

export const removeAuthToken = (): void => {
  if (process.client) {
    localStorage.removeItem("auth_token");
  }
};
