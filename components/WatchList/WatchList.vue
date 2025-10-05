<template>
  <div>
    <div class="text-white px-30 flex flex-col">
      <h1 class="font-bold text-[30px] font-inter">Watch List</h1>
      <div class="flex border-b border-1 border-gold gap-3">
        <div v-for="(btn, index) in btns" :key="index">
          <button
            :id="index"
            @click="(e) => handleclick(e)"
            class="h-15 text-gold border-b-4 border-white px-4 transition-colors"
            v-if="btn.isActive.value == true"
          >
            <p>{{ btn.name }}</p>
          </button>
          <button
            :id="index"
            @click="(e) => handleclick(e)"
            class="h-15 px-4 hover:text-gold transition-colors"
            v-if="btn.isActive.value == false"
          >
            <p>{{ btn.name }}</p>
          </button>
        </div>
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-500">Loading watchlist...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredContent.length === 0" class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <p class="text-lg">No content in your watchlist</p>
        <p class="text-sm">Add some movies or series to get started!</p>
      </div>
    </div>

    <!-- Content Grid -->
    <div v-else>
      <SectionTwo
        :title="getSectionTitle()"
        iconAlt="Watchlist content icon"
        :content="processedContent"
        :showSeeMore="false"
        :fetchContent="false"
        :hideHeader="true"
      />
    </div>
  </div>
  <!-- <section class="text-white px-30 flex flex-col">
    <h1 class="font-bold text-[30px] font-inter">WatchList</h1>
    <div class="flex border-b border-1 border-gold gap-3">
      <div v-for="(btn, index) in btns" :key="index">
        <button
          :id="index"
          @click="(e) => handleclick(e)"
          class="h-15 text-gold border-b-4 border-white px-4 transition-colors"
          v-if="btn.isActive.value == true"
        >
          <p>{{ btn.name }}</p>
        </button>
        <button
          :id="index"
          @click="(e) => handleclick(e)"
          class="h-15 px-4 hover:text-gold transition-colors"
          v-if="btn.isActive.value == false"
        >
          <p>{{ btn.name }}</p>
        </button>
      </div>
    </div>

    Loading State -->
  <!-- <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-500">Loading watchlist...</div>
    </div> -->

  <!-- Empty State -->
  <!-- <div v-else-if="filteredContent.length === 0" class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <p class="text-lg">No content in your watchlist</p>
        <p class="text-sm">Add some movies or series to get started!</p>
      </div>
    </div> -->

  <!-- Content Grid -->
  <!-- <SectionTwo
      :title="getSectionTitle()"
      iconAlt="Watchlist content icon"
      :content="filteredContent"
      :showSeeMore="false"
      :fetchContent="false"
      :hideHeader="true"
    /> -->
  <!-- </section> -->
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useWatchlistStore } from "~/stores/watchlist";
import { ContentService } from "~/api/services/content.service";
import SectionTwo from "../sectionTwo/sectionTwo.vue";

const watchlistStore = useWatchlistStore();

// State
const all = ref(true);
const movies = ref(false);
const series = ref(false);
const recently = ref(false);
const watchlistContent = ref([]);
const loading = ref(false);

const btns = [
  { name: "All", isActive: all },
  { name: "Movies", isActive: movies },
  { name: "Series", isActive: series },
  { name: "Recently Added", isActive: recently },
];

// Computed properties
const filteredContent = computed(() => {
  if (!watchlistContent.value.length) return [];

  let filtered = [...watchlistContent.value];

  if (movies.value) {
    filtered = filtered.filter((item) => item.type === "movie");
  } else if (series.value) {
    filtered = filtered.filter((item) => item.type === "series");
  } else if (recently.value) {
    // Sort by added date (assuming there's an added_at field)
    filtered = filtered.sort(
      (a, b) =>
        new Date(b.added_at || b.created_at).getTime() -
        new Date(a.added_at || a.created_at).getTime()
    );
    // Show only the 10 most recently added
    filtered = filtered.slice(0, 10);
  }

  return filtered;
});

// Process content to ensure in_watch_list is true for all watchlist items
const processedContent = computed(() => {
  return filteredContent.value.map((content) => ({
    ...content,
    in_watch_list: true, // All items in watchlist should have this set to true
  }));
});

const getSectionTitle = () => {
  if (movies.value) return "Movies in Your List";
  if (series.value) return "Series in Your List";
  if (recently.value) return "Recently Added";
  return "All in Your List";
};

// Methods
const handleclick = (e) => {
  const buttonText = e.target.textContent.trim();

  // Reset all buttons
  all.value = false;
  movies.value = false;
  series.value = false;
  recently.value = false;

  // Set the clicked button as active
  switch (buttonText) {
    case "All":
      all.value = true;
      break;
    case "Movies":
      movies.value = true;
      break;
    case "Series":
      series.value = true;
      break;
    case "Recently Added":
      recently.value = true;
      break;
  }
};

const loadWatchlistContent = async () => {
  loading.value = true;

  try {
    // Use the watchlist store's method to get content with proper in_watch_list flags
    await watchlistStore.fetchWatchlistContent();
    watchlistContent.value = watchlistStore.getWatchlistContentItems;
  } catch (error) {
    console.error("Failed to load watchlist content:", error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadWatchlistContent();
});
</script>