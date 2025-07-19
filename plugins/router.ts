import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:start", () => {
    // You can show a loading bar or transition here
  });

  nuxtApp.hook("page:finish", () => {
    // Hide loading bar or complete transition
  });

  nuxtApp.hook("app:error", (error) => {
    // Handle route errors
  });

  // Add any global navigation guards or route utilities here
  return {
    provide: {
      // Provide custom router utilities with a unique name
      routerUtils: {
        goBack: () => {
          return window.history.length > 1
            ? window.history.back()
            : navigateTo("/");
        },
        // Add more custom router methods as needed
      },
    },
  };
});
