export const ROUTES = {
  WATCH: "/watch",
  WATCH_DETAILS: (slug: string) => `/watch/${slug}`,
  WATCH_TRAILER: (slug: string) => `/watch/${slug}/trailer`,
  WATCH_VIDEO: (slug: string) => `/watch/${slug}/video`,
  LOGIN: "/login",
  SIGNUP: "/signup",
  WAITLIST: "/waitlist",
  VIDEO: "/video",
  OTP: "/otp",
  INDEX: "/",
  // Add more routes as needed
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.INDEX,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.WAITLIST,
  // Allow access to watch/:slug and watch/:slug/trailer
  /^\/watch\/[^/]+$/,
  /^\/watch\/[^/]+\/trailer$/,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.WATCH,
  ROUTES.VIDEO,
  ROUTES.OTP,
  // Protect watch/:slug/video
  /^\/watch\/[^/]+\/video$/,
  // ROUTES.TEST,
] as const;
