import { defineEventHandler, getCookie, sendRedirect } from "h3";

export default defineEventHandler((event) => {
  const publicRoutes = ["/login", "/signup", "/otp"];
  const protectedRoutes = ["/watch"];

  // Get the current path
  const path = event.path || event.req.url || "/";

  // Get auth status from cookies
  const authCookie = getCookie(event, "auth"); // This will contain our auth state
  const isAuthenticated = !!authCookie;

  console.log("🔒 Server Auth Middleware Running:", {
    path,
    isAuthenticated,
    authCookie,
  });

  // Handle redirects based on auth status
  if (isAuthenticated) {
    // Authenticated users shouldn't access public routes or index
    if (path === "/" || publicRoutes.includes(path)) {
      return sendRedirect(event, "/watch");
    }
  } else {
    // Unauthenticated users shouldn't access protected routes
    if (protectedRoutes.includes(path)) {
      return sendRedirect(event, "/login");
    }
  }
});
