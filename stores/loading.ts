import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref(true);
  const loadingComponents = ref(new Set<string>());
  const routeLoading = ref(false);

  // Check if any components are still loading
  const hasLoadingComponents = computed(() => loadingComponents.value.size > 0);

  // Overall loading state (initial load OR route change OR components loading)
  const shouldShowLoader = computed(
    () => isLoading.value || routeLoading.value || hasLoadingComponents.value
  );

  function startLoading() {
    isLoading.value = true;
  }

  function stopLoading() {
    isLoading.value = false;
  }

  function startRouteLoading() {
    routeLoading.value = true;
  }

  function stopRouteLoading() {
    routeLoading.value = false;
  }

  function addLoadingComponent(componentId: string) {
    loadingComponents.value.add(componentId);
  }

  function removeLoadingComponent(componentId: string) {
    loadingComponents.value.delete(componentId);
  }

  function clearLoadingComponents() {
    loadingComponents.value.clear();
  }

  return {
    isLoading,
    routeLoading,
    loadingComponents,
    hasLoadingComponents,
    shouldShowLoader,
    startLoading,
    stopLoading,
    startRouteLoading,
    stopRouteLoading,
    addLoadingComponent,
    removeLoadingComponent,
    clearLoadingComponents,
  };
});
