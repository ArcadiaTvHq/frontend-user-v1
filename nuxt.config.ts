// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false }, // Disable in production

  // Performance optimizations
  experimental: {
    payloadExtraction: false, // Disable payload extraction for better performance
    viewTransition: false, // Disable view transitions for better performance
    watcher: "chokidar-granular", // Better file watching
  },

  // Vue configuration
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false,
    },
    propsDestructure: true,
  },

  // Router options to prevent full remounts
  router: {
    options: {
      linkActiveClass: "active-link",
      linkExactActiveClass: "exact-active-link",
      scrollBehavior: () => ({ left: 0, top: 0 }), // Ensure consistent scroll behavior
    },
  },

  css: ["~/assets/css/main.css"],

  // Optimize build
  build: {
    transpile: ["pinia-plugin-persistedstate"],
    analyze: false, // Disable bundle analysis in production
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
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia"],
      exclude: ["@vueuse/core"], // Exclude unused dependencies
    },
    server: {
      hmr: {
        overlay: false, // Disable HMR overlay for better performance
      },
    },
  },

  plugins: [
    { src: "~/plugins/prevent-full-reload.client.ts", mode: "client" },
    { src: "~/plugins/nuxt-link-fix.client.ts", mode: "client" },
    { src: "~/plugins/prevent-remount.client.ts", mode: "client" },
    { src: "~/plugins/spa-behavior.client.ts", mode: "client" },
    { src: "~/plugins/Lenis.client.js", mode: "client" },
    { src: "~/plugins/pinia-persist.client.ts", mode: "client" },
  ],

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
    auto: true, // Auto-persist all stores
  },
});
