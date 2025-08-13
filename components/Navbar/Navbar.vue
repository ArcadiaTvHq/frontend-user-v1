<script setup>
import { useAuthStore } from "~/stores/auth";
import { useContentType } from "~/composables/useContentType";
import { useSearchStore } from "~/stores/search";

const route = useRoute();
const authStore = useAuthStore();
const searchStore = useSearchStore();
const { contentType } = useContentType();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const Links = [
  {
    name: "HOME",
    pathname: "/watch",
    matches: (path) => path === "/watch" || path.startsWith("/watch/"),
  },
  {
    name: "TV SHOW",
    pathname: "/tv-shows",
    matches: (path, type) =>
      path.startsWith("/tv-shows") ||
      (path.startsWith("/watch") && type === "series" && !path.includes("/")),
  },
  {
    name: "MOVIES",
    pathname: "/movies",
    matches: (path, type) =>
      path.startsWith("/movies") ||
      (path.startsWith("/watch") && type === "movie" && !path.includes("/")),
  },
  {
    name: "NEW",
    pathname: "/new",
    matches: (path) => path.startsWith("/new"),
  },
  {
    name:"MY LIST",
    pathname:"/my-list",
    matches: (path) => path.startsWith('/my-list')
  }
];

const isActiveRoute = (link) => {
  if (typeof link === "string") return route.path === link;
  return link.matches
    ? link.matches(route.path, contentType.value)
    : route.path === link.pathname;
};

const handleNavClick = (link) => {
  // If we're on a detail page and clicking HOME, ensure proper navigation
  if (
    link.pathname === "/watch" &&
    route.path.startsWith("/watch/") &&
    route.path !== "/watch"
  ) {
    // Stop any existing loading states
    loadingStore.stopRouteLoading();
    loadingStore.stopLoading();

    // Use router.push for more reliable navigation
    const router = useRouter();
    router.push("/watch");
    return;
  }
};

const mobileMenuOpen = ref(false);
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// Search functionality
const searchTimeout = ref(null);
const searchInput = ref(""); // Add ref for search input

const handleSearch = async (event) => {
  const query = event.target.value;
  searchStore.searchQuery = query;
  searchInput.value = query; // Update local ref

  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Debounce search
  searchTimeout.value = setTimeout(async () => {
    if (query.trim()) {
      await searchStore.performSearch(query);

      // If we're on a content detail page (/watch/slug), redirect to /watch with search
      if (route.path.startsWith("/watch/") && route.path !== "/watch") {
        await navigateTo(`/watch?search=${encodeURIComponent(query)}`);
      } else {
        // Update URL with search parameters
        searchStore.updateURL();
      }
    } else {
      searchStore.clearSearch();

      // If we're on a content detail page, redirect to /watch
      if (route.path.startsWith("/watch/") && route.path !== "/watch") {
        await navigateTo("/watch");
      } else {
        // Update URL to remove search parameters
        searchStore.updateURL();
      }
    }
  }, 300); // 300ms delay
};

// Sync search input with store state when navigating
watch(
  () => searchStore.searchQuery,
  (newQuery) => {
    searchInput.value = newQuery || "";
  },
  { immediate: true }
);

// Watch for route and content type changes to close mobile menu
watch(
  [() => route.path, contentType],
  () => {
    mobileMenuOpen.value = false;
  },
  { flush: "post", immediate: false }
);
</script>
<template>
  <nav
    class="bg-cod border-b-[0.22px] h-[60px] sm:h-[75px] md:h-[92px] flex items-center border-gold px-4 sm:px-6 md:px-8 lg:px-14 font-orbitron justify-between sticky w-full top-0 z-50"
  >
    <nuxt-link to="/" class="flex items-center">
      <img
        class="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[206px]"
        src="../../assets/arcadia.png"
        alt="Arcadia Logo"
      />
    </nuxt-link>

    <!-- Unauthenticated user content -->
    <template v-if="!isAuthenticated">
      <!-- Mobile menu button -->
      <button
        @click="toggleMobileMenu"
        class="md:hidden text-white p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <span class="block w-5 sm:w-6 h-0.5 bg-[#FFD005] mb-1.5"></span>
        <span class="block w-5 sm:w-6 h-0.5 bg-[#FFD005] mb-1.5"></span>
        <span class="block w-5 sm:w-6 h-0.5 bg-[#FFD005]"></span>
      </button>

      <!-- Desktop CTA buttons -->
      <div class="hidden md:flex items-center gap-4">
        <nuxt-link
          to="/signup"
          class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-10 px-6 rounded-2xl flex items-center justify-center font-medium transition-all duration-300"
        >
          Sign Up
        </nuxt-link>
        <nuxt-link
          to="/login"
          class="border-2 border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-10 px-6 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center"
        >
          Log In
        </nuxt-link>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="mobileMenuOpen"
        class="absolute top-full left-0 right-0 bg-cod py-4 md:hidden border-b border-gold"
      >
        <div class="flex flex-col px-4 gap-4">
          <nuxt-link
            to="/signup"
            class="bg-[#FFD005] hover:bg-[#CE8F00] text-black h-12 px-6 rounded-2xl flex items-center justify-center font-medium transition-all duration-300"
          >
            Sign Up
          </nuxt-link>
          <nuxt-link
            to="/login"
            class="border-2 border-[#FFD005] text-white hover:bg-[#CE8F00] hover:border-[#CE8F00] hover:text-black h-12 px-6 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center"
          >
            Log In
          </nuxt-link>
        </div>
      </div>
    </template>

    <!-- Protected route content -->
    <template v-if="isAuthenticated">
      <!-- Mobile menu button -->
      <button
        @click="toggleMobileMenu"
        class="md:hidden text-white p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <span class="block w-5 sm:w-6 h-0.5 bg-[#FFD005] mb-1.5"></span>
        <span class="block w-5 sm:w-6 h-0.5 bg-[#FFD005] mb-1.5"></span>
        <span class="block w-5 sm:w-6 h-0.5 bg-[#FFD005]"></span>
      </button>

      <!-- Desktop menu -->
      <div
        class="hidden md:flex items-center gap-4 lg:gap-8 flex-grow justify-center max-w-2xl"
      >
        <nuxt-link
          v-for="(link, index) in Links"
          :key="index"
          :to="link.pathname"
          class="text-sm lg:text-base font-bold text-white hover:text-[#FFD005] transition-colors px-2 relative"
          @click="handleNavClick(link)"
        >
          {{ link.name }}
          <div
            v-if="isActiveRoute(link)"
            class="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FFD005]"
          ></div>
        </nuxt-link>
      </div>

      <!-- Search and user actions -->
      <div class="hidden md:flex items-center gap-6">
        <div class="relative">
          <div
            class="flex border border-[#FFD005] group rounded-full h-11 px-4 items-center w-full transition-colors duration-300"
          >
            <input
              placeholder="Search"
              class="text-white w-full bg-transparent outline-none text-sm placeholder-white/50"
              @input="handleSearch"
              :value="searchInput"
            />
            <div v-if="searchStore.isSearching" class="flex-shrink-0">
              <div
                class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#FFD005]"
              ></div>
            </div>
            <img
              v-else
              src="@/assets/icons/search.svg"
              alt="Search"
              class="w-5 h-5 flex-shrink-0 group-hover:opacity-70 brightness-0 invert sepia saturate-[1000%] hue-rotate-[0deg] brightness-[1.2]"
              @error="console.log('Search icon failed to load')"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="relative hover:opacity-80 transition-opacity">
            <img
              src="../../assets/icons/notification.svg"
              alt="Notifications"
              class="w-6 h-6 brightness-0 invert sepia saturate-[1000%] hue-rotate-[0deg] brightness-[1.2]"
            />
          </button>
          <nuxt-link to="/profile" class="hover:opacity-80 transition-opacity">
            <img
              src="../../assets/images/avatar.png"
              class="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
            />
          </nuxt-link>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="mobileMenuOpen"
        class="absolute top-full left-0 right-0 bg-cod py-4 md:hidden border-b border-gold"
      >
        <div class="flex flex-col px-4 gap-6">
          <nuxt-link
            v-for="(link, index) in Links"
            :key="index"
            :to="link.pathname"
            class="text-sm font-bold text-white hover:text-[#FFD005] transition-colors relative flex items-center justify-between"
            :class="{ 'text-[#FFD005]': isActiveRoute(link) }"
            @click="handleNavClick(link)"
          >
            {{ link.name }}
            <div
              v-if="isActiveRoute(link)"
              class="w-1.5 h-1.5 rounded-full bg-[#FFD005]"
            ></div>
          </nuxt-link>

          <div class="relative">
            <div
              class="flex border border-[#FFD005] group rounded-full h-11 px-4 items-center w-full transition-colors duration-300"
            >
              <input
                placeholder="Search"
                class="text-white w-full bg-transparent outline-none text-sm placeholder-white/50"
                @input="handleSearch"
                :value="searchInput"
              />
              <div v-if="searchStore.isSearching" class="flex-shrink-0">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#FFD005]"
                ></div>
              </div>
              <img
                v-else
                src="@/assets/icons/search.svg"
                alt="Search"
                class="w-5 h-5 flex-shrink-0 group-hover:opacity-70 brightness-0 invert sepia saturate-[1000%] hue-rotate-[0deg] brightness-[1.2]"
              />
            </div>
          </div>

          <div
            class="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.1)]"
          >
            <button class="relative hover:opacity-80 transition-opacity">
              <img
                src="../../assets/icons/notification.svg"
                alt="Notifications"
                class="w-6 h-6"
              />
            </button>
            <nuxt-link to="/profile" class="hover:opacity-80 transition-opacity">
              <img
                src="../../assets/images/avatar.png"
                class="w-10 h-10 rounded-full object-cover"
                alt="User avatar"
              />
            </nuxt-link>
          </div>
        </div>
      </div>
    </template>
  </nav>
</template>

<style scoped>
.text-link {
  @apply text-white hover:text-[#FFD005] transition-colors;
}

/* Add backdrop blur to mobile menu */
.bg-cod {
  @apply bg-opacity-95 backdrop-blur-sm;
}

/* Search box hover/focus styles */
.group:hover {
  @apply border-[#CE8F00];
}

.group:focus-within {
  @apply border-[#CE8F00];
}
</style>