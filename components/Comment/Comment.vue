<template>
  <section
    class="flex flex-col text-white items-center gap-6 sm:gap-8 mt-16 sm:mt-20 md:mt-28 px-4 sm:px-6 md:px-12 lg:px-[104px]"
  >
    <div
      class="flex flex-col sm:flex-row justify-between w-full gap-4 sm:gap-0"
    >
      <div class="gap-2 flex items-center justify-center sm:justify-start">
        <IconsCommenticon />
        <div class="flex items-center gap-2">
          <p class="text-base sm:text-lg font-bold text-gray-300">Comments</p>
          <p class="text-sm text-gray-500">
            {{ commentStats.top_level_count }}
            {{ commentStats.top_level_count === 1 ? "Comment" : "Comments" }}
          </p>
        </div>
      </div>

      <div class="flex gap-3">
        <div class="flex flex-row gap-3 justify-center sm:justify-end">
          <!-- Watch to Review Button (when can't comment) -->
          <button
            v-if="!can_comment"
            class="bg-gray-600 text-gray-400 h-10 sm:h-12 px-4 sm:px-10 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-medium transition-all duration-300 text-sm sm:text-base cursor-not-allowed"
            disabled
          >
            <p>Watch to Review</p>
            <img
              src="../../assets/icons/plus.svg"
              alt="Add"
              class="w-4 h-4 sm:w-5 sm:h-5 brightness-0 opacity-50"
            />
          </button>

          <!-- Add Review Button (when authenticated and can comment) -->
          <button
            v-else-if="isAuthenticated && can_comment"
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

          <!-- Sign In Button (when not authenticated) -->
          <button
            v-else-if="!isAuthenticated && can_comment"
            @click="navigateToLogin"
            class="bg-gold hover:bg-[#CE8F00] text-black h-10 sm:h-12 px-4 sm:px-10 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-medium transition-all duration-300 text-sm sm:text-base"
          >
            <p>Sign in to review</p>
            <img
              src="../../assets/icons/plus.svg"
              alt="Add"
              class="w-4 h-4 sm:w-5 sm:h-5 brightness-0"
            />
          </button>

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

    <!-- Loading State -->
    <div v-if="commentsLoading" class="flex items-center justify-center py-12">
      <div class="text-gray-500">Loading comments...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="displayedComments.length === 0" class="text-center py-12">
      <div class="text-gray-500 mb-4">
        <IconsCommenticon class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg">No comments yet</p>
        <p class="text-sm">Be the first to share your thoughts!</p>
      </div>
    </div>

    <!-- Comments Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full">
      <CommentCard
        v-for="comment in displayedComments"
        :key="comment.id"
        :comment="comment"
      />
    </div>

    <!-- See More Button -->
    <button
      v-if="hasMoreComments"
      class="flex bg-gold text-black w-41 rounded-[10px] justify-center h-11 items-center px-5 gap-3 btn"
      @click="loadMoreComments"
      :disabled="loadingMore"
    >
      <p>{{ loadingMore ? "Loading..." : "See More" }}</p>
      <IconsDown />
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useModal } from "#imports";
import { ContentInteractionService } from "~/api/services/content-interaction.service";
import type { Comment, Interactions } from "~/src/types/content";
import CommentCard from "~/components/CommentCard/CommentCard.vue";

const props = defineProps<{
  contentId: string;
  interactions: Interactions;
}>();

const authStore = useAuthStore();
const modal = useModal();

// State
const comments = ref<Comment[]>([]);
const commentsLoading = ref(false);
const loadingMore = ref(false);
const isDropdownOpen = ref(false);
const selectedOption = ref("Latest");
const currentPage = ref(1);
const commentsPerPage = 8;

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const can_comment = computed(() => props.interactions?.can_comment || false);
const commentStats = computed(
  () =>
    props.interactions?.comments || {
      total_count: 0,
      top_level_count: 0,
      replies_count: 0,
    }
);

const displayedComments = computed(() => {
  const startIndex = 0;
  const endIndex = currentPage.value * commentsPerPage;
  return comments.value.slice(startIndex, endIndex);
});

const hasMoreComments = computed(() => {
  return comments.value.length > displayedComments.value.length;
});

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectOption = (option: string) => {
  selectedOption.value = option;
  isDropdownOpen.value = false;
};

const loadComments = async () => {
  if (commentsLoading.value) return;

  commentsLoading.value = true;
  try {
    const response = await ContentInteractionService.getContentComments(
      props.contentId
    );
    comments.value = response.data;
    // Sort comments after loading
    sortComments();
  } catch (error) {
    console.error("Failed to load comments:", error);
  } finally {
    commentsLoading.value = false;
  }
};

const loadMoreComments = () => {
  if (loadingMore.value) return;

  loadingMore.value = true;
  // Simulate loading more comments
  setTimeout(() => {
    currentPage.value++;
    loadingMore.value = false;
  }, 500);
};

const navigateToLogin = () => {
  navigateTo("/login");
};

// Watch for sort option changes
watch(selectedOption, () => {
  sortComments();
});

const sortComments = () => {
  if (selectedOption.value === "Latest") {
    // Sort by created_at descending
    comments.value.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else {
    // Sort by created_at ascending
    comments.value.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
};

// Lifecycle
onMounted(() => {
  loadComments();

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target && target.closest) {
      const dropdown = target.closest(".relative");
      if (!dropdown) {
        isDropdownOpen.value = false;
      }
    }
  });
});
</script>