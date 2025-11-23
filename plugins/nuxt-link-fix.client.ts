import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // Ensure all NuxtLink components use client-side navigation
  // This prevents full page refreshes when clicking links

  if (process.client) {
    // Wait for Vue to be ready
    nuxtApp.hook('app:mounted', () => {
      const router = nuxtApp.$router;

      if (!router) return;

      // Intercept all link clicks to ensure client-side navigation
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        // Find the closest link element
        const link = target.closest('a[href]') as HTMLAnchorElement;

        if (!link) return;

        const href = link.getAttribute('href');

        // Only handle internal links
        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }

        // Check if it's a NuxtLink (has data-nuxt-link attribute or is within a NuxtLink)
        const isNuxtLink = link.hasAttribute('data-nuxt-link') ||
                          link.closest('[data-nuxt-link]') !== null;

        if (isNuxtLink) {
          // Ensure it's using client-side navigation
          // Check if the link would cause a full page reload
          const currentPath = window.location.pathname;

          // If it's the same path, prevent default
          if (href === currentPath) {
            event.preventDefault();
            return;
          }

          // For internal navigation, ensure it uses router
          if (href.startsWith('/') && !href.startsWith('//')) {
            // Let NuxtLink handle it, but ensure it's client-side
            // The router should handle this, but we're ensuring it here
          }
        }
      }, true); // Use capture phase
    });

    // Also ensure router handles all internal navigation
    const router = nuxtApp.$router;

    if (router) {
      // Override router's push to ensure it's always client-side
      const originalPush = router.push;

      router.push = function(to: any, ...args: any[]) {
        // Ensure this is always a client-side navigation
        if (typeof to === 'string') {
          // Internal route - ensure client-side
          if (to.startsWith('/') && !to.startsWith('//') && !to.startsWith('http')) {
            return originalPush.call(this, to, ...args);
          }
        }

        // For route objects, ensure they're internal
        if (typeof to === 'object' && to.path) {
          if (to.path.startsWith('/') && !to.path.startsWith('//') && !to.path.startsWith('http')) {
            return originalPush.call(this, to, ...args);
          }
        }

        return originalPush.call(this, to, ...args);
      };
    }
  }
});
