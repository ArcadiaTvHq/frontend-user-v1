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
    ME: "/user/me",
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
    END: "/playback/end-playback-session",
    TEST_KEY: "/playback/test-private-key",
  },
  ADVERTS: {
    FETCH: "/adverts/fetch/playback",
    ACTIVITY: "/adverts/activity",
  },
  CONTENT_INTERACTION: {
    COMMENTS: (contentId: string) =>
      `/content-interaction/comment/${contentId}`,
    SUBMIT_COMMENT: "/content-interaction/comment",
    SUBMIT_REVIEW: (contentId: string) =>
      `/content-interaction/review/${contentId}`,
  },
  WATCHLIST: {
    TOGGLE: "/watchlist",
    GET: "/watchlist",
  },
  SUBSCRIPTION: {
    GET: "/subscriptions",
    GET_CARDS: "/subscriptions/cards",
    INITIALIZE_PAYMENT: (subscriptionId: string) =>
      `/subscriptions/${subscriptionId}/initialize-payment`,
    CANCEL: "/subscriptions/cancel-subscription",
    DELETE_CARD: (cardId: string) => `/subscriptions/cards/${cardId}`,
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
