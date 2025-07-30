import { useLoadingStore } from "~/stores/loading";

export default defineNuxtRouteMiddleware((to, from) => {
  const loadingStore = useLoadingStore();

  // Start route loading for content pages only when navigating from another page
  if (
    to.path.startsWith("/watch/") &&
    to.params.slug &&
    from.path !== to.path
  ) {
    loadingStore.startRouteLoading();

    // Fallback timeout to prevent infinite loading
    setTimeout(() => {
      loadingStore.stopRouteLoading();
    }, 8000); // 8 second fallback
  }

  // For admin pages
  if (to.path.startsWith("/admin/") && from.path !== to.path) {
    loadingStore.startRouteLoading();

    // Fallback timeout for admin pages too
    setTimeout(() => {
      loadingStore.stopRouteLoading();
    }, 5000); // 5 second fallback for admin
  }
});
