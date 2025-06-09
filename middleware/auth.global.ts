import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware((to) => {
  // Ignore special routes and DevTools requests
  if (to.path.startsWith("/.well-known/") || to.path.startsWith("/__nuxt")) {
    return;
  }

  console.log("🔒 Auth Middleware Running");

  const authStore = useAuthStore();
  const publicRoutes = ["/", "/login", "/signup", "/otp"];

  // Check if the route matches any of the public patterns
  const isPublicRoute = (path: string) => {
    // Static public routes
    if (publicRoutes.includes(path)) return true;

    // Dynamic public routes
    const watchDetailPattern = /^\/watch\/[^/]+$/;
    const watchTrailerPattern = /^\/watch\/[^/]+\/trailer$/;

    return watchDetailPattern.test(path) || watchTrailerPattern.test(path);
  };

  // Check if the route matches any of the protected patterns
  const isProtectedRoute = (path: string) => {
    // Static protected routes
    if (path === "/watch") return true;

    // Dynamic protected routes
    const watchVideoPattern = /^\/watch\/[^/]+\/video$/;

    return watchVideoPattern.test(path);
  };

  console.log("Auth Status:", {
    isAuthenticated: authStore.isAuthenticated,
    isVerified: authStore.isVerified,
    targetPath: to.path,
    isPublicRoute: isPublicRoute(to.path),
    isProtectedRoute: isProtectedRoute(to.path),
  });

  // If user is authenticated but not verified, redirect to OTP page
  // except if they're already on the OTP page or on a public route
  if (
    authStore.isAuthenticated &&
    !authStore.isVerified &&
    !isPublicRoute(to.path) &&
    to.path !== "/otp"
  ) {
    console.log("🔄 Redirecting unverified user to OTP page");
    return navigateTo("/otp");
  }

  // If trying to access a protected route and not authenticated
  if (isProtectedRoute(to.path) && !authStore.isAuthenticated) {
    console.log("🔄 Redirecting unauthenticated user from protected route");
    return navigateTo("/login");
  }

  // If authenticated and verified user tries to access auth pages
  if (
    authStore.isAuthenticated &&
    authStore.isVerified &&
    (to.path === "/login" || to.path === "/signup" || to.path === "/otp")
  ) {
    console.log("🔄 Redirecting authenticated user to watch");
    return navigateTo("/watch");
  }

  console.log("✅ Allowing navigation to:", to.path);
});
