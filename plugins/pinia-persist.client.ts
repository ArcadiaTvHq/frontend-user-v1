import { defineNuxtPlugin } from '#app';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin((nuxtApp) => {
  // Ensure Pinia persists across navigation
  // This plugin runs on client side only and ensures stores don't get recreated
  if (process.client) {
    // Access Pinia instance through nuxtApp.$pinia
    const pinia = nuxtApp.$pinia;

    if (pinia) {
      // Ensure the persistedstate plugin is applied
      // Check if plugin is already installed by looking for it in the plugins array
      const hasPlugin = pinia._p && Array.isArray(pinia._p) &&
        pinia._p.some((plugin: any) =>
          plugin && (plugin === piniaPluginPersistedstate || plugin._p === piniaPluginPersistedstate)
        );

      if (!hasPlugin) {
        pinia.use(piniaPluginPersistedstate);
      }
    }
  }
});
