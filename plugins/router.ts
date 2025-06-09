import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:start", () => {
    // You can show a loading bar or transition here
    console.log("Page navigation started");
  });

  nuxtApp.hook("page:finish", () => {
    // Hide loading bar or complete transition
    console.log("Page navigation finished");
  });

  nuxtApp.hook("app:error", (error) => {
    // Handle route errors
    console.error("Navigation error:", error);
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
