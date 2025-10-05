<template>
  <div class="px-4 sm:px-9 md:px-28 mb-8">
    <!-- Filter Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div
          class="p-2 bg-gradient-to-r from-[#FFD005] to-[#FFA000] rounded-lg"
        >
          <svg
            class="w-5 h-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
            ></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white">Filters</h3>
        <span
          v-if="filtersStore.hasActiveFilters"
          class="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold"
        >
          {{ filtersStore.activeFiltersCount }} active
        </span>
      </div>

      <button
        v-if="filtersStore.hasActiveFilters"
        @click="clearAllFilters"
        class="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-800"
      >
        <svg
          class="w-4 h-4 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
        <span class="text-sm font-medium">Clear All</span>
      </button>
    </div>

    <div class="flex flex-wrap gap-4">
      <!-- Genre Filter -->
      <div class="relative">
        <button
          class="group bg-gradient-to-r from-[#FFD005] to-[#FFA000] hover:from-[#CE8F00] hover:to-[#B8860B] text-black px-6 py-4 rounded-2xl flex items-center gap-4 font-semibold transition-all duration-300 text-sm relative shadow-lg hover:shadow-2xl transform hover:scale-105 min-w-[180px]"
          @click="toggleGenreDropdown"
        >
          <div class="p-2 bg-white/30 rounded-xl">
            <genre />
          </div>
          <div class="flex flex-col items-start">
            <span class="font-bold">Genre</span>
            <span
              v-if="filtersStore.genres.length > 0"
              class="text-xs text-gray-700"
            >
              {{ filtersStore.genres.length }} selected
            </span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <span
              v-if="filtersStore.genres.length > 0"
              class="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
            >
              {{ filtersStore.genres.length }}
            </span>
            <svg
              class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              :class="{ 'rotate-180': showGenreDropdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </button>

        <!-- Genre Dropdown -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-[-20px]"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-[-20px]"
        >
          <div
            v-show="showGenreDropdown"
            class="absolute top-full left-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl z-50 border border-gray-100 overflow-hidden backdrop-blur-sm"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-[#FFD005] rounded-lg">
                    <genre />
                  </div>
                  <div>
                    <h4 class="text-lg font-bold text-gray-800">
                      Select Genres
                    </h4>
                    <p class="text-sm text-gray-600">
                      {{ filtersStore.genres.length }} of
                      {{ filtersStore.availableGenres.length }} selected
                    </p>
                  </div>
                </div>
                <button
                  @click="filtersStore.setGenres([])"
                  class="text-sm text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  Clear All
                </button>
              </div>
            </div>

            <!-- Genre List -->
            <div class="max-h-80 overflow-y-auto p-4">
              <div class="grid grid-cols-2 gap-3">
                <label
                  v-for="genre in filtersStore.availableGenres"
                  :key="genre.value"
                  class="group flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-md"
                >
                  <div class="relative">
                    <input
                      type="checkbox"
                      :value="genre.value"
                      :checked="filtersStore.genres.includes(genre.value)"
                      @change="toggleGenre(genre.value)"
                      class="sr-only"
                    />
                    <div
                      class="w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center shadow-sm"
                      :class="
                        filtersStore.genres.includes(genre.value)
                          ? 'bg-gradient-to-r from-[#FFD005] to-[#FFA000] border-[#FFD005] shadow-lg scale-110'
                          : 'border-gray-300 group-hover:border-gray-400 group-hover:scale-105'
                      "
                    >
                      <svg
                        v-if="filtersStore.genres.includes(genre.value)"
                        class="w-4 h-4 text-black animate-pulse"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <span
                    class="text-sm text-gray-700 font-semibold group-hover:text-gray-900 transition-colors"
                    >{{ genre.label }}</span
                  >
                </label>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Release Year Filter -->
      <div class="relative">
        <button
          class="group bg-gradient-to-r from-[#FFD005] to-[#FFA000] hover:from-[#CE8F00] hover:to-[#B8860B] text-black px-6 py-4 rounded-2xl flex items-center gap-4 font-semibold transition-all duration-300 text-sm relative shadow-lg hover:shadow-2xl transform hover:scale-105 min-w-[200px]"
          @click="toggleYearDropdown"
        >
          <div class="p-2 bg-white/30 rounded-xl">
            <releaseYear />
          </div>
          <div class="flex flex-col items-start">
            <span class="font-bold">Release Year</span>
            <span
              v-if="filtersStore.releasedAfter || filtersStore.releasedBefore"
              class="text-xs text-gray-700"
            >
              {{ getYearRangeText() }}
            </span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <span
              v-if="filtersStore.releasedAfter || filtersStore.releasedBefore"
              class="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
            >
              1
            </span>
            <svg
              class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              :class="{ 'rotate-180': showYearDropdown }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </button>

        <!-- Year Dropdown -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-[-20px]"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-[-20px]"
        >
          <div
            v-show="showYearDropdown"
            class="absolute top-full left-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl z-50 border border-gray-100 overflow-hidden backdrop-blur-sm"
          >
            <!-- Header -->
            <div
              class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-[#FFD005] rounded-lg">
                    <releaseYear />
                  </div>
                  <div>
                    <h4 class="text-lg font-bold text-gray-800">
                      Release Year Range
                    </h4>
                    <p class="text-sm text-gray-600">Filter by year range</p>
                  </div>
                </div>
                <button
                  @click="clearYearFilters"
                  class="text-sm text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  Clear
                </button>
              </div>
            </div>

            <!-- Year Selectors -->
            <div class="p-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700"
                    >From Year</label
                  >
                  <div class="relative">
                    <select
                      v-model="selectedFromYear"
                      @change="updateYearFilters"
                      class="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFD005] focus:border-[#FFD005] transition-all duration-200 appearance-none bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="">Any year</option>
                      <option
                        v-for="year in filtersStore.availableYears"
                        :key="year.value"
                        :value="year.value"
                      >
                        {{ year.label }}
                      </option>
                    </select>
                    <div
                      class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                    >
                      <svg
                        class="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700"
                    >To Year</label
                  >
                  <div class="relative">
                    <select
                      v-model="selectedToYear"
                      @change="updateYearFilters"
                      class="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFD005] focus:border-[#FFD005] transition-all duration-200 appearance-none bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="">Any year</option>
                      <option
                        v-for="year in filtersStore.availableYears"
                        :key="year.value"
                        :value="year.value"
                      >
                        {{ year.label }}
                      </option>
                    </select>
                    <div
                      class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                    >
                      <svg
                        class="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Sort Filter -->
      <!-- <div class="relative">
        <button
          class="group bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] text-white px-6 py-4 rounded-2xl flex items-center gap-4 font-semibold transition-all duration-300 text-sm relative shadow-lg hover:shadow-2xl transform hover:scale-105 min-w-[140px]"
          @click="handleFilterClick('sort')"
        >
          <div class="p-2 bg-white/20 rounded-xl">
            <img
              src="@/assets/icons/sort.svg"
              class="w-5 h-5 brightness-0 invert"
            />
          </div>
          <div class="flex flex-col items-start">
            <span class="font-bold">Sort</span>
            <span class="text-xs text-gray-200">Options</span>
          </div>
          <div class="ml-auto">
            <svg
              class="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </button>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import ContentTypeicon from "~/components/icons/contentTypeicon.vue";
import sort from "~/components/icons/sort.vue";
import releaseYear from "~/components/icons/releaseYear.vue";
import genre from "~/components/icons/genre.vue";
import { ref, watch, onMounted, onUnmounted } from "vue";

// Emit events for parent components to handle
const emit = defineEmits(["filter-click", "filters-changed"]);

// Store
const filtersStore = useFiltersStore();

// Dropdown states
const showGenreDropdown = ref(false);
const showYearDropdown = ref(false);

// Year filter states
const selectedFromYear = ref("");
const selectedToYear = ref("");

// Handle filter button clicks
const handleFilterClick = (filterType) => {
  emit("filter-click", filterType);
};

// Genre filter functions
const toggleGenreDropdown = () => {
  showGenreDropdown.value = !showGenreDropdown.value;
  showYearDropdown.value = false;
};

const toggleGenre = (genreValue) => {
  const currentGenres = [...filtersStore.genres];
  const index = currentGenres.indexOf(genreValue);

  if (index > -1) {
    currentGenres.splice(index, 1);
  } else {
    currentGenres.push(genreValue);
  }

  filtersStore.setGenres(currentGenres);
  emitFiltersChanged();
};

// Year filter functions
const toggleYearDropdown = () => {
  showYearDropdown.value = !showYearDropdown.value;
  showGenreDropdown.value = false;
};

const updateYearFilters = () => {
  filtersStore.setReleasedAfter(
    selectedFromYear.value ? new Date(selectedFromYear.value, 0, 1) : undefined
  );
  filtersStore.setReleasedBefore(
    selectedToYear.value ? new Date(selectedToYear.value, 11, 31) : undefined
  );
  emitFiltersChanged();
};

const clearYearFilters = () => {
  selectedFromYear.value = "";
  selectedToYear.value = "";
  filtersStore.setReleasedAfter(undefined);
  filtersStore.setReleasedBefore(undefined);
  emitFiltersChanged();
};

// Get year range text for display
const getYearRangeText = () => {
  if (filtersStore.releasedAfter && filtersStore.releasedBefore) {
    return `${filtersStore.releasedAfter.getFullYear()} - ${filtersStore.releasedBefore.getFullYear()}`;
  } else if (filtersStore.releasedAfter) {
    return `From ${filtersStore.releasedAfter.getFullYear()}`;
  } else if (filtersStore.releasedBefore) {
    return `Until ${filtersStore.releasedBefore.getFullYear()}`;
  }
  return "";
};

// Clear all filters
const clearAllFilters = () => {
  filtersStore.clearFilters();
  selectedFromYear.value = "";
  selectedToYear.value = "";
  emitFiltersChanged();
};

// Emit filters changed event
const emitFiltersChanged = () => {
  filtersStore.updateURL();
  emit("filters-changed", filtersStore.getFilterParams());
};

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  const target = event.target;
  if (!target.closest(".relative")) {
    showGenreDropdown.value = false;
    showYearDropdown.value = false;
  }
};

// Initialize year values from store
const initializeYearValues = () => {
  if (filtersStore.releasedAfter) {
    selectedFromYear.value = filtersStore.releasedAfter
      .getFullYear()
      .toString();
  }
  if (filtersStore.releasedBefore) {
    selectedToYear.value = filtersStore.releasedBefore.getFullYear().toString();
  }
};

// Watch for URL changes
watch(
  () => filtersStore.releasedAfter,
  () => {
    initializeYearValues();
  }
);

watch(
  () => filtersStore.releasedBefore,
  () => {
    initializeYearValues();
  }
);

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  filtersStore.syncWithURL();
  initializeYearValues();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>