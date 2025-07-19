export default defineNuxtPlugin((nuxtApp) => {
  const loadingStore = useLoadingStore();

  // Add navigation hooks
  nuxtApp.hook("page:start", () => {
    loadingStore.startLoading();
  });

  nuxtApp.hook("page:finish", () => {
    loadingStore.stopLoading();
  });
});
