<script setup>
import { PUBLIC_ROUTES } from "~/constants/routes";

const route = useRoute();
const isPublicRoute = computed(() => {
  return PUBLIC_ROUTES.some((routePattern) => {
    // If the route pattern is a RegExp
    if (routePattern instanceof RegExp) {
      return routePattern.test(route.path);
    }
    // If it's a string (exact match)
    return routePattern === route.path;
  });
});

const Links = [
  { name: "HOME", pathname: "/watch" },
  { name: "TV SHOW", pathname: "/tv-show" },
  { name: "MOVIES", pathname: "/movies" },
  { name: "NEW", pathname: "/new" },
];

const isActiveRoute = (pathname) => {
  return route.path === pathname;
};

const mobileMenuOpen = ref(false);
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>
<template>
  <nav
    class="bg-cod border-b-[0.22px] h-[60px] sm:h-[75px] md:h-[92px] flex items-center border-gold px-4 sm:px-6 md:px-8 lg:px-14 font-orbitron justify-between fixed w-full top-0 z-50"
  >
    <nuxt-link to="/" class="flex items-center">
      <img
        class="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[206px]"
        src="../../assets/arcadia.png"
        alt="Arcadia Logo"
      />
    </nuxt-link>

    <!-- Protected route content -->
    <template v-if="!isPublicRoute">
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
          v-for="(i, index) in Links"
          :key="index"
          :to="i.pathname"
          class="text-sm lg:text-base font-bold text-white hover:text-[#FFD005] transition-colors px-2 relative"
        >
          {{ i.name }}
          <div
            v-if="isActiveRoute(i.pathname)"
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
            />
            <img
              src="../../assets/icons/search.svg"
              alt="Search"
              class="w-5 h-5 flex-shrink-0 group-hover:opacity-70"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="relative hover:opacity-80 transition-opacity">
            <img
              src="../../assets/icons/notification.svg"
              alt="Notifications"
              class="w-6 h-6"
            />
          </button>
          <button class="hover:opacity-80 transition-opacity">
            <img
              src="../../assets/images/avatar.png"
              class="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
            />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="mobileMenuOpen"
        class="absolute top-full left-0 right-0 bg-cod py-4 md:hidden"
      >
        <div class="flex flex-col px-4 gap-6">
          <nuxt-link
            v-for="(i, index) in Links"
            :key="index"
            :to="i.pathname"
            class="text-sm font-bold text-white hover:text-[#FFD005] transition-colors relative"
          >
            {{ i.name }}
            <div
              v-if="isActiveRoute(i.pathname)"
              class="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FFD005]"
            ></div>
          </nuxt-link>

          <div class="relative">
            <div
              class="flex border border-[#FFD005] group rounded-full h-11 px-4 items-center w-full transition-colors duration-300"
            >
              <input
                placeholder="Search"
                class="text-white w-full bg-transparent outline-none text-sm placeholder-white/50"
              />
              <img
                src="../../assets/icons/search.svg"
                alt="Search"
                class="w-5 h-5 flex-shrink-0 group-hover:opacity-70"
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
            <button class="hover:opacity-80 transition-opacity">
              <img
                src="../../assets/images/avatar.png"
                class="w-10 h-10 rounded-full object-cover"
                alt="User avatar"
              />
            </button>
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