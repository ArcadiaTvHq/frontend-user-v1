// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false }, // Disable in production
  css: ["~/assets/css/main.css"],

  // Optimize build
  build: {
    transpile: ["pinia-plugin-persistedstate"],
  },

  // Optimize Vite
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router"],
            video: ["hls.js"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia"],
    },
  },

  plugins: [{ src: "~/plugins/Lenis.client.js", mode: "client" }],

  app: {
    head: {
      title: "Arcadia",
      script: [
        {
          src: "https://embed.videodelivery.net/embed/sdk.latest.js",
          defer: true,
          async: true, // Load asynchronously
        },
      ],
    },
    pageTransition: false,
    layoutTransition: false,
  },

  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
    },
  },

  modules: ["@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt"],

  devServer: {
    port: 5000,
    host: "0.0.0.0",
  },

  nitro: {
    devProxy: {
      "/api": {
        target:
          process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
        changeOrigin: true,
      },
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  imports: {
    dirs: ["stores"],
  },

  piniaPersistedstate: {
    storage: "localStorage",
    debug: false, // Disable debug in production
  },
});
