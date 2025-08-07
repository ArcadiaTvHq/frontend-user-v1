import { useLoadingStore } from "~/stores/loading";

export const useComponentLoading = (componentId: string) => {
  const loadingStore = useLoadingStore();

  const startLoading = () => {
    loadingStore.addLoadingComponent(componentId);
  };

  const stopLoading = () => {
    loadingStore.removeLoadingComponent(componentId);
  };

  const isLoading = computed(() => {
    return loadingStore.loadingComponents.has(componentId);
  });

  // Auto-cleanup on unmount
  onUnmounted(() => {
    loadingStore.removeLoadingComponent(componentId);
  });

  return {
    startLoading,
    stopLoading,
    isLoading,
  };
};
