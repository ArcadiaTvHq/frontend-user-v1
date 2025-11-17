<template>
  <div
    class="bg-body fixed top-0 left-0 z-100 h-screen w-screen bg-[url(../../assets/signup/bg.png)] bg-cover bg-blend-overlay flex justify-center items-center font-orbitron"
    v-if="review"
  >
    <div
      class="fixed z-105 opacity-75 h-screen w-screen"
      @click="handleCancel"
    ></div>
    <div
      class="absolute z-108 text-white max-w-200 w-3/5 bg-black flex-col flex h-4/5 px-20 border-[#5B5B5B] border-1 rounded-[18px] py-15 gap-10"
    >
      <h1 class="text-center font-bold text-[30px]">
        Rate {{ props.content?.title || "this show" }}
      </h1>
      <div>
        <div>
          <div class="flex gap-8">
            <div class="w-1/4 flex flex-col gap-1">
              <h1 class="text-[36px]">
                {{
                  parseFloat(
                    props.content?.interactions.rating.average
                  ).toFixed(1)
                }}
              </h1>
              <div class="flex">
                <span v-for="i in 5" :key="i" class="text-base leading-none">
                  <span
                    class="text-yellow-400"
                    v-if="i <= props.content?.interactions.rating.average"
                    >★</span
                  >
                  <span class="text-gray-600" v-else>★</span>
                </span>
              </div>
              <!-- <p>Rate out of 5</p> -->
            </div>
            <div class="w-2/3 flex flex-col gap-3">
              <div v-for="i in 5" class="flex w-full items-center gap-1">
                <div>{{ 6 - i }}</div>
                <div class="h-2 rounded-[4px] w-full bg-gray-600">
                  <div
                    class="h-full bg-gold rounded-[4px] transition-all duration-300"
                    :style="{
                      width:
                        props.content?.interactions?.rating?.breakdown &&
                        props.content?.interactions?.rating?.total
                          ? `${
                              (props.content.interactions.rating.breakdown[
                                6 - i
                              ] /
                                props.content.interactions.rating.total) *
                              100
                            }%`
                          : '0%',
                    }"
                  ></div>
                </div>
                <div class="text-sm text-gray-300 min-w-[40px] text-right">
                  {{
                    props.content?.interactions?.rating?.breakdown &&
                    props.content?.interactions?.rating?.total
                      ? `${Math.round(
                          (props.content.interactions.rating.breakdown[6 - i] /
                            props.content.interactions.rating.total) *
                            100
                        )}%`
                      : "0%"
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 justify-center">
        <div
          v-for="rate in rating"
          :key="rate.rating"
          @click="setRating(parseInt(rate.rating))"
          class="border-gold border-[1px] rounded-[15px] h-16 w-1/4 flex items-center justify-center cursor-pointer transition-all hover:bg-gold hover:text-black px-3"
          :class="
            parseInt(rate.rating) === selectedRating ? 'bg-gold text-black' : ''
          "
        >
          <span class="flex gap-1 text-center"
            ><img :src="rate.img" /> <span>{{ rate.rating }}</span>
            <span>- {{ rate.content }}</span></span
          >
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <input
          v-model="comment"
          class="border-gold border-[1px] rounded-[8px] bg-none h-12 bg-[#0B0B0B] p-4 text-white placeholder-gray-400"
          type="text"
          placeholder="Drop a comment"
        />
        <textarea
          v-model="reviewText"
          class="border-gold border-[1px] rounded-[8px] bg-none h-24 bg-[#0B0B0B] p-4 text-white placeholder-gray-400 resize-none"
          placeholder="Write a detailed review (optional)"
        ></textarea>
      </div>
      <div class="flex justify-end gap-6">
        <button
          @click="handleCancel"
          class="btn bg-[#0B0B0B] text-white border-gold border-[1px] w-32 h-11 rounded-[15px] hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="selectedRating === 0 || submitting"
          class="btn bg-gold text-black border-gold border-[1px] w-32 h-11 rounded-[15px] hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? "Submitting..." : "Submit" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useModal } from "#imports";
import { ContentInteractionService } from "~/api/services/content-interaction.service";
import rage from "../../assets/icons/Rage.svg";
import unamused from "../../assets/icons/Unamused.svg";
import neutral from "../../assets/icons/Neutral-face.svg";
import warm from "../../assets/icons/Warm-smile.svg";
import heart from "../../assets/icons/Heart-eyes.svg";

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

const modal = useModal();
const review = computed(() => modal.isReview);

// State
const selectedRating = ref(0);
const comment = ref("");
const reviewText = ref("");
const submitting = ref(false);

const rating = [
  { img: rage, rating: "1", content: "Terrible" },
  { img: unamused, rating: "2", content: "Bad" },
  { img: neutral, rating: "3", content: "Meh" },
  { img: warm, rating: "4", content: "Good" },
  { img: heart, rating: "5", content: "Excellent" },
];

// Methods
const setRating = (rating) => {
  selectedRating.value = rating;
};

const handleCancel = () => {
  // Reset form
  selectedRating.value = 0;
  comment.value = "";
  reviewText.value = "";
  submitting.value = false;

  // Close modal
  modal.toggleReview();
};

const handleSubmit = async () => {
  if (selectedRating.value === 0) return;

  // Validate that comment is not empty
  if (!comment.value.trim()) {
    alert("Please enter a comment before submitting.");
    return;
  }

  submitting.value = true;

  try {
    // Get content ID from the content prop
    if (!props.content || !props.content.id) {
      throw new Error("Content not found");
    }

    // Submit the comment/review
    await ContentInteractionService.submitComment({
      content_id: props.content.id,
      comment: comment.value.trim(),
      rating: selectedRating.value,
    });

    // Close modal and reset form
    handleCancel();

    // You could add a success toast here
  } catch (error) {
    console.error("Failed to submit review:", error);
    // You could add an error toast here
  } finally {
    submitting.value = false;
  }
};
</script>