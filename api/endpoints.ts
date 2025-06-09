export const ENDPOINTS = {
  WAITLIST: "/waitlist",
  AUTH: {
    LOGIN: "/auth/signin",
    REGISTER: "/auth/signup",
    LOGOUT: "/auth/logout",
    VERIFY_OTP: "/auth/verify",
    RESEND_OTP: "/auth/verify",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile/update",
    CHANGE_PASSWORD: "/user/change-password",
  },
  CONTENT: {
    BASE: "/content",
    BY_ID: (id: string) => `/content/${id}`,
    BY_SLUG: (slug: string) => `/content/${slug}`,
    TRAILER_URL: (id: string) => `/content/${id}/trailer`,
    VIDEO_URL: (id: string) => `/content/${id}/video`,
  },
  // Add more endpoint categories as needed
} as const;

// Type for endpoint paths
export type EndpointPath =
  | (typeof ENDPOINTS)[keyof typeof ENDPOINTS][keyof (typeof ENDPOINTS)[keyof typeof ENDPOINTS]]
  | ReturnType<(typeof ENDPOINTS)["CONTENT"]["BY_ID"]>
  | ReturnType<(typeof ENDPOINTS)["CONTENT"]["BY_SLUG"]>;
