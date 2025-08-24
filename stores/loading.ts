import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref(true);
  const apiLoading = ref(false);

  // Pages that don't need loading (no API calls)
  const pagesWithoutLoading = [
    "/login",
    "/signup",
    "/otp",
    "/forgot",
    "/waitlist",
  ];

  // Check if current route needs loading
  const shouldShowRouteLoading = computed(() => {
    const route = useRoute();
    return !pagesWithoutLoading.includes(route.path);
  });

  // Overall loading state - ONLY show for initial app load or actual API activity
  // NOT for route changes or navigation
  const shouldShowLoader = computed(
    () => isLoading.value || (apiLoading.value && shouldShowRouteLoading.value)
  );

  function startLoading() {
    isLoading.value = true;
  }

  function stopLoading() {
    isLoading.value = false;
  }

  function startApiLoading() {
    apiLoading.value = true;
  }

  function stopApiLoading() {
    apiLoading.value = false;
  }

  return {
    isLoading,
    apiLoading,
    shouldShowLoader,
    shouldShowRouteLoading,
    pagesWithoutLoading,
    startLoading,
    stopLoading,
    startApiLoading,
    stopApiLoading,
  };
});
