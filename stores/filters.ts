import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { EContentType } from "~/src/types/content";

export interface FilterState {
  genres: string[];
  releasedAfter?: Date;
  releasedBefore?: Date;
  types?: EContentType[];
}

export interface GenreOption {
  value: string;
  label: string;
}

export interface YearOption {
  value: number;
  label: string;
}

export const useFiltersStore = defineStore("filters", () => {
  // Filter state
  const genres = ref<string[]>([]);
  const releasedAfter = ref<Date | undefined>(undefined);
  const releasedBefore = ref<Date | undefined>(undefined);
  const types = ref<EContentType[]>([]);

  // Available options
  const availableGenres = ref<GenreOption[]>([
    { value: "Action", label: "Action" },
    { value: "Adventure", label: "Adventure" },
    { value: "Animation", label: "Animation" },
    { value: "Comedy", label: "Comedy" },
    { value: "Crime", label: "Crime" },
    { value: "Documentary", label: "Documentary" },
    { value: "Drama", label: "Drama" },
    { value: "Family", label: "Family" },
    { value: "Fantasy", label: "Fantasy" },
    { value: "History", label: "History" },
    { value: "Horror", label: "Horror" },
    { value: "Music", label: "Music" },
    { value: "Mystery", label: "Mystery" },
    { value: "Romance", label: "Romance" },
    { value: "Science Fiction", label: "Science Fiction" },
    { value: "Thriller", label: "Thriller" },
    { value: "War", label: "War" },
    { value: "Western", label: "Western" },
  ]);

  const availableYears = ref<YearOption[]>(() => {
    const currentYear = new Date().getFullYear();
    const years: YearOption[] = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push({ value: year, label: year.toString() });
    }
    return years;
  });

  const availableTypes = ref<{ value: EContentType; label: string }[]>([
    { value: "movie", label: "Movie" },
    { value: "series", label: "TV Show" },
  ]);

  // Computed properties
  const hasActiveFilters = computed(() => {
    return (
      genres.value.length > 0 ||
      releasedAfter.value ||
      releasedBefore.value ||
      types.value.length > 0
    );
  });

  const activeFiltersCount = computed(() => {
    let count = 0;
    if (genres.value.length > 0) count++;
    if (releasedAfter.value) count++;
    if (releasedBefore.value) count++;
    if (types.value.length > 0) count++;
    return count;
  });

  // Actions
  function setGenres(selectedGenres: string[]) {
    genres.value = selectedGenres;
  }

  function setReleasedAfter(date: Date | undefined) {
    releasedAfter.value = date;
  }

  function setReleasedBefore(date: Date | undefined) {
    releasedBefore.value = date;
  }

  function setTypes(selectedTypes: EContentType[]) {
    types.value = selectedTypes;
  }

  function clearFilters() {
    genres.value = [];
    releasedAfter.value = undefined;
    releasedBefore.value = undefined;
    types.value = [];
  }

  function getFilterParams() {
    const params: any = {};

    if (genres.value.length > 0) {
      params.genres = genres.value;
    }

    if (releasedAfter.value) {
      params.released_after = releasedAfter.value.toISOString();
    }

    if (releasedBefore.value) {
      params.released_before = releasedBefore.value.toISOString();
    }

    if (types.value.length > 0) {
      params.types = types.value;
    }

    return params;
  }

  // URL sync functions
  function syncWithURL() {
    const route = useRoute();
    const router = useRouter();

    // Update filters from URL params
    if (route.query.genres) {
      const urlGenres = Array.isArray(route.query.genres)
        ? (route.query.genres as string[])
        : [route.query.genres as string];
      genres.value = urlGenres;
    }

    if (route.query.released_after) {
      releasedAfter.value = new Date(route.query.released_after as string);
    }

    if (route.query.released_before) {
      releasedBefore.value = new Date(route.query.released_before as string);
    }

    if (route.query.types) {
      const urlTypes = Array.isArray(route.query.types)
        ? (route.query.types as EContentType[])
        : [route.query.types as EContentType];
      types.value = urlTypes;
    }
  }

  function updateURL() {
    const router = useRouter();
    const currentQuery = { ...router.currentRoute.value.query };

    // Clear existing filter params
    delete currentQuery.genres;
    delete currentQuery.released_after;
    delete currentQuery.released_before;
    delete currentQuery.types;

    // Add new filter params
    const filterParams = getFilterParams();
    const newQuery = { ...currentQuery, ...filterParams };

    router.replace({ query: newQuery });
  }

  return {
    // State
    genres,
    releasedAfter,
    releasedBefore,
    types,
    availableGenres,
    availableYears,
    availableTypes,

    // Computed
    hasActiveFilters,
    activeFiltersCount,

    // Actions
    setGenres,
    setReleasedAfter,
    setReleasedBefore,
    setTypes,
    clearFilters,
    getFilterParams,
    syncWithURL,
    updateURL,
  };
});
