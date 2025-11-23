import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // Prevent full app remounts when navigating between dynamic routes
  // This plugin ensures that Suspense doesn't cause remounts

  if (process.client) {
    const router = nuxtApp.$router;

    if (router) {
      // Store original route matching to prevent remounts
      const originalResolve = router.resolve;

      // Override resolve to ensure same-component routes don't remount
      router.resolve = function(to: any) {
        const resolved = originalResolve.call(this, to);

        // If navigating to the same route pattern (e.g., /watch/[slug] to /watch/[slug]),
        // ensure the component is treated as the same instance
        if (resolved.matched && resolved.matched.length > 0) {
          const matched = resolved.matched[resolved.matched.length - 1];

          // Mark the route as keepalive to prevent remounts
          if (matched.meta && typeof matched.meta.keepalive === 'undefined') {
            matched.meta.keepalive = true;
          }
        }

        return resolved;
      };

      // Log in dev mode to help debug
      if (process.dev) {
        router.afterEach((to, from) => {
          // Check if both routes use the same component
          const toMatched = to.matched[to.matched.length - 1];
          const fromMatched = from.matched[from.matched.length - 1];

          if (toMatched && fromMatched && toMatched.components?.default === fromMatched.components?.default) {
            console.log('[SPA] Same component route - should not remount:', from.path, '->', to.path);
          }
        });
      }
    }
  }
});
