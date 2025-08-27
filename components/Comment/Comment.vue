<template>
  <section
    class="flex flex-col text-white items-center gap-6 sm:gap-8 mt-16 sm:mt-20 md:mt-28 px-4 sm:px-6 md:px-12 lg:px-[104px]"
  >
    <div class="flex flex-col sm:flex-row justify-between w-full gap-4 sm:gap-0">
      <div class="gap-2 flex items-center justify-center sm:justify-start">
        <IconsCommenticon />
        <div class="flex items-center gap-2">
          <p class="text-base sm:text-lg font-bold text-gray-300">Comments</p>
          <p class="text-sm text-gray-500">28 Comments</p>
        </div>
      </div>

      <div class="flex gap-3">
        <!-- <button class="bg-gold h-13 rounded-[20px] w-37 justify-center items-center flex px-5 text-black btn gap-3 ">
        <p>Add Review</p>
        <IconsAdd/>
      </button>
      <button class="bg-[#1A1A1ACC] h-13 rounded-[20px] w-37 justify-center items-center flex px-5 btn gap-3">
        <p>Latest</p>
        <IconsDown color="#ffffff"/>
      </button> -->

      <div class="flex flex-row gap-3 justify-center sm:justify-end">
        <button
          v-if="isAuthenticated"
          class="bg-gold hover:bg-[#CE8F00] text-black h-10 sm:h-12 px-4 sm:px-10 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-medium transition-all duration-300 text-sm sm:text-base"
          @click="modal.toggleReview"
        >
          <p>Add Review</p>
          <img
            src="../../assets/icons/plus.svg"
            alt="Add"
            class="w-4 h-4 sm:w-5 sm:h-5 brightness-0"
          />
        </button>
        <!-- <button
          v-else
          @click="navigateToLogin"
          class="bg-gold hover:bg-[#CE8F00] text-black h-12 px-10 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all duration-300"
        >
          <p>Sign in to add review</p>
          <img
            src="../../assets/icons/plus.svg"
            alt="Add"
            class="w-5 h-5 brightness-0"
          />
        </button> -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="bg-[#1A1A1ACC] hover:bg-[#2A2A2ACC] text-white h-10 sm:h-12 px-4 sm:px-10 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-medium transition-all duration-300 text-sm sm:text-base"
          >
            <p>{{ selectedOption }}</p>
            <img
              src="../../assets/icons/chevron.svg"
              alt="Latest"
              class="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300"
              :class="isDropdownOpen ? 'rotate-180' : ''"
            />
          </button>
          <div
            v-show="isDropdownOpen"
            class="absolute top-full left-0 mt-2 w-full bg-[#1A1A1ACC] rounded-2xl border border-gray-700 z-10"
          >
            <button
              @click="selectOption('Latest')"
              class="w-full px-4 py-3 text-left text-white hover:bg-[#2A2A2ACC] transition-colors duration-200 rounded-t-2xl text-sm sm:text-base"
              :class="selectedOption === 'Latest' ? 'bg-[#2A2A2ACC]' : ''"
            >
              Latest
            </button>
            <button
              @click="selectOption('Earliest')"
              class="w-full px-4 py-3 text-left text-white hover:bg-[#2A2A2ACC] transition-colors duration-200 rounded-b-2xl text-sm sm:text-base"
              :class="selectedOption === 'Earliest' ? 'bg-[#2A2A2ACC]' : ''"
            >
              Earliest
            </button>
          </div>
        </div>
</div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
      <CommentCard v-for="i in 4" :key="i" ratings="4" />
    </div>

    <button class="flex bg-gold text-black w-41 rounded-[10px] justify-center h-11  items-center px-5 gap-3 btn "><p>See More </p><IconsDown/></button>
    <!-- <button
      class="flex bg-gold text-black w-full sm:w-auto max-w-xs rounded-[10px] justify-center h-10 sm:h-11 items-center px-5 btn text-sm sm:text-base"
    >
      See More <IconsDown />
    </button> -->

  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useModal } from "#imports";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const modal = useModal()

const isDropdownOpen = ref(false);
const selectedOption = ref("Latest");

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectOption = (option) => {
  selectedOption.value = option;
  isDropdownOpen.value = false;
};

const navigateToLogin = () => {
  navigateTo("/login");
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