// Declare global loading type
declare global {
  interface Window {
    __nuxt_loading: { value: boolean };
  }
}

import { useAuthStore } from "~/stores/auth";
import { defineNuxtRouteMiddleware, navigateTo, abortNavigation } from "#app";

export default defineNuxtRouteMiddleware(async (to) => {
  // Show loader at start of navigation
  if (process.client && window.__nuxt_loading) {
    window.__nuxt_loading.value = true;
  }

  // Ignore special routes and DevTools requests
  if (to.path.startsWith("/.well-known/") || to.path.startsWith("/__nuxt")) {
    return;
  }

  console.log("🔒 Auth Middleware Running");

  const authStore = useAuthStore();
  const publicRoutes = ["/login", "/signup", "/otp"];
  const protectedRoutes = ["/watch", "/watch/*/video"];

  // Helper to check if a path matches any of the protected routes patterns
  const isProtectedRoute = (path: string): boolean => {
    return protectedRoutes.some((pattern) => {
      // Convert route pattern to regex
      const regexPattern = pattern
        .replace(/\*/g, "[^/]+") // Replace * with non-slash characters
        .replace(/\//g, "\\/"); // Escape forward slashes
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(path);
    });
  };

  console.log("Auth Status:", {
    isAuthenticated: authStore.isAuthenticated,
    isVerified: authStore.isVerified,
    targetPath: to.path,
    isPublicRoute: publicRoutes.includes(to.path),
    isProtectedRoute: isProtectedRoute(to.path),
  });

  // If user is authenticated but not verified, redirect to OTP page
  if (
    authStore.isAuthenticated &&
    !authStore.isVerified &&
    !publicRoutes.includes(to.path) &&
    to.path !== "/otp"
  ) {
    console.log("🔄 Redirecting unverified user to OTP page");
    return navigateTo("/otp", { replace: true });
  }

  // If trying to access a protected route and not authenticated
  if (isProtectedRoute(to.path) && !authStore.isAuthenticated) {
    console.log("🔄 Redirecting unauthenticated user from protected route");
    return navigateTo("/login", { replace: true });
  }

  // If authenticated and verified user tries to access auth pages or index
  if (
    authStore.isAuthenticated &&
    authStore.isVerified &&
    (to.path === "/" ||
      to.path === "/login" ||
      to.path === "/signup" ||
      to.path === "/otp")
  ) {
    console.log("🔄 Redirecting authenticated user to watch");
    return navigateTo("/watch", { replace: true });
  }

  // Hide loader after navigation is complete
  if (process.client && window.__nuxt_loading) {
    setTimeout(() => {
      window.__nuxt_loading.value = false;
    }, 0);
  }

  console.log("✅ Allowing navigation to:", to.path);
});
