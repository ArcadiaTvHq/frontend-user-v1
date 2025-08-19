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
    TRAILER_URL: (id: string) => `/content/${id}/trailer-url`,
    VIDEO_URL: (id: string) => `/content/${id}/video`,
    ANTICIPATED: "/content/anticipate",
    FEATURED: "/content/featured",
    RECOMMENDED: "/content/recommended",
    TRENDING: "content/trending",
    SIMILAR: (slug: string) => `/content/${slug}/similar`,
    TRAILER_URL_BY_SLUG: (slug: string) => `/content/${slug}/trailer-url`,
  },
  PLAYBACK: {
    START: "/playback/start-playback",
    UPDATE: "/playback/update-playback",
    HEARTBEAT: "/playback/heartbeat",
    TEST_KEY: "/playback/test-private-key",
  },
  ADVERTS: {
    FETCH: "/adverts/public/fetch",
  },
  // Add more endpoint categories as needed
} as const;

// Type for endpoint paths
export type EndpointPath =
  | (typeof ENDPOINTS)[keyof typeof ENDPOINTS][keyof (typeof ENDPOINTS)[keyof typeof ENDPOINTS]]
  | ReturnType<(typeof ENDPOINTS)["CONTENT"]["BY_ID"]>
  | ReturnType<(typeof ENDPOINTS)["CONTENT"]["BY_SLUG"]>
  | ReturnType<(typeof ENDPOINTS)["CONTENT"]["SIMILAR"]>
  | ReturnType<(typeof ENDPOINTS)["CONTENT"]["TRAILER_URL_BY_SLUG"]>;
