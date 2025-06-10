import { useLoadingStore } from "~/stores/loading";

export default defineNuxtRouteMiddleware((to) => {
  // Only handle loading for content pages
  if (to.path.startsWith("/watch/") && to.params.slug) {
    const loadingStore = useLoadingStore();
    loadingStore.startLoading();
  }
});
