import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref(true);
  const loadingComponents = ref(new Set<string>());
  const routeLoading = ref(false);
  const apiLoading = ref(false);

  // Pages that don't need loading (no API calls)
  const pagesWithoutLoading = [
    "/login",
    "/signup",
    "/otp",
    "/forgot",
    "/waitlist",
  ];

  // Check if any components are still loading
  const hasLoadingComponents = computed(() => loadingComponents.value.size > 0);

  // Check if current route needs loading
  const shouldShowRouteLoading = computed(() => {
    const route = useRoute();
    return !pagesWithoutLoading.includes(route.path);
  });

  // Overall loading state (initial load OR API loading OR components loading)
  const shouldShowLoader = computed(
    () =>
      isLoading.value ||
      (apiLoading.value && shouldShowRouteLoading.value) ||
      hasLoadingComponents.value
  );

  function startLoading() {
    isLoading.value = true;
  }

  function stopLoading() {
    isLoading.value = false;
  }

  function startRouteLoading() {
    if (shouldShowRouteLoading.value) {
      routeLoading.value = true;
    }
  }

  function stopRouteLoading() {
    routeLoading.value = false;
  }

  function startApiLoading() {
    apiLoading.value = true;
  }

  function stopApiLoading() {
    apiLoading.value = false;
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
    apiLoading,
    loadingComponents,
    hasLoadingComponents,
    shouldShowLoader,
    shouldShowRouteLoading,
    pagesWithoutLoading,
    startLoading,
    stopLoading,
    startRouteLoading,
    stopRouteLoading,
    startApiLoading,
    stopApiLoading,
    addLoadingComponent,
    removeLoadingComponent,
    clearLoadingComponents,
  };
});
