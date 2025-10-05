import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  // Ignore special routes and DevTools requests
  if (to.path.startsWith("/.well-known/") || to.path.startsWith("/__nuxt")) {
    return;
  }

  const authStore = useAuthStore();
  const publicRoutes = ["/login", "/signup", "/otp"];

  // Check if the route matches any of the public patterns
  const isPublicRoute = (path: string) => {
    // Static public routes
    if (publicRoutes.includes(path)) return true;

    // Dynamic public routes - detail pages and trailers are public
    const watchDetailPattern = /^\/watch\/[^/]+$/;
    const watchTrailerPattern = /^\/watch\/[^/]+\/trailer$/;

    return watchDetailPattern.test(path) || watchTrailerPattern.test(path);
  };

  // Check if the route matches any of the protected patterns
  const isProtectedRoute = (path: string) => {
    // Static protected routes
    const protectedStaticRoutes = [
      "/watch",
      "/profile",
      "/my-list",
      "/movies",
      "/tv-shows",
      "/new",
    ];

    if (protectedStaticRoutes.includes(path)) return true;

    // Dynamic protected routes - only video playback is protected
    const watchVideoPattern = /^\/watch\/[^/]+\/video$/;

    return watchVideoPattern.test(path);
  };

  // If user is authenticated and on root path, redirect to /watch
  if (authStore.isAuthenticated && authStore.isVerified && to.path === "/") {
    return navigateTo("/watch");
  }

  // If user is authenticated but not verified, redirect to OTP page
  // except if they're already on the OTP page or on a public route
  if (
    authStore.isAuthenticated &&
    !authStore.isVerified &&
    !isPublicRoute(to.path) &&
    to.path !== "/otp"
  ) {
    return navigateTo("/otp");
  }

  // If trying to access a protected route and not authenticated
  if (isProtectedRoute(to.path) && !authStore.isAuthenticated) {
    // Redirect to login with the intended destination as query parameter
    return navigateTo(`/login?redirect-to=${encodeURIComponent(to.fullPath)}`);
  }

  // If authenticated and verified user tries to access auth pages
  if (
    authStore.isAuthenticated &&
    authStore.isVerified &&
    (to.path === "/login" || to.path === "/signup" || to.path === "/otp")
  ) {
    // Check if there's a redirect-to query parameter
    const redirectTo = to.query["redirect-to"];
    if (redirectTo) {
      return navigateTo(decodeURIComponent(redirectTo), { replace: true });
    }
    return navigateTo("/watch", { replace: true });
  }
});
