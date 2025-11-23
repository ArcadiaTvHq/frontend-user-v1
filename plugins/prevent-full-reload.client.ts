import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // CRITICAL: Prevent full page reloads on navigation
  // This plugin intercepts all navigation attempts and ensures they're client-side

  if (process.client) {
    const router = nuxtApp.$router;

    if (!router) return;

    // Note: window.location methods are read-only and cannot be overridden
    // Instead, we intercept at the link click and router level

    // Intercept all link clicks to ensure client-side navigation
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;

      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip external links, mailto, tel, etc.
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

      // Skip if it's already a NuxtLink (has data-nuxt-link)
      if (link.hasAttribute('data-nuxt-link') || link.closest('[data-nuxt-link]')) {
        // NuxtLink should handle it, but ensure it's not causing a full reload
        return;
      }

      // For internal links, prevent default and use router
      if (href.startsWith('/') || href.startsWith(window.location.origin)) {
        const path = href.startsWith(window.location.origin)
          ? href.replace(window.location.origin, '')
          : href;

        // Check if it's a hash link
        if (path.includes('#') && path.split('#')[0] === window.location.pathname) {
          // Hash navigation - allow default
          return;
        }

        // Prevent default and use router
        event.preventDefault();
        event.stopPropagation();

        console.log('[SPA] Intercepted link click, using router.push:', path);
        router.push(path);
      }
    }, true); // Use capture phase

    // Monitor for full page reloads
    let isNavigating = false;

    router.beforeEach((to, from) => {
      isNavigating = true;

      // Check if this would cause a full reload
      if (to.fullPath !== from.fullPath) {
        console.log('[SPA] Router navigation:', from.path, '->', to.path);
      }
    });

    router.afterEach(() => {
      isNavigating = false;
    });

    // Detect if a full page reload happened
    const navigationType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationType && navigationType.type === 'reload') {
      console.warn('[SPA] Full page reload detected! This should not happen in SPA mode.');
    }

    // Log when page is about to unload (indicates full reload)
    window.addEventListener('beforeunload', (event) => {
      if (isNavigating) {
        // This is expected during navigation
        return;
      }
      console.warn('[SPA] beforeunload event fired - this might indicate a full page reload');
    });
  }
});
