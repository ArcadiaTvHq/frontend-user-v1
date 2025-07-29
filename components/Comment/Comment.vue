<template>
  <section class="flex flex-col text-white items-center gap-8 mt-28 px-[104px]">
    <div class="flex justify-between w-full">
      <div class="gap-2 flex">
        <IconsCommenticon />
        <p>Comments</p>
      </div>
      <div class="flex gap-3">
        <button
          class="bg-gold hover:bg-[#CE8F00] text-black h-12 px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300"
        >
          <p>Add Review</p>
          <img
            src="../../assets/icons/plus.svg"
            alt="Add"
            class="w-5 h-5 brightness-0"
          />
        </button>
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="bg-[#1A1A1ACC] hover:bg-[#2A2A2ACC] text-white h-12 px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300"
          >
            <p>{{ selectedOption }}</p>
            <img
              src="../../assets/icons/chevron.svg"
              alt="Latest"
              class="w-5 h-5 transition-transform duration-300"
              :class="isDropdownOpen ? 'rotate-180' : ''"
            />
          </button>
          <div
            v-show="isDropdownOpen"
            class="absolute top-full left-0 mt-2 w-full bg-[#1A1A1ACC] rounded-2xl border border-gray-700 z-10"
          >
            <button
              @click="selectOption('Latest')"
              class="w-full px-4 py-3 text-left text-white hover:bg-[#2A2A2ACC] transition-colors duration-200 rounded-t-2xl"
              :class="selectedOption === 'Latest' ? 'bg-[#2A2A2ACC]' : ''"
            >
              Latest
            </button>
            <button
              @click="selectOption('Earliest')"
              class="w-full px-4 py-3 text-left text-white hover:bg-[#2A2A2ACC] transition-colors duration-200 rounded-b-2xl"
              :class="selectedOption === 'Earliest' ? 'bg-[#2A2A2ACC]' : ''"
            >
              Earliest
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5">
      <CommentCard v-for="i in 4" :key="i" ratings="4" />
    </div>
    <button
      class="flex bg-gold text-black w-41 rounded-[10px] justify-center h-11 items-center px-5 btn"
    >
      See More <IconsDown />
    </button>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isDropdownOpen = ref(false);
const selectedOption = ref("Latest");

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectOption = (option) => {
  selectedOption.value = option;
  isDropdownOpen.value = false;
};

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener("click", (event) => {
    const dropdown = event.target.closest(".relative");
    if (!dropdown) {
      isDropdownOpen.value = false;
    }
  });
});
</script>