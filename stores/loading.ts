import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref(true);

  function startLoading() {
    isLoading.value = true;
  }

  function stopLoading() {
    isLoading.value = false;
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
});
