export default defineNuxtPlugin((nuxtApp) => {
  const loading = ref(false);

  // Provide loading state to components
  nuxtApp.provide("loading", loading);

  // Add navigation hooks
  nuxtApp.hook("page:start", () => {
    loading.value = true;
  });

  nuxtApp.hook("page:finish", () => {
    loading.value = false;
  });

  // Add to vue app for global access
  nuxtApp.vueApp.provide("loading", loading);
});
