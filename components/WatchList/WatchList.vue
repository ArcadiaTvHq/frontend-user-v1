<template>
  <section class="text-white px-30 flex flex-col">
    <h1 class="font-bold text-[30px] font-inter">WatchList</h1>
    <div class="flex border-b border-1 border-gold gap-3">
      <div v-for="(btn, index) in btns">
        <button
          :id="index"
          @click="(e) => handleclick(e)"
          class="h-15 text-gold border-b-4 border-white"
          v-if="btn.isActive.value == true"
        >
          <p>{{ btn.name }}</p>
        </button>
        <button
          :id="index"
          @click="(e) => handleclick(e)"
          class="h-15"
          v-if="btn.isActive.value == false"
        >
          <p>{{ btn.name }}</p>
        </button>
      </div>
    </div>
    <!-- <div class="grid grid-cols-6 ">
      <div></div>
    </div> -->
  </section>
  <SectionTwo
    title="Search Results"
    iconAlt="Search results icon"
    :showSeeMore="false"
    :fetchContent="true"
    :hideHeader="true"
  />
</template>

<script setup>
import SectionTwo from "../sectionTwo/sectionTwo.vue";

const all = ref(false);
const movies = ref(true);
const series = ref(false);
const recently = ref(false);
const btns = [
  { name: "All", isActive: all },
  { name: "Movies", isActive: movies },
  { name: "Series", isActive: series },
  { name: "Recently Added", isActive: recently },
];

const handleclick = (e) => {
  // Content data loaded
  if (e.target.textContent == "All") {
    all.value = true;
    movies.value = false;
    series.value = false;
    recently.value = false;
  }
  if (e.target.textContent == "Movies") {
    movies.value = true;
    all.value = false;
    series.value = false;
    recently.value = false;
  }
  if (e.target.textContent == "Series") {
    movies.value = false;
    all.value = false;
    series.value = true;
    recently.value = false;
  }
  if (e.target.textContent == "Recently Added") {
    movies.value = false;
    all.value = false;
    series.value = false;
    recently.value = true;
  }
};

const style = "h-15 text-gold border-b border-4 border-white ";
</script>