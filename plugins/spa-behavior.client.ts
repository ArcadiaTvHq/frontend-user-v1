import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // Prevent full app remounts on navigation
  // This plugin ensures SPA behavior is maintained and Pinia stores persist

  if (process.client) {
    // Ensure Pinia instance persists across navigation
    // The @pinia/nuxt module should handle this, but we ensure it here
    const pinia = nuxtApp.$pinia;

    if (pinia) {
      // Mark Pinia as persistent to prevent recreation
      try {
        pinia._persistent = true;
      } catch (e) {
        // Ignore if property assignment fails
      }
    }

    const router = nuxtApp.$router;

    if (router) {
      // Prevent full page reloads by ensuring all navigation is client-side
      const originalPush = router.push;
      const originalReplace = router.replace;

      router.push = function(to: any, ...args: any[]) {
        // Ensure this is always a client-side navigation
        if (typeof to === 'string' && to.startsWith('http')) {
          // External URL - allow default behavior
          return originalPush.call(this, to, ...args);
        }
        // Internal route - ensure client-side navigation
        return originalPush.call(this, to, ...args);
      };

      router.replace = function(to: any, ...args: any[]) {
        if (typeof to === 'string' && to.startsWith('http')) {
          return originalReplace.call(this, to, ...args);
        }
        return originalReplace.call(this, to, ...args);
      };

      // Log navigation to help debug remounts (only in dev)
      if (process.dev) {
        router.afterEach((to, from) => {
          console.log('[SPA] Navigation:', from.path, '->', to.path);
          console.log('[SPA] Pinia instance:', pinia ? 'exists' : 'missing');
          console.log('[SPA] Same component?',
            to.matched[to.matched.length - 1]?.components?.default ===
            from.matched[from.matched.length - 1]?.components?.default
          );
        });
      }
    }
  }
});
